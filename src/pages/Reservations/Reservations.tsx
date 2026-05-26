/**
 * FileName: Reservations.tsx
 * Description: Reservations page component, which displays a list of destinations and allows users to assign reservations to each destination.
 * Authors: Original Moncarca team
 * Last Modification made: 
 * 20/05/2026 [Jin Sik Yoon] Added internationalization and some UI copy improvements.
 */
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Input from "../../components/Refunds/InputField";
import TextArea from "../../components/Refunds/TextArea";
import { toast } from "react-toastify";
import { getRequest, patchRequest } from "../../utils/apiService";
import formatDate from "../../utils/formatDate";
import { postRequest } from "../../utils/apiService";
import { useTranslation } from "react-i18next";
import { Tutorial } from "../../components/Tutorial";
import { useApp } from "../../hooks/app/appContext";
import { isFileSizeValid, getFileSizeErrorMessage } from "../../utils/fileValidation";
import FlightReservationOptions from "../../components/flights/FlightReservationOptions";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

/**
 * FunctionName: Reservations
 * Purpose of the function: to display the reservations page.
 * Input: none
 * Output: none
 * Author: Original Moncarca team
 * Last Modification made: original Moncarca team
 */
export const Reservations = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const requestId =
    id ||
    (typeof window !== "undefined"
      ? window.location.pathname.split("/").filter(Boolean).pop()
      : undefined);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [request, setRequest] = useState<any>({});
  const [isFormValid, _setIsFormValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleVisitPage, tutorial } = useApp();
  const { t } = useTranslation();
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, Record<string, string>>>({});
  const [collapsedDestinations, setCollapsedDestinations] = useState<Set<string>>(new Set());

  const toggleDestination = (id: string) => {
    setCollapsedDestinations(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const isDraftHydratedRef = useRef(false);
  const hasSkippedInitialPersistRef = useRef(false);
  const isPersistenceEnabledRef = useRef(true);
  const reservationDraftStorageKey = requestId
    ? `reservationsFormDraft:${requestId}`
    : "reservationsFormDraft:unknown";

  const getPersistableFormData = (data: Record<string, any>) => {
    return Object.fromEntries(
      Object.entries(data).map(([destinationId, values]) => {
        const cleanedValues = Object.fromEntries(
          Object.entries(values || {}).filter(([fieldName]) => {
            return (
              !fieldName.endsWith("_file") &&
              !fieldName.endsWith("_file_name") &&
              !fieldName.endsWith("_preview")
            );
          })
        );

        return [destinationId, cleanedValues];
      })
    );
  };

  useEffect(() => {
    if (!requestId || typeof window === "undefined") {
      isDraftHydratedRef.current = true;
      return;
    }

    try {
      const rawDraft = window.localStorage.getItem(reservationDraftStorageKey);
      if (rawDraft) {
        setFormData(JSON.parse(rawDraft));
      }
    } catch {
      window.localStorage.removeItem(reservationDraftStorageKey);
    } finally {
      isDraftHydratedRef.current = true;
    }
  }, [id, reservationDraftStorageKey]);

  useEffect(() => {
    if (
      !requestId ||
      typeof window === "undefined" ||
      !isDraftHydratedRef.current
    ) {
      return;
    }

    if (!isPersistenceEnabledRef.current) {
      return;
    }

    if (!hasSkippedInitialPersistRef.current) {
      hasSkippedInitialPersistRef.current = true;
      return;
    }

    try {
      const safeFormData = getPersistableFormData(formData);
      window.localStorage.setItem(
        reservationDraftStorageKey,
        JSON.stringify(safeFormData)
      );
    } catch {
      // Ignore localStorage write errors to keep the form usable.
    }
  }, [formData, requestId, reservationDraftStorageKey]);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        // Simulate an API call to fetch data
        const response = await getRequest(`/requests/${requestId}`);
        const sortedDests = [...(response.requests_destinations || [])].sort(
          (a: any, b: any) => a.destination_order - b.destination_order
        );

        const mappedDests = sortedDests.map((destination: any, idx: number) => {
          // Origin of leg #N = destination city of leg #(N-1), or the request's origin city for the first leg
          const prevDest = idx > 0 ? sortedDests[idx - 1] : null;
          const originCity = prevDest
            ? prevDest.destination?.city || prevDest.destination?.iata_code || t('reservations.unavailable')
            : response.destination?.city || response.destination?.iata_code || t('reservations.unavailable');
          const originCountry = prevDest
            ? prevDest.destination?.country || ""
            : response.destination?.country || "";
          return {
            ...destination,
            origin: `${originCity}${originCountry ? `, ${originCountry}` : ""}`,
            origin_city: originCity,
            origin_country: originCountry,
            destination_full: `${destination.destination?.city || destination.destination?.iata_code || t('reservations.unavailable')}${destination.destination?.country ? `, ${destination.destination.country}` : ""}`,
            destination_city:
              destination.destination?.city ||
              destination.destination?.iata_code ||
              t('reservations.unavailable'),
            destination_country: destination.destination?.country || "",
            departure_date: formatDate(destination.departure_date),
            arrival_date: formatDate(destination.arrival_date),
            departure_date_raw: destination.departure_date,
            arrival_date_raw: destination.arrival_date,
            hotel_required: destination.is_hotel_required ? t('reservations.yes') : t('reservations.no'),
            plane_required: destination.is_plane_required ? t('reservations.yes') : t('reservations.no'),
            stay_days: destination.stay_days,
            details: destination.details,
          };
        });

        // Synthesize return leg if last destination has a return date
        const lastReal = mappedDests[mappedDests.length - 1];
        if (lastReal?.arrival_date_raw) {
          const returnOriginCity = lastReal.destination_city;
          const returnOriginCountry = lastReal.destination_country;
          const returnDestCity = response.destination?.city || response.destination?.iata_code || t('reservations.unavailable');
          const returnDestCountry = response.destination?.country || "";
          mappedDests.push({
            // Synthetic entry — uses real last-destination ID suffixed with ':return'
            // so we can strip the suffix when submitting to the API
            id: lastReal.id + ':return',
            destination_order: mappedDests.length + 1,
            is_synthetic_return: true,
            // origin = last real destination's city
            origin: `${returnOriginCity}${returnOriginCountry ? `, ${returnOriginCountry}` : ""}`,
            origin_city: returnOriginCity,
            origin_country: returnOriginCountry,
            // destination = request origin city (trip starts and ends here)
            destination: {
              iata_code: response.destination?.iata_code,
              city: response.destination?.city,
              country: response.destination?.country,
            },
            destination_full: `${returnDestCity}${returnDestCountry ? `, ${returnDestCountry}` : ""}`,
            destination_city: returnDestCity,
            destination_country: returnDestCountry,
            departure_date: formatDate(lastReal.arrival_date_raw),
            departure_date_raw: lastReal.arrival_date_raw,
            arrival_date: "",
            arrival_date_raw: undefined,
            is_hotel_required: false,
            is_plane_required: true,
            hotel_required: t('reservations.no'),
            plane_required: t('reservations.yes'),
            stay_days: 0,
            details: "",
          });
        }

        setRequest({
          ...response,
          requests_destinations: mappedDests,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(t('refunds.errorLoading'));
      }
    }
    fetchRequest();
  }, [requestId]);

  useEffect(() => {
    // Get the visited pages from localStorage
    const visitedPages = JSON.parse(localStorage.getItem("visitedPages") || "[]");
    // Check if the current page is already in the visited pages
    const isPageVisited = visitedPages.includes(location.pathname);

    // If the page is not visited, set the tutorial to true
    if (!isPageVisited) {
      // setTutorial(true);
    }
    // Add the current page to the visited pages
    handleVisitPage();
  }, []);

  useEffect(() => {
    if (!activePreview) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePreview(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activePreview]);

  /**
 * FunctionName: handleFileChange
 * Purpose of the function: to handle the file change event.
 * Input: e: React.ChangeEvent<HTMLInputElement>, id: string
 * Output: none
 * Author: Original Moncarca team
 * Last Modification made: original Moncarca team
 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const { name, files } = e.target;
    const file = files ? files[0] : null;

    if (!file) return;

    // Validate file size first
    if (!isFileSizeValid(file)) {
      setFileErrors((prev) => ({
        ...prev,
        [`${id}_${name}`]: getFileSizeErrorMessage(file.name, file.size),
      }));
      e.target.value = "";
      return;
    }

    const allowedMimeTypes = [
      "application/pdf",
      "application/xml",
      "text/xml",
    ];

    const allowedExtensions = [".pdf", ".xml"];
    const fileName = file.name;
    const fileExtension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();

    const isValidMimeType = allowedMimeTypes.includes(file.type);
    const isValidExtension = allowedExtensions.includes(fileExtension);

    const errorKey = `${id}_${name}`;

    // invalid file → set error message
    if (!isValidMimeType || !isValidExtension) {
      setFileErrors((prev) => ({
        ...prev,
        [errorKey]: t('reservations.invalidFormat'),
      }));
      e.target.value = "";

      return;
    }

    // valid file → clear error message, set preview URL, and update form data
    setFileErrors((prev) => ({
      ...prev,
      [errorKey]: "",
    }));

    const previewUrl = URL.createObjectURL(file);

    setFormData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [name]: file,
        [`${name}_name`]: fileName,
        [`${name}_preview`]: previewUrl,
      },
    }));
    if (fieldErrors[id]?.[name]) {
      setFieldErrors(prev => ({ ...prev, [id]: { ...prev[id], [name]: '' } }));
    }
  };

  /**
 * FunctionName: handleChange
 * Purpose of the function: to handle the change event.
 * Input: e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string
 * Output: none
 * Author: Original Moncarca team
 * Last Modification made: original Moncarca team
 */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: { ...prev[id], [name]: value } }));
    if (fieldErrors[id]?.[name]) {
      setFieldErrors(prev => ({ ...prev, [id]: { ...prev[id], [name]: '' } }));
    }
  };

  const handlePriceWheel = (
    e: React.WheelEvent<HTMLInputElement>,
    id: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopImmediatePropagation();

    const { name, value } = e.currentTarget;
    const current = Number(value || 0);

    const next =
      e.deltaY < 0 ? current + 1 : Math.max(0, current - 1);

    setFormData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [name]: next.toFixed(2),
      },
    }));
  };

  const applyFlightOption = ({
    destinationId,
    flight,
    segmentIndex,
  }: {
    destinationId: string;
    flight: any;
    segmentIndex: number;
  }) => {
    const firstSegment = flight.segments?.[0];
    const lastSegment = flight.segments?.[flight.segments.length - 1];
    const routeLabel = firstSegment && lastSegment
      ? `${firstSegment.origin_airport_code} → ${lastSegment.destination_airport_code}`
      : t('reservations.selectedFlight');

    setFormData((prev) => ({
      ...prev,
      [destinationId]: {
        ...prev[destinationId],
        plane_title: `${flight.airline || flight.provider_name} - ${routeLabel}`,
        plane_comments: `Proveedor: ${flight.provider_name}. Oferta: ${flight.provider_offer_id}. Precio original: ${flight.original_price} ${flight.original_currency}.`,
        plane_price: Number(flight.total_price_mxn || 0).toFixed(2),
        plane_link: flight.provider_offer_id,
        plane_price_locked: true,  // lock price to prevent accidental edits
      },
    }));

    const selectedDestination = request.requests_destinations?.find(
      (destination: any) => destination.id === destinationId
    );

    const destinationName =
      selectedDestination?.destination_city ||
      selectedDestination?.destination?.city ||
      t('reservations.destination');

    toast.success(
      t('reservations.flightAppliedSuccess', {
        destination: destinationName,
        segment: segmentIndex + 1,
      })
    );
  };

  const setPageScroll = (enabled: boolean) => {
    document.body.style.overflow = enabled ? "auto" : "hidden";
  };

  /**
 * FunctionName: handleSubmit
 * Purpose of the function: to handle the submit event.
 * Input: e: React.FormEvent
 * Output: none
 * Author: Original Moncarca team
 * Last Modification made: original Moncarca team
 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData === null || Object.keys(formData).length === 0) {
      toast.error(t('reservations.fillRequired'));
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    // Format the formData to match the API requirements
    const formattedData = {
      reservations: Object.entries(formData).flatMap(([key, value]) => {
        // Synthetic return leg: strip ':return' suffix to get the real destination ID
        const realDestId = key.endsWith(':return') ? key.slice(0, -7) : key;

        const hotelReservation = value.hotel_title && {
          title: value.hotel_title,
          comments: value.hotel_comments,
          price: parseFloat(value.hotel_price),
          file: value.hotel_file,
          id_request_destination: realDestId,
        };

        // Detect whether the flight link comes from Duffel (offer IDs start with 'off_')
        const isDuffelFlight = typeof value.plane_link === 'string' && value.plane_link.startsWith('off_');
        const planeReservation = value.plane_title && {
          title: value.plane_title,
          comments: value.plane_comments,
          price: parseFloat(value.plane_price),
          link: value.plane_link,
          file: value.plane_file,
          id_request_destination: realDestId,
          ...(isDuffelFlight && {
            provider_id: 'duffel',
            provider_name: 'Duffel',
          }),
        };
        return [hotelReservation, planeReservation].filter(Boolean);
      }),
    };
    // Validate all fields and collect inline errors
    const requestDestinations = request.requests_destinations || [];
    const newFieldErrors: Record<string, Record<string, string>> = {};
    let hasErrors = false;
    const required = t('common.fieldRequired');

    for (const dest of requestDestinations) {
      const data = formData[dest.id] || {};
      const destErrors: Record<string, string> = {};
      newFieldErrors[dest.id] = destErrors;
      if (dest.is_hotel_required) {
        if (!data.hotel_title)    { destErrors.hotel_title    = required; hasErrors = true; }
        if (!data.hotel_comments) { destErrors.hotel_comments = required; hasErrors = true; }
        if (!data.hotel_price || parseFloat(data.hotel_price) <= 0) { destErrors.hotel_price = required; hasErrors = true; }
        if (!data.hotel_file)     { destErrors.hotel_file     = required; hasErrors = true; }
      }
      if (dest.is_plane_required) {
        if (!data.plane_title)                          { destErrors.plane_title    = required; hasErrors = true; }
        if (!data.plane_comments)                       { destErrors.plane_comments = required; hasErrors = true; }
        if (!data.plane_price || data.plane_price === "0.00") { destErrors.plane_price = required; hasErrors = true; }
        if (!data.plane_file && !data.plane_link)       { destErrors.plane_file     = required; hasErrors = true; }
      }
    }

    setFieldErrors(newFieldErrors);
    if (hasErrors) {
      toast.error(t('reservations.fillRequired'));
      setIsSubmitting(false);
      return;
    }
    // Send the data to the API
    try {
      await Promise.all(
        formattedData.reservations.map(async (reservation) => {
          const reservationFormData = new FormData();
          reservationFormData.append("title", reservation.title);
          reservationFormData.append("comments", reservation.comments);
          reservationFormData.append("price", reservation.price);
          if (reservation.link) {
            reservationFormData.append("link", reservation.link);
          }
          if (reservation.provider_id) {
            reservationFormData.append("provider_id", reservation.provider_id);
          }
          if (reservation.provider_name) {
            reservationFormData.append("provider_name", reservation.provider_name);
          }
          if (reservation.file) {
            reservationFormData.append("file", reservation.file);
          }
          reservationFormData.append("id_request_destination", reservation.id_request_destination);
          await postRequest("/reservations", reservationFormData);
        })
      );
      toast.success(t('reservations.success'));
      isPersistenceEnabledRef.current = false;
      setFormData({});
      window.localStorage.removeItem(reservationDraftStorageKey);
      await patchRequest(`/requests/finished-reservations/${requestId}`, {});
      navigate("/dashboard");
    } catch (error) {
      console.error("Error sending data:", error);
      toast.error(t('reservations.sendError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  const labels: { key: keyof typeof request; label: string }[] = [
    { key: 'origin', label: t('reservations.origin') },
    { key: 'destination_full', label: t('reservations.destination') },
    { key: 'departure_date', label: t('reservations.departureDate') },
    { key: 'arrival_date', label: t('reservations.arrivalDate') },
    { key: 'details', label: t('reservations.details') },
    { key: 'hotel_required', label: t('reservations.needsHotel') },
    { key: 'plane_required', label: t('reservations.needsFlight') },
    { key: 'stay_days', label: t('reservations.stayDays') },
  ];

  return (
    <Tutorial page="reservations" run={tutorial}>
      <div className="bg-[var(--color-card-bg)] rounded-md mb-10 max-w-5xl mx-auto">
        <div className="p-5 lg:p-10 mx-auto">
          <h2 className="text-2xl font-bold text-[var(--color-page-text-title)] mb-4">
            {t('reservations.title')}
          </h2>
          {request?.requests_destinations?.length > 0 && (
            <FlightReservationOptions
              request={request}
              onSelectFlight={applyFlightOption}
            />
          )}
          <form
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="">
              {[...(request?.requests_destinations || [])]
                .sort((a: any, b: any) => a.destination_order - b.destination_order)
                .map((destination: any) => (
                <div
                  key={destination.id}
                  className="rounded-2xl mb-6 bg-[var(--color-page-bg)] shadow-md overflow-hidden border border-[var(--color-border)]"
                >
                  <button
                    type="button"
                    onClick={() => toggleDestination(destination.id)}
                    className="w-full flex items-center justify-between px-6 py-4 bg-[var(--blue)] text-white hover:bg-[var(--dark-blue)] transition-colors"
                  >
                    <span className="text-base font-semibold tracking-wide">
                      {t('reservations.destination')} #{destination.destination_order}
                      {destination.origin && destination.destination_city && (
                        <span className="ml-3 text-sm font-normal opacity-80">
                          {destination.origin_city} → {destination.destination_city}
                        </span>
                      )}
                    </span>
                    {collapsedDestinations.has(destination.id) ? <FiChevronDown size={20} /> : <FiChevronUp size={20} />}
                  </button>

                  {!collapsedDestinations.has(destination.id) && (
                  <div className="p-6 space-y-6">
                  <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-2" id="reservation-info">
                    {labels.map(({ key, label }) => {
                      const val = destination[key];
                      if (val === "" || val === null || val === undefined || val === 0) return null;
                      return (
                        <div key={key as string}>
                          <label
                            htmlFor={key as string}
                            className="block text-xs font-semibold text-gray-500 mb-1"
                          >
                            {label}
                          </label>
                          <input
                            id={key as string}
                            type="text"
                            readOnly
                            value={String(val)}
                            className="w-full bg-[var(--color-card-bg)] text-[var(--color-page-text)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                          />
                        </div>
                      );
                    })}
                  </section>
                  <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    {destination.is_hotel_required && (
                      <div className="flex flex-col gap-y-4" id="hotel-reservation">
                        <h3 className="text-[var(--color-page-text-title)] mb-4 font-bold">{t('reservations.hotelInfo')}</h3>
                        <div>
                          <label 
                            className="block mb-2 text-sm font-medium text-gray-500"
                            htmlFor={`hotel_title_${destination.id}`}
                          >
                            {t('reservations.titleField')}
                          </label>
                          <Input
                            placeholder={t('reservations.hotelTitlePlaceholder')}
                            value={formData[destination.id]?.hotel_title || ""}
                            onChange={(e) => handleChange(e, destination.id)}
                            name="hotel_title"
                            id={`hotel_title_${destination.id}`}
                            className="bg-[var(--color-card-bg)]"
                          />
                          {fieldErrors[destination.id]?.hotel_title && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors[destination.id]?.hotel_title}</p>
                          )}
                        </div>

                        <div>
                          <label
                            className="block mb-2 text-sm font-medium text-gray-500"
                            htmlFor={`hotel_comments_${destination.id}`}
                          >
                            {t('reservations.comments')}
                          </label>
                          <TextArea
                            placeholder={t('reservations.commentPlaceholder')}
                            value={formData[destination.id]?.hotel_comments || ""}
                            onChange={(e) => handleChange(e, destination.id)}
                            name="hotel_comments"
                            id={`hotel_comments_${destination.id}`}
                          />
                          {fieldErrors[destination.id]?.hotel_comments && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors[destination.id]?.hotel_comments}</p>
                          )}
                        </div>

                        <div>
                          <label 
                            className="block mb-2 text-sm font-medium text-gray-500"
                            htmlFor={`hotel_price_${destination.id}`}
                          >
                            {t('reservations.price')}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              className="w-full rounded-lg bg-[var(--color-card-bg)] text-[var(--color-page-text)] border border-[var(--color-border)] px-3 py-2"
                              placeholder={t('reservations.hotelPricePlaceholder')}
                              value={formData[destination.id]?.hotel_price ?? "0.00"}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                                  handleChange(e, destination.id);
                                }
                              }}
                              onWheel={(e) => handlePriceWheel(e, destination.id)}
                              onMouseEnter={() => setPageScroll(false)}
                              onMouseLeave={() => setPageScroll(true)}
                              onFocus={() => setPageScroll(false)}
                              onBlur={(e) => {
                                const value = e.target.value.trim();
                                e.target.value = value === "" ? "0.00" : Number(value).toFixed(2);
                                handleChange(e, destination.id);
                                setPageScroll(true);
                              }}
                              name="hotel_price"
                              type="text"
                              inputMode="decimal"
                              id={`hotel_price_${destination.id}`}
                            />
                            <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">MXN</span>
                          </div>
                          {fieldErrors[destination.id]?.hotel_price && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors[destination.id]?.hotel_price}</p>
                          )}
                        </div>

                        <div>
                          <label
                            className="block mb-2 text-sm font-medium text-gray-500"
                            htmlFor={`hotel_file_${destination.id}`}
                          >
                            {t('reservations.uploadHotelFiles')}
                          </label>

                          <Input
                            type="file"
                            accept="*"
                            onChange={(e) => handleFileChange(e, destination.id)}
                            name="hotel_file"
                            id={`hotel_file_${destination.id}`}
                            selectedFileName={formData[destination.id]?.hotel_file_name}
                          />
                          {fileErrors[`${destination.id}_hotel_file`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {fileErrors[`${destination.id}_hotel_file`]}
                            </p>
                          )}
                          {fieldErrors[destination.id]?.hotel_file && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors[destination.id]?.hotel_file}</p>
                          )}
                          {formData[destination.id]?.hotel_file_preview && (
                            <button
                              type="button"
                              onClick={() => setActivePreview(formData[destination.id].hotel_file_preview)}
                              className="mt-2 text-sm text-blue-600 underline cursor-pointer"
                            >
                              {t('reservations.filePreview')}
                            </button>
                          )}

                        </div>
                      </div>
                    )}
                    {destination.is_plane_required && (
                      <div className="flex flex-col gap-y-4" id="plane-reservation">
                        <h3 className="text-[var(--color-page-text-title)] mb-4 font-bold">{t('reservations.flightInfo')}</h3>
                        <div>
                          <label 
                            className="block mb-2 text-sm font-medium text-gray-500"
                            htmlFor={`plane_title_${destination.id}`}
                          >
                            {t('reservations.titleField')}
                          </label>
                          <Input
                            placeholder={t('reservations.hotelTitlePlaceholder')}
                            value={formData[destination.id]?.plane_title || ""}
                            onChange={(e) => handleChange(e, destination.id)}
                            name="plane_title"
                            id={`plane_title_${destination.id}`}
                          />
                          {fieldErrors[destination.id]?.plane_title && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors[destination.id]?.plane_title}</p>
                          )}
                        </div>

                        <div>
                          <label
                            className="block mb-2 text-sm font-medium text-gray-500"
                            htmlFor={`plane_comments_${destination.id}`}
                          >
                            {t('reservations.comments')}
                          </label>
                          <TextArea
                            placeholder={t('reservations.commentPlaceholder')}
                            value={formData[destination.id]?.plane_comments || ""}
                            onChange={(e) => handleChange(e, destination.id)}
                            name="plane_comments"
                            id={`plane_comments_${destination.id}`}
                          />
                          {fieldErrors[destination.id]?.plane_comments && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors[destination.id]?.plane_comments}</p>
                          )}
                        </div>

                        <div>
                          <label 
                            className="block mb-2 text-sm font-medium text-gray-500"
                            htmlFor={`plane_price_${destination.id}`}
                          >
                            {t('reservations.price')}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              className={`w-full rounded-lg border px-3 py-2 ${
                                formData[destination.id]?.plane_price_locked
                                  ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed opacity-75"
                                  : "bg-[var(--color-card-bg)] text-[var(--color-page-text)] border-[var(--color-border)]"
                              }`}
                              placeholder={t('reservations.flightPricePlaceholder')}
                              value={formData[destination.id]?.plane_price ?? "0.00"}
                              readOnly={!!formData[destination.id]?.plane_price_locked}
                              onChange={(e) => {
                                if (formData[destination.id]?.plane_price_locked) return;
                                const value = e.target.value;
                                if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                                  handleChange(e, destination.id);
                                }
                              }}
                              onWheel={(e) => {
                                if (!formData[destination.id]?.plane_price_locked) handlePriceWheel(e, destination.id);
                              }}
                              onMouseEnter={() => setPageScroll(false)}
                              onMouseLeave={() => setPageScroll(true)}
                              onFocus={() => setPageScroll(false)}
                              onBlur={(e) => {
                                if (!formData[destination.id]?.plane_price_locked) {
                                  const value = e.target.value.trim();
                                  e.target.value = value === "" ? "0.00" : Number(value).toFixed(2);
                                  handleChange(e, destination.id);
                                }
                                setPageScroll(true);
                              }}
                              onKeyDown={(e) => {
                                if (["e", "E", "+", "-"].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              name="plane_price"
                              type="text"
                              inputMode="decimal"
                              id={`plane_price_${destination.id}`}
                            />
                            <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">MXN</span>
                          </div>
                          {formData[destination.id]?.plane_price_locked && (
                            <p className="text-xs text-gray-500 mt-1">
                              {t('reservations.priceSetByDuffel')}{" "}
                              <button
                                type="button"
                                className="text-blue-600 underline"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    [destination.id]: {
                                      ...prev[destination.id],
                                      plane_price_locked: false,
                                    },
                                  }))
                                }
                              >
                                {t('reservations.editManually')}
                              </button>
                            </p>
                          )}
                          {fieldErrors[destination.id]?.plane_price && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors[destination.id]?.plane_price}</p>
                          )}
                        </div>

                        <div>
                          <label
                            className="block mb-2 text-sm font-medium text-gray-500"
                            htmlFor={`plane_link_${destination.id}`}
                          >
                            {t('reservations.flightReference')}
                          </label>
                          <Input
                            placeholder={t('reservations.flightReferencePlaceholder')}
                            value={formData[destination.id]?.plane_link || ""}
                            onChange={(e) => handleChange(e, destination.id)}
                            name="plane_link"
                            id={`plane_link_${destination.id}`}
                            className="bg-[var(--color-card-bg)]"
                          />
                        </div>

                        <div>
                          <label 
                            className="block mb-2 text-sm font-medium text-gray-500"
                            htmlFor={`plane_file_${destination.id}`}
                          >
                            {t('reservations.uploadFlightFiles')}
                          </label>
                          <Input
                            type="file"
                            accept="*"
                            onChange={(e) => handleFileChange(e, destination.id)}
                            name="plane_file"
                            id={`plane_file_${destination.id}`}
                            selectedFileName={formData[destination.id]?.plane_file_name}
                          />
                          {fileErrors[`${destination.id}_plane_file`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {fileErrors[`${destination.id}_plane_file`]}
                            </p>
                          )}
                          {fieldErrors[destination.id]?.plane_file && (
                            <p className="mt-1 text-sm text-red-600">{fieldErrors[destination.id]?.plane_file}</p>
                          )}
                          {formData[destination.id]?.plane_file_preview && (
                            <button
                              type="button"
                              onClick={() => setActivePreview(formData[destination.id].plane_file_preview)}
                              className="mt-2 text-sm text-blue-600 underline cursor-pointer"
                            >
                              {t('reservations.filePreview')}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </section>

                  </div>
                  )}
                </div>
              ))}

              {activePreview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <button
                    type="button"
                    onClick={() => setActivePreview(null)}
                    className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white rounded cursor-pointer"
                  >
                    X
                  </button>
                  <div className="bg-white rounded-lg p-1 w-[90%] max-w-4xl h-[90vh] relative">
                    <iframe
                      src={activePreview}
                      className="w-full h-full rounded"
                      title={t('reservations.filePreview')}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                id="assign-reservations"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md transition-colors ${!isSubmitting && isFormValid
                    ? "bg-[#0a2c6d] text-white hover:bg-[#0d3d94]"
                    : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
              >
                {isSubmitting ? t('common.loading') : t('reservations.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Tutorial>
  );
};

export default Reservations;