/**
 * RequestInfo.tsx
 * Description: Displays travel request details, destination/reservation data, and role-based request actions.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 04/06/2026 [Sergio Jiawei Xuan] Fixed stay_days tag to only render when stay_days > 0.
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { patchRequest, postRequest } from '../utils/apiService';
import GoBack from '../components/GoBack';
import formatMoney from '../utils/formatMoney';
import formatDate from '../utils/formatDate';
import { toast } from 'react-toastify';
import { getRequest } from '../utils/apiService';
import { Permission, useAuth } from '../hooks/auth/authContext';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { Tutorial } from '../components/Tutorial';

import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import FilePreviewer from '../components/Refunds/FilePreviewer';
import FilePreviewerReservation from '../components/Refunds/FilePreviewerReservation';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useApp } from '../hooks/app/appContext';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

/**
 * renderStatus, function to convert internal request status codes into user-friendly Spanish labels for display in the UI.
 * Inputs: status (string) - The internal status code of the request.
 * Returns: string - The user-friendly label corresponding to the status code.
 */
const renderStatus = (status: string, t: TFunction) => {
  switch (status) {
    case "Pending Review":      return t('status.pendingReview');
    case "Denied":              return t('status.denied');
    case "Cancelled":           return t('status.cancelled');
    case "Changes Needed":      return t('status.changesNeeded');
    case "Pending Reservations":return t('status.pendingReservations');
    case "Pending Accounting Approval": return t('status.pendingAccountingApproval');
    case "Pending Vouchers Approval":   return t('status.pendingVouchersApproval');
    case "In Progress":         return t('status.inProgress');
    case "Pending Refund Approval": return t('status.pendingRefundApproval');
    case "Completed":           return t('status.completed');
    default:                    return status;
  }
}

/**
 * renderProviderSupportStatus, maps backend provider compatibility codes to
 * user-friendly Spanish labels for request destination detail rendering.
 * Inputs: status (string | undefined) - Provider compatibility status code.
 * Returns: string - Human-readable status label.
 */
const renderProviderSupportStatus = (status: string | undefined, t: TFunction) => {
  switch (status) {
    case 'supported':      return t('providerStatus.supported');
    case 'unsupported':    return t('providerStatus.unsupported');
    case 'pending_provider':
    default:               return t('providerStatus.pending');
  }
};

/**
 * RequestInfo, renders request details and allows approval workflow actions according to permissions and status.
 * Inputs: None (reads request id from route params and user context from hooks).
 * Returns: JSX.Element - Request detail page content.
 */
const RequestInfo: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const requestId =
    id ||
    (typeof window !== 'undefined'
      ? window.location.pathname.split('/').filter(Boolean).pop()
      : undefined);
  const { authState } = useAuth();
  const [data, setData] = useState<any>({});
  const [comment, setComment] = useState('');
  const [agencies, setAgencies] = useState<any[]>([]);
  const [selectedAgency, setSelectedAgency] = useState('');
  const isDraftHydratedRef = React.useRef(false);
  const hasSkippedInitialPersistRef = React.useRef(false);
  const isPersistenceEnabledRef = React.useRef(true);
  const requestInfoDraftKey = requestId
    ? `requestInfoDraft:${requestId}`
    : 'requestInfoDraft:unknown';

  const [currentIndex, setCurrentIndex] = useState(0);
  const prevRef = React.useRef(null);
  const nextRef = React.useRef(null);

  const [currentIndexRes, setCurrentIndexRes] = useState(0);
  const prevRefRes = React.useRef(null);
  const nextRefRes = React.useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleVisitPage, tutorial } = useApp();
  const { t } = useTranslation();

  const normalizeAmount = (value: unknown): number | undefined => {
    if (value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }

    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  };

  const getStoredDraft = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const rawDraft = window.localStorage.getItem(requestInfoDraftKey);
      return rawDraft
        ? (JSON.parse(rawDraft) as { comment?: string; selectedAgency?: string })
        : null;
    } catch {
      window.localStorage.removeItem(requestInfoDraftKey);
      return null;
    }
  };

  const clearRequestInfoDraft = () => {
    if (typeof window === 'undefined') {
      return;
    }

    isPersistenceEnabledRef.current = false;
    window.localStorage.removeItem(requestInfoDraftKey);
  };

  useEffect(() => {
    /**
     * fetchData, loads request data from API and normalizes fields for UI display.
     * Inputs: None, it uses route id from closure scope.
     * Returns: Promise<void> - Updates component state.
     */
    const fetchData = async () => {
      try {
        const response = await getRequest(`/requests/${requestId}`);
        const draft = getStoredDraft();
        const normalizedAdvanceMoney = normalizeAmount(response.advance_money);
        const normalizedUnconvertedAdvanceMoney = normalizeAmount(
          response.unconverted_advance_money,
        );
        const effectiveAdvanceMoney =
          normalizedUnconvertedAdvanceMoney ?? normalizedAdvanceMoney ?? 0;
        const reservations = (response.requests_destinations || [])
          .map((dest: any) => dest.reservations)
          .flat();
          
        const sortedDests = [...(response.requests_destinations || [])].sort(
          (a: any, b: any) => a.destination_order - b.destination_order
        );

        const mappedDests = sortedDests.map((destination: any, idx: number) => {
          const prevDest = idx > 0 ? sortedDests[idx - 1] : null;
          const originCity = prevDest
            ? prevDest.destination?.city || prevDest.destination?.iata_code || t('historial.noDestination')
            : response.destination?.city || response.destination?.iata_code || t('historial.noDestination');
            
          return {
            ...destination,
            origin_city: originCity,
            destination_city: destination.destination?.city || destination.destination?.iata_code || t('historial.noDestination'),
          };
        });

        const lastReal = mappedDests[mappedDests.length - 1];
        if (lastReal?.arrival_date) {
          const returnOriginCity = lastReal.destination_city;
          const returnDestCity = response.destination?.city || response.destination?.iata_code || t('historial.noDestination');
          
          mappedDests.push({
            id: lastReal.id + ':return',
            destination_order: mappedDests.length + 1,
            is_synthetic_return: true,
            origin_city: returnOriginCity,
            destination_city: returnDestCity,
            departure_date: lastReal.arrival_date,
            arrival_date: "",
            is_hotel_required: false,
            is_plane_required: true,
            stay_days: 0,
            details: "",
            provider_support_status: lastReal.provider_support_status
          });
        }

        setData({
          ...response,
          requests_destinations: mappedDests,
          effective_advance_money: effectiveAdvanceMoney,
          reservations: reservations,
          createdYear: new Date(response.createdAt).getFullYear(),
          createdAt: formatDate(response.createdAt),
          advance_money_str: formatMoney(
            normalizedAdvanceMoney ?? effectiveAdvanceMoney,
            "MXN",
          ),
          unconverted_advance_money_str:
            response.currency && response.currency !== "MXN"
              ? formatMoney(
                  normalizedUnconvertedAdvanceMoney ?? effectiveAdvanceMoney,
                  response.currency,
                )
              : undefined,
          exchange_rate_str: response.currency && response.currency !== "MXN" ? response.exchange_rate != null ? `$${Number(response.exchange_rate).toFixed(2)} MXN` : "N/A" : undefined,
          admin: response.admin.name + ' ' + response.admin.last_name,
          id_origin_city:
            response.destination?.city ||
            response.destination?.iata_code ||
            t('historial.noDestination'),
          destinations: (response.requests_destinations || [])
            .map(
              (dest: any) =>
                dest.destination?.city ||
                dest.destination?.iata_code ||
                t('historial.noDestination'),
            )
            .join(', '),
        });
        setSelectedAgency(draft?.selectedAgency || response.id_travel_agency || '');
        setComment(draft?.comment || '');
      } catch (error) {
        console.error('Error fetching request data:', error);
      }
    };

    fetchData();
  }, [requestId]);

  useEffect(() => {
    if (typeof window === 'undefined' || !requestId) {
      isDraftHydratedRef.current = true;
      return;
    }

    const draft = getStoredDraft();
    if (draft) {
      setComment(draft.comment || '');
      setSelectedAgency(draft.selectedAgency || '');
    }

    isDraftHydratedRef.current = true;
  }, [requestId]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !requestId ||
      !isDraftHydratedRef.current ||
      !isPersistenceEnabledRef.current
    ) {
      return;
    }

    if (!hasSkippedInitialPersistRef.current) {
      hasSkippedInitialPersistRef.current = true;
      return;
    }

    try {
      window.localStorage.setItem(
        requestInfoDraftKey,
        JSON.stringify({
          comment,
          selectedAgency,
        })
      );
    } catch {
      // Ignore localStorage write errors to keep the screen usable.
    }
  }, [comment, selectedAgency, requestId, requestInfoDraftKey]);

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
    /**
     * fetchAgencies, loads travel agencies used in the approval action.
     * Inputs: None.
     * Returns: Promise<void> - Updates agencies state.
     */
    const fetchAgencies = async () => {
      try {
        const response = await getRequest('/travel-agencies');
        // Deduplicate agencies by normalized name (case-insensitive) so duplicates like
        // multiple 'Duffel' entries are shown only once in the selector.
        const seen = new Set<string>();
        const deduped: any[] = [];
        for (const ag of response || []) {
          const key = (ag?.name || '').toString().trim().toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            deduped.push(ag);
          }
        }
        setAgencies(deduped);
      } catch (error) {
        console.error('Error fetching agencies data:', error);
      }
    };

    fetchAgencies();
  }, []);

  const labels: { key: string; label: string }[] = [
    { key: 'id', label: t('requestInfo.labelId') },
    { key: 'admin', label: t('requestInfo.labelApprover') },
    { key: 'id_origin_city', label: t('requestInfo.labelOriginCity') },
    { key: 'destinations', label: t('requestInfo.labelDestinations') },
    { key: 'motive', label: t('requestInfo.labelMotive') },
    { key: 'unconverted_advance_money_str', label: t('requestInfo.labelAdvanceOrigin') },
    { key: 'exchange_rate_str', label: t('requestInfo.labelExchangeRate') },
    { key: 'advance_money_str', label: t('requestInfo.labelAdvanceMXN') },
    { key: 'status', label: t('requestInfo.labelStatus') },
    { key: 'requirements', label: t('requestInfo.labelRequirements') },
    { key: 'priority', label: t('requestInfo.labelPriority') },
    { key: 'createdAt', label: t('requestInfo.labelCreatedAt') },
  ].filter(label => data[label.key] !== undefined && data[label.key] !== null);

  /**
   * approve, approves the request with the selected travel agency.
   * Inputs: None, it uses selectedAgency and request id from state/context.
   * Returns: Promise<void> - Sends API request and redirects on success.
   */
  const approve = async () => {
    if (!selectedAgency) {
      toast.error(t('requestInfo.selectAgencyError'), {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await patchRequest(`/requests/approve/${id}`, {
        id_travel_agency: selectedAgency,
      });
      clearRequestInfoDraft();
      toast.success(t('requestInfo.approveSuccess', { agency: agencies.find(a => a.id === selectedAgency)?.name ?? selectedAgency }), {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/approvals');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(t('requestInfo.approveError'), {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Title: requestChanges
   * Purpose: Creates a revision entry to request changes with a reviewer comment.
   * Inputs:
   * - None (uses comment and request id from state/context).
   * Returns: Promise<void> - Sends revision request and redirects on success.
   */
  const requestChanges = async () => {
    if (!comment.trim()) {
      toast.error(t('requestInfo.changesComment'), {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await postRequest(`/revisions`, {
        id_request: id,
        comment: comment,
      });
      clearRequestInfoDraft();
      toast.info(t('requestInfo.changesRequested'), {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/approvals');
    } catch (error) {
      console.error('Error requesting changes:', error);
      toast.error(t('requestInfo.changesError'), {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Title: deny
   * Purpose: Denies the current travel request.
   * Inputs:
   * - None (uses request id from route params).
   * Returns: Promise<void> - Sends deny request and redirects on success.
   */
  const deny = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await patchRequest(`/requests/deny/${id}`, {});
      clearRequestInfoDraft();
      toast.error(t('requestInfo.denySuccess'), {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/approvals');
    } catch (error) {
      console.error('Error denying request:', error);
      toast.error(t('requestInfo.denyError'), {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Title: cancel
   * Purpose: Cancels the current travel request.
   * Inputs:
   * - None (uses request id from route params).
   * Returns: Promise<void> - Sends cancel request and redirects on success.
   */
  const cancel = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await patchRequest(`/requests/cancel/${id}`, {});
      clearRequestInfoDraft();
      toast.error(t('requestInfo.cancelSuccess'), {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/history');
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error(t('requestInfo.cancelError'), {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Title: register
   * Purpose: Marks the request as registered in the SOI approval step.
   * Inputs:
   * - None (uses request id from route params).
   * Returns: Promise<void> - Sends status update and redirects on success.
   */
  const register = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await patchRequest(`/requests/SOI-approve/${id}`, {});
      clearRequestInfoDraft();
      toast.success(t('requestInfo.registerSuccess'), {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/history');
    } catch (error) {
      console.error('Error registering request:', error);
      toast.error(t('requestInfo.registerError'), {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * complete, marks the request as completed and routes to refund review flow.
   * Inputs: None, uses request id from route params.
   * Returns: Promise<void> - Sends completion request and redirects on success.
   */
  const complete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await patchRequest(`/requests/complete-request/${id}`, {});
      clearRequestInfoDraft();
      toast.success(t('requestInfo.completeSuccess'), {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/check-refunds');
    } catch (error) {
      console.error('Error completing request:', error);
      toast.error(t('requestInfo.completeError'), {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const previewAdvanceMoney = normalizeAmount(data?.advance_money) ?? 0;
  const approvedVoucherTotal =
    data?.vouchers?.reduce((acc: number, file: { status: string; amount: number }) => {
      if (file.status === "Voucher Approved") {
        return acc + Number(file.amount);
      }
      return acc;
    }, 0) ?? 0;
  const previewBalance = previewAdvanceMoney - approvedVoucherTotal;

  const folio =
    data?.request_num && data?.createdYear
      ? `${data.createdYear}-${String(data.request_num).padStart(3, '0')}`
      : null;

  return ( // Returns the main JSX content of the RequestInfo page, including request details, destinations, reservations, vouchers, and action buttons based on user permissions and request status.
    <Tutorial page="requestInfo" run={tutorial}>
      <div className="pb-10">
        <GoBack />
        <main className="max-w-6xl bg-[var(--color-card-bg)] mx-auto rounded-lg shadow-lg overflow-hidden">
          <div className="px-8 py-10 flex flex-col">
            <div className="w-fit bg-[var(--blue)] text-white text-xs lg:text-base px-4 py-2 rounded-full mb-6">
              {t('requestInfo.title')} <span>{folio ?? id}</span>
            </div>
            <p className="mb-6 text-gray-700 font-medium">
              {t('requestInfo.requester')} <span className="text-[var(--color-page-text-title)]">{data?.user?.name} {data?.user?.last_name}</span>
            </p>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8" id="request-info">
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
                    value={key === 'status' ? renderStatus(String(data[key]), t) : String(data[key])}
                    className="w-full bg-[var(--color-card-bg)] text-[var(--color-page-text)] rounded-lg px-3 py-2 border border-[var(--color-border)]"
                  />
                </div>
              ))}
            </section>

            <section id="destinations-info">
              <p
                className="block text-sm font-bold text-gray-500 mb-4"
              >
                {t('requestInfo.destinationDetails')}
              </p>
              {data?.requests_destinations?.map((dest: any, index: number) => (
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 mb-8" key={dest.id}>
                  <div>
                    <label
                      className="block text-xs font-semibold text-gray-500 mb-1"
                    >
                      {t('requestInfo.place')}
                    </label>
                    <input
                      id={`destination-${index}`}
                      type="text"
                      readOnly
                      value={`${dest.origin_city} -> ${dest.destination_city}`}
                      className="w-full bg-[var(--color-card-bg)] text-[var(--color-page-text)] rounded-lg px-3 py-2 border border-[var(--color-border)]"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold text-gray-500 mb-1"
                    >
                      {t('requestInfo.departureDate')}
                    </label>
                    <input
                      id={`departure-${index}`}
                      type="text"
                      readOnly
                      value={dest.departure_date ? formatDate(dest.departure_date) : t('historial.noDate')}
                      className="w-full bg-[var(--color-card-bg)] text-[var(--color-page-text)] rounded-lg px-3 py-2 border border-[var(--color-border)]"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold text-gray-500 mb-1"
                    >
                      {t('requestInfo.arrivalDate')}
                    </label>
                    <input
                      id={`arrival-${index}`}
                      type="text"
                      readOnly
                      value={dest.arrival_date ? formatDate(dest.arrival_date) : t('historial.noDate')}
                      className="w-full bg-[var(--color-card-bg)] text-[var(--color-page-text)] rounded-lg px-3 py-2 border border-[var(--color-border)]"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold text-gray-500 mb-1"
                    >
                      {t('requestInfo.details')}
                    </label>
                    <input
                      id={`details-${index}`}
                      type="text"
                      readOnly
                      value={dest.details || '-'}
                      className="w-full bg-[var(--color-card-bg)] text-[var(--color-page-text)] rounded-lg px-3 py-2 border border-[var(--color-border)]"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold text-gray-500 mb-1"
                    >
                      {t('requestInfo.providerStatusLabel')}
                    </label>
                    <input
                      id={`provider-support-status-${index}`}
                      type="text"
                      readOnly
                      value={renderProviderSupportStatus(dest.provider_support_status, t)}
                      className="w-full bg-[var(--color-card-bg)] text-[var(--color-page-text)] rounded-lg px-3 py-2 border border-[var(--color-border)]"
                    />
                  </div>
                  <div className="flex items-center justify-start gap-1">
                    {dest.is_hotel_required && (
                      <p id={`hotel-${index}`} className='text-sm bg-[var(--yellow)] rounded-full px-2 py-1 w-fit'>Hotel</p>
                    )}
                    {dest.is_plane_required && (
                      <p id={`plane-${index}`} className='text-sm bg-[var(--blue)] text-[var(--white)] rounded-full px-2 py-1 w-fit'>{t('requestInfo.flight')}</p>
                    )}
                    {dest.stay_days > 0 && (
                      <p id={`stay-days-${index}`} className='text-sm bg-[var(--green)] text-[var(--white)] rounded-full px-2 py-1 w-fit'>{dest.stay_days} {t('requestInfo.days')}</p>
                    )}

                  </div>
                </div>
              ))}
            </section>

            {data?.revisions?.length > 0 && <section id="revisions-info">
              <p
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('requestInfo.previousReviews')}
              </p>
              <div className="grid grid-cols-1 gap-2 mb-6">
                {data?.revisions?.map((revision: any, index: number) => (
                  <div key={revision.id}>
                    <label
                      className="block text-xs font-semibold text-gray-500 mb-1"
                    >
                      {t('requestInfo.comment')}
                    </label>
                    <input
                      id={`revision-comment-${index}`}
                      type="text"
                      readOnly
                      value={revision.comment}
                      className="w-full bg-gray-100 text-gray-800 rounded-lg px-3 py-2 border border-gray-200"
                    />
                  </div>
                ))}
              </div>
            </section>}

            {data?.reservations?.length > 0 &&
              <section id="vouchers-info">
                <p
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t('requestInfo.requestReservations')}
                </p>
                <div className="mb-4">
                  <div className="bg-[var(--color-page-bg)] p-4 relative">
                    <h2 className="text-lg font-semibold text-[var(--color-page-text)]  mb-4">
                      {t('requestInfo.reservationOf', { current: currentIndexRes + 1, total: data?.reservations?.length })}
                    </h2>
                    {/* Display the existing PDF using an iframe */}
                    <Swiper
                      modules={[Navigation, Pagination]}
                      spaceBetween={50}
                      slidesPerView={1}
                      pagination={{ clickable: true }}
                      onBeforeInit={(swiper: any) => {
                        if (typeof swiper.params.navigation !== 'boolean') {
                          swiper.params.navigation.prevEl = prevRefRes.current;
                          swiper.params.navigation.nextEl = nextRefRes.current;
                        }
                      }}
                      onSlideChange={(swiper: any) => setCurrentIndexRes(swiper.activeIndex)}
                    >
                      {data?.reservations?.map((file: any, index: number) => (
                        <SwiperSlide key={index}>
                          <FilePreviewerReservation
                            file={file}
                            fileIndex={index}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    <div className="flex space-x-4 absolute z-10 top-2 right-4 bg-[var(--color-page-bg)]">
                      <button
                        ref={prevRefRes}
                        disabled={currentIndexRes === 0}
                        className={`px-4 py-2 rounded-md border border-[var(--color-border)] ${currentIndexRes === 0
                            ? "bg-[var(--color-card-bg)] text-[var(--color-page-text)] opacity-50 cursor-not-allowed"
                            : "bg-[var(--color-card-bg)] text-[var(--color-page-text-title)] hover:bg-[var(--color-page-bg)]"
                          }`}
                      >
                        {t('requestInfo.previous')}
                      </button>
                      <button
                        disabled={currentIndexRes === ((data?.reservations?.length ?? 0) - 1)}
                        ref={nextRefRes}
                        className={`px-4 py-2 rounded-md border border-[var(--color-border)] ${currentIndexRes === (data?.reservations?.length ?? 0) - 1
                            ? "bg-[var(--color-card-bg)] text-[var(--color-page-text)] opacity-50 cursor-not-allowed"
                            : "bg-[var(--color-card-bg)] text-[var(--color-page-text-title)] hover:bg-[var(--color-page-bg)]"
                          }`}
                      >
                        {t('requestInfo.next')}
                      </button>
                    </div>
                  </div>
                  <section className="grid grid-cols-3 gap-5">
                    <div className="my-5">
                      <label
                        htmlFor={"total"}
                        className="block text-xs font-semibold text-gray-500 mb-1"
                      >
                        {t('requestInfo.totalReservations')}
                      </label>
                      <input
                        id="total_vouchers"
                        type="text"
                        readOnly
                        value={formatMoney(data?.reservations?.reduce((acc: number, file: { price: number }) => {
                          return acc + +file.price;
                        }, 0) ?? 0)}
                        className="w-full bg-[var(--color-card-bg)] text-[var(--color-page-text)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                      />
                    </div>
                  </section>
                </div>
              </section>}

            {data?.vouchers?.length > 0 &&
              <section id="vouchers-info">
                <p
                  className="block text-sm font-medium text-[var(--color-page-text)] mb-2"
                >
                  {t('requestInfo.requestVouchers')}
                </p>
                <div className="mb-4">
                  <div className="bg-[var(--color-page-bg)] p-4 relative">
                    <h2 className="text-lg font-semibold text-[var(--color-page-text)] mb-4">
                      {t('requestInfo.voucherOf', { current: currentIndex + 1, total: data?.vouchers?.length })}
                    </h2>
                    {/* Display the existing PDF using an iframe */}
                    <Swiper
                      modules={[Navigation, Pagination]}
                      spaceBetween={50}
                      slidesPerView={1}
                      pagination={{ clickable: true }}
                      onBeforeInit={(swiper: any) => {
                        if (typeof swiper.params.navigation !== 'boolean') {
                          swiper.params.navigation.prevEl = prevRef.current;
                          swiper.params.navigation.nextEl = nextRef.current;
                        }
                      }}
                      onSlideChange={(swiper: any) => setCurrentIndex(swiper.activeIndex)}
                    >
                      {data?.vouchers?.map((file: any, index: number) => (
                        <SwiperSlide key={index}>
                          <FilePreviewer
                            file={file}
                            fileIndex={index}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    <div className="flex space-x-4 absolute z-10 top-2 right-4 bg-[var(--color-page-bg)]">
                      <button
                        ref={prevRef}
                        disabled={currentIndex === 0}
                        className={`px-4 py-2 rounded-md border border-[var(--color-border)] ${currentIndex === 0
                            ? "bg-[var(--color-card-bg)] text-[var(--color-page-text)] opacity-50 cursor-not-allowed"
                            : "bg-[var(--color-card-bg)] text-[var(--color-page-text-title)] hover:bg-[var(--color-page-bg)]"
                          }`}
                      >
                        Anterior
                      </button>
                      <button
                        disabled={currentIndex === ((data?.vouchers?.length ?? 0) - 1)}
                        ref={nextRef}
                        className={`px-4 py-2 rounded-md border border-[var(--color-border)] ${currentIndex === (data?.vouchers?.length ?? 0) - 1
                            ? "bg-[var(--color-card-bg)] text-[var(--color-page-text)] opacity-50 cursor-not-allowed"
                            : "bg-[var(--color-card-bg)] text-[var(--color-page-text-title)] hover:bg-[var(--color-page-bg)]"
                          }`}
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                  <section className="grid grid-cols-3 gap-5">
                    <div className="my-5">
                      <label
                        htmlFor={"total"}
                        className="block text-xs font-semibold text-gray-500 mb-1"
                      >
                        {t('requestInfo.totalVouchers')}
                      </label>
                      <input
                        id="total_vouchers"
                        type="text"
                        readOnly
                        value={formatMoney(approvedVoucherTotal)}
                        className="w-full bg-[var(--color-card-bg)] text-[var(--color-page-text)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="my-5">
                      <label
                        htmlFor={"advance_money"}
                        className="block text-xs font-semibold text-gray-500 mb-1"
                      >
                        {t('requestInfo.advance')}
                      </label>
                      <input
                        id="advance_money"
                        type="text"
                        readOnly
                        value={formatMoney(previewAdvanceMoney, "MXN")}
                        className="w-full bg-[var(--color-card-bg)] text-[var(--color-page-text)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="my-5">
                      <label
                        htmlFor={"total"}
                        className="block text-xs font-semibold text-gray-500 mb-1"
                      >
                        {previewBalance < 0 ? t('requestInfo.balanceInFavor') : t('requestInfo.balanceAgainst')}
                      </label>
                      <input
                        id="balance"
                        type="text"
                        readOnly
                        value={formatMoney(Math.abs(previewBalance), "MXN")}
                        className={`w-full bg-[var(--color-card-bg)] text-[var(--color-page-text)] border border-[var(--color-border)] rounded-lg px-3 py-2
                      ${previewBalance > 0 ? "text-red-500" : "text-green-600"
                          }`}
                      />
                    </div>
                  </section>
                </div>
              </section>}

            {authState.userPermissions.includes("approve_request" as Permission) && <section className="mb-10" id="travel-agency">
              <label
                htmlFor="agency"
                className="block text-sm font-bold text-gray-500 mb-1"
              >
                {data.status !== "Pending Review" ? t('requestInfo.travelAgency') : t('requestInfo.travelAgencies')}
              </label>
              {data.status === "Pending Review" ? (
                <select
                  id="agency"
                  className="w-full bg-[var(--color-card-bg)] text-[var(--color-page-text)] border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedAgency}
                  disabled={data.status !== "Pending Review"}
                  onChange={(e) => setSelectedAgency(e.target.value)}
                >
                  <option value="">{t('requestInfo.selectAgency')}</option>
                  {agencies.map((agency) => (
                    <option key={agency.id} value={agency.id}>
                      {agency.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  readOnly
                  value={agencies?.find(agency => agency.id === data.id_travel_agency)?.name ?? ''}
                  className="w-full bg-[var(--color-card-bg)] text-[var(--color-page-text)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                />
              )}
            </section>}


            {authState.userPermissions.includes("approve_request" as Permission) && data.status === "Pending Review" && <section className="mb-8" id="comment-section">
              <label
                htmlFor="comment"
                className="block text-sm font-bold text-gray-500 mb-1"
              >
                {t('requestInfo.commentsLabel')}
              </label>
              <textarea
                id="comment"
                rows={4}
                className="w-full bg-[var(--color-card-bg)] text-[var(--color-page-text)] border border-[var(--color-border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('requestInfo.commentsPlaceholder')}
              />
            </section>}

            {/* Botones de acción */}
            {authState.userPermissions.includes("approve_request" as Permission) &&
              <>
                {data.status === "Pending Review" &&
                  <section className="mb-10">
                    <h1 className="text-2xl font-bold text-[var(--color-page-text-title)] mb-4">
                      {t('requestInfo.importantInfo')}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {t('requestInfo.infoApprove')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('requestInfo.infoChanges')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('requestInfo.infoDeny')}
                    </p>
                  </section>
                }
                <footer className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={approve}
                    disabled={isSubmitting || !selectedAgency || data.status !== "Pending Review"}
                    className={`flex-1 py-3 rounded-lg font-semibold transition
                    ${!isSubmitting && selectedAgency && data.status === "Pending Review"
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    id="approve-request-button"
                  >
                    {isSubmitting ? t('common.loading') : t('requestInfo.approve')}
                  </button>
                  <button
                    onClick={requestChanges}
                    disabled={isSubmitting || !comment.trim() || data.status !== "Pending Review"}
                    className={`flex-1 py-3 rounded-lg font-semibold transition
                    ${!isSubmitting && comment.trim() && data.status === "Pending Review"
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    id="changes-request-button"
                  >
                    {isSubmitting ? t('common.loading') : t('requestInfo.requestChanges')}
                  </button>
                  <button
                    onClick={deny}
                    disabled={isSubmitting || data.status !== "Pending Review"}
                    className={`flex-1 py-3 rounded-lg font-semibold transition
                    ${!isSubmitting && data.status === "Pending Review"
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    id="deny-request-button"
                  >
                    {isSubmitting ? t('common.loading') : t('requestInfo.deny')}
                  </button>
                </footer>
              </>
            }

            {authState.userPermissions.includes("create_request" as Permission) && data.id_admin !== authState.userId &&
              <footer className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate(`/requests/${id}/edit`)}
                  disabled={data.status !== "Changes Needed"}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${data.status === "Changes Needed"
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  id="edit-request-button"
                >
                  {t('requestInfo.edit')}
                </button>
                <button
                  onClick={cancel}
                  disabled={isSubmitting || (data.status !== "Pending Review" && data.status !== "Changes Needed")}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${!isSubmitting && (data.status === "Pending Review" || data.status === "Changes Needed")
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  id="cancel-request-button"
                >
                  {isSubmitting ? t('common.loading') : t('requestInfo.cancel')}
                </button>

              </footer>}

            {authState.userPermissions.includes("check_budgets" as Permission) && data.status === "Pending Accounting Approval" &&
              <footer className="flex flex-col sm:flex-row gap-4">
                <button
                  id="register-spend"
                  onClick={register}
                  disabled={isSubmitting || data.status !== "Pending Accounting Approval"}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${!isSubmitting && data.status === "Pending Accounting Approval"
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {isSubmitting ? t('common.loading') : t('requestInfo.markAsRegistered')}
                </button>
              </footer>
            }

            {authState.userPermissions.includes("check_budgets" as Permission) && data.status === "Pending Refund Approval" &&
              <footer className="flex flex-col sm:flex-row gap-4">
                <button
                  id="complete-refund-request"
                  onClick={complete}
                  disabled={isSubmitting || data.status !== "Pending Refund Approval"}
                  className={`flex-1 py-3 rounded-lg font-semibold transition ${!isSubmitting && data.status === "Pending Refund Approval"
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {isSubmitting ? t('common.loading') : t('requestInfo.markAsCompleted')}
                </button>
              </footer>
            }
          </div>
        </main>
      </div>
    </Tutorial>
  );
};

export default RequestInfo; // Exports the RequestInfo component as the default export of this module, allowing it to be imported and used in other parts of the application.
