/**
 * FileName: FlightReservationOptions.tsx
 * Description: Reservation-flow flight search panel that displays Duffel itinerary
 *              options grouped by segment and lets the travel agent copy an option
 *              into the reservation form.
 * Authors: Debug Studio (Diego de la Vega)
 * Last Modification made:
 * 20/05/2026 [Jin Sik Yoon] Added internationalization and some UI copy improvements.
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import FlightCard from './FlightCard';
import {
  FlightSearchMultiSegmentQuery,
  FlightSearchMultiSegmentResponse,
  FlightSegmentInput,
  useFlightSearchMultiSegment,
} from '../../hooks/flights/useFlightSearchMultiSegment';
import formatDate from '../../utils/formatDate';

type ReservationRequest = {
  destination?: { iata_code?: string | null; city?: string | null };
  requests_destinations?: Array<{
    id: string;
    destination_order: number;
    departure_date: string;
    arrival_date?: string;
    departure_date_raw?: string;
    arrival_date_raw?: string;
    is_plane_required?: boolean;
    destination?: { iata_code?: string | null; city?: string | null };
  }>;
};

type FlightReservationOptionsProps = {
  request: ReservationRequest;
  onSelectFlight: (params: {
    destinationId: string;
    flight: FlightSearchMultiSegmentResponse['results_by_segment'][number]['results'][number];
    segmentIndex: number;
  }) => void;
};

/**
 * FlightReservationOptions, builds the itinerary search query from the loaded request
 * and renders the top Duffel options per segment.
 */
export default function FlightReservationOptions({
  request,
  onSelectFlight,
}: FlightReservationOptionsProps) {
  const { t } = useTranslation();
  const [collapsedSegments, setCollapsedSegments] = useState<Set<number>>(new Set());

  const toggleSegment = (index: number) => {
    setCollapsedSegments(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };
  const sortedDestinations = useMemo(
    () =>
      [...(request.requests_destinations || [])].sort(
        (left, right) => left.destination_order - right.destination_order,
      ),
    [request.requests_destinations],
  );

  const flightSearchQuery = useMemo<FlightSearchMultiSegmentQuery | null>(() => {
    const originCode = request.destination?.iata_code?.trim();
    if (!originCode || sortedDestinations.length === 0) {
      return null;
    }

    const slices: FlightSegmentInput[] = [];
    let currentOrigin = originCode;

    for (const destination of sortedDestinations) {
      const destinationCode = destination.destination?.iata_code?.trim();
      if (!destinationCode) {
        return null;
      }

      slices.push({
        origin: currentOrigin,
        destination: destinationCode,
        departure_date: destination.departure_date_raw || destination.departure_date || '',
      });

      currentOrigin = destinationCode;
    }

    if (currentOrigin !== originCode) {
      slices.push({
        origin: currentOrigin,
        destination: originCode,
        departure_date:
          sortedDestinations[sortedDestinations.length - 1]?.departure_date_raw ||
          sortedDestinations[sortedDestinations.length - 1]?.departure_date ||
          sortedDestinations[sortedDestinations.length - 1]?.arrival_date_raw ||
          sortedDestinations[sortedDestinations.length - 1]?.arrival_date ||
          sortedDestinations[0]?.departure_date_raw ||
          sortedDestinations[0]?.departure_date ||
          '',
      });
    }

    return {
      slices,
      passengers: 1,
    };
  }, [request.destination?.iata_code, sortedDestinations]);

  const searchResult = useFlightSearchMultiSegment(flightSearchQuery);

  if (!flightSearchQuery) {
    return (
      <section className="bg-[var(--color-page-bg)] rounded-lg shadow-sm border border-[var(--color-border)] p-6 mb-8">
        <h3 className="text-lg font-bold text-[var(--color-page-text-title)] mb-2">{t("flightReservationOptions.flightOptions")}</h3>
        <p className="text-sm text-[var(--color-page-text)]">
          {t("flightReservationOptions.notEnoughIata")}
        </p>
      </section>
    );
  }

  const data = searchResult.data as FlightSearchMultiSegmentResponse | undefined;

  return (
    <section className="bg-[var(--color-page-bg)] rounded-lg shadow-sm p-6 mb-8">
      <div className="flex flex-col gap-2 mb-6">
        <h3 className="text-lg font-bold text-[var(--color-page-text-title)]">{t("flightReservationOptions.flightOptions")}</h3>
        <p className="text-sm text-[var(--color-page-text)]">
          {t("flightReservationOptions.bestOptions")}
        </p>
      </div>

      {searchResult.isLoading && (
        <div className="py-8 text-center text-[var(--color-page-text)]">{t("flightReservationOptions.searchingDuffel")}</div>
      )}

      {searchResult.isError && (
        <div className="py-4 px-4 rounded bg-red-50 border border-red-200 text-red-700">
          {t("flightReservationOptions.loadError")}
        </div>
      )}

      {!searchResult.isLoading && !searchResult.isError && data && (
        <div className="space-y-4">
          {data.results_by_segment.map((segment, index) => {
            const destination = sortedDestinations[index];
            const segmentDate = destination?.departure_date_raw || destination?.departure_date || destination?.arrival_date_raw || destination?.arrival_date || '';
            const isCollapsed = collapsedSegments.has(segment.segment_index);

            return (
              <div key={segment.segment_index} className="rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleSegment(segment.segment_index)}
                  className="w-full flex items-center justify-between px-5 py-3 bg-[var(--blue)] text-white hover:bg-[var(--dark-blue)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-widest opacity-70">
                      {t("flightReservationOptions.segment")} {segment.segment_index + 1}
                    </span>
                    <span className="text-base font-bold">{segment.route}</span>
                    {segmentDate && (
                      <span className="text-xs opacity-70">
                        · {formatDate(segmentDate)}
                      </span>
                    )}
                  </div>
                  {isCollapsed ? <FiChevronDown size={18} /> : <FiChevronUp size={18} />}
                </button>

                {!isCollapsed && (
                  <div className="p-5">
                    {segment.results.length > 0 ? (
                      <div className="grid gap-4">
                        {segment.results.map((flight) => (
                          <FlightCard
                            key={flight.provider_offer_id}
                            flight={flight}
                            selectLabel={destination ? t("flightReservationOptions.useForDestination", {
                              number: destination.destination_order,
                            }) : t("flightReservationOptions.useOption")}
                            onSelect={() => {
                              if (!destination) return;
                              onSelectFlight({
                                destinationId: destination.id,
                                flight,
                                segmentIndex: segment.segment_index,
                              });
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl bg-[var(--color-page-bg)] border border-[var(--color-border)] p-4 text-sm text-[var(--color-page-text)]">
                        {t("flightReservationOptions.noResults")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}