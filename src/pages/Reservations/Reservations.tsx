/**
 * FileName: Reservations.tsx
 * Description: Reservations page component, which displays a list of destinations and allows users to assign reservations to each destination.
 * Authors: Original Moncarca team
 * Last Modification made: 
 * 04/05/2026 - [Santiago Coronado Hernández] Added file size validation for uploaded files and enhanced error handling to provide user-friendly messages when file size exceeds limits. Also implemented localStorage persistence for form data to prevent data loss on page refreshes or accidental navigations away from the page.
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
  const { handleVisitPage, tutorial } = useApp();
  const { t } = useTranslation();
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
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
        setRequest({
          ...response,
          requests_destinations: (response.requests_destinations || []).map((destination: any) => ({
            ...destination,
            origin: `${response.destination?.city || response.destination?.iata_code || t('reservations.unavailable')}${response.destination?.country ? `, ${response.destination.country}` : ""}`,
            origin_city:
              response.destination?.city ||
              response.destination?.iata_code ||
              t('reservations.unavailable'),
            origin_country: response.destination?.country || "",
            destination_full: `${destination.destination?.city || destination.destination?.iata_code || t('reservations.unavailable')}${destination.destination?.country ? `, ${destination.destination.country}` : ""}`,
            destination_city:
              destination.destination?.city ||
              destination.destination?.iata_code ||
              t('reservations.unavailable'),
            destination_country: destination.destination?.country || "",
            departure_date: formatDate(destination.departure_date),
            arrival_date: formatDate(destination.arrival_date),
            hotel_required: destination.is_hotel_required ? t('reservations.yes') : t('reservations.no'),
            plane_required: destination.is_plane_required ? t('reservations.yes') : t('reservations.no'),
            stay_days: destination.stay_days,
            details: destination.details,
          })),
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

    const updatedFormData = {
      ...formData,
      [id]: {
        ...formData[id],
        [name]: file,
        [`${name}_name`]: fileName,
        [`${name}_preview`]: previewUrl,
      },
    };
    setFormData(updatedFormData);
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
    const updatedFormData = {
      ...formData,
      [id]: {
        ...formData[id],
        [name]: value,
      }
    };
    setFormData(updatedFormData);
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
    // Format the formData to match the API requirements
    const formattedData = {
      reservations: Object.entries(formData).flatMap(([key, value]) => {
        const hotelReservation = value.hotel_title && {
          title: value.hotel_title,
          comments: value.hotel_comments,
          price: parseFloat(value.hotel_price),
          file: value.hotel_file,
          id_request_destination: key,
        };
        const planeReservation = value.plane_title && {
          title: value.plane_title,
          comments: value.plane_comments,
          price: parseFloat(value.plane_price),
          file: value.plane_file,
          id_request_destination: key,
        };
        return [hotelReservation, planeReservation].filter(Boolean);
      }),
    };
    // Compute the length depending if each request destination has hotel or plane or both
    const requestDestinations = request.requests_destinations || [];
    const hotelLength = requestDestinations.filter((destination: any) => destination.is_hotel_required).length;
    const planeLength = requestDestinations.filter((destination: any) => destination.is_plane_required).length;
    const totalLength = hotelLength + planeLength;
    if (formattedData.reservations.length !== totalLength) {
      toast.error(t('reservations.fillRequired'));
      return;
    }
    // Check if the form is valid
    const isValid = Object.values(formData).every((data, index) => {
      // Get the key of the currrent value
      const key = Object.keys(formData)[index];
      const hotelValid = data.hotel_title && data.hotel_comments && data.hotel_file;
      const planeValid = data.plane_title && data.plane_comments && data.plane_file;
      const requestDestination = requestDestinations.find((destination: any) => destination.id === key);
      if (!requestDestination) {
        return false;
      }
      // Check if hotel or plane is required
      if (requestDestination.is_hotel_required && requestDestination.is_plane_required) {
        return hotelValid && planeValid;
      } else if (requestDestination.is_hotel_required && !requestDestination.is_plane_required) {
        return hotelValid;
      } else if (requestDestination.is_plane_required && !requestDestination.is_hotel_required) {
        return planeValid;
      }
      return true;
    });
    if (!isValid) {
      toast.error(t('reservations.fillRequired'));
      return;
    }
    // Send the data to the API
    const responses = await Promise.all(
      formattedData.reservations.map(async (reservation) => {
        const formData = new FormData();
        formData.append("title", reservation.title);
        formData.append("comments", reservation.comments);
        formData.append("price", reservation.price);
        formData.append("file", reservation.file);
        formData.append("id_request_destination", reservation.id_request_destination);
        try {
          await postRequest("/reservations", formData);
        } catch (error) {
          console.error("Error sending data:", error);
        }
      })
    );
    if (responses) {
      toast.success(t('reservations.success'));
      isPersistenceEnabledRef.current = false;
      setFormData({});
      window.localStorage.removeItem(reservationDraftStorageKey);
      await patchRequest(`/requests/finished-reservations/${requestId}`, {});
      navigate("/dashboard");
    } else {
      toast.error(t('reservations.sendError'));
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
        <div className="p-10 mx-auto">
          <h2 className="text-2xl font-bold text-[var(--color-page-text-title)] mb-4">
            {t('reservations.title')}
          </h2>
          <form
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="">
              {request?.requests_destinations?.map((destination: any) => (
                <div
                  key={destination.id}
                  className="rounded-md p-4 mb-6 space-y-4 bg-[var(--color-page-bg)] shadow-sm"
                >
                  <h3 className="font-bold text-gray-500">{t('reservations.destination')} #{destination.destination_order}</h3>
                  <div>

                  </div>
                  <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8" id="reservation-info">
                    {labels.map(({ key, label }) => (
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
                          value={destination[key] || ""}
                          className="w-full bg-[var(--color-card-bg)] text-[var(--color-page-text)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                        />
                      </div>
                    ))}
                  </section>
                  <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    {destination.is_hotel_required && (
                      <div className="flex flex-col gap-y-4" id="hotel-reservation">
                        <h3 className="text-[var(--blue)] mb-4 font-bold">{t('reservations.hotelInfo')}</h3>
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
                              className="w-full bg-[var(--color-card-bg)] text-[var(--color-page-text)] border-[var(--color-border)] rounded-lg px-3 py-2"
                              placeholder={t('reservations.flightPricePlaceholder')}
                              value={formData[destination.id]?.plane_price ?? "0.00"}
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
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                id="assign-reservations"
                className={`px-4 py-2 rounded-md transition-colors ${isFormValid
                    ? "bg-[#0a2c6d] text-white hover:bg-[#0d3d94]"
                    : "bg-gray-400 text-white cursor-not-allowed"
                  }`}
              >
                {t('reservations.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Tutorial>
  );
};

export default Reservations;