/**
 * FileName: FlightReservationOptions.tsx
 * Description: Reservation-flow flight search panel that displays Duffel itinerary
 *              options grouped by segment and lets the travel agent copy an option
 *              into the reservation form.
 * Authors: Debug Studio (Diego de la Vega)
 * Last Modification made:
 * 12/05/2026 [Diego de la Vega] Added reservation-flow flight search integration and dark mode for some buttons.
 */

import { useMemo } from 'react';
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
        <h3 className="text-lg font-bold text-[var(--color-page-text-title)] mb-2">Opciones de vuelo</h3>
        <p className="text-sm text-[var(--color-page-text)]">
          No hay suficientes códigos IATA para buscar vuelos automáticamente.
        </p>
      </section>
    );
  }

  const data = searchResult.data as FlightSearchMultiSegmentResponse | undefined;

  return (
    <section className="bg-[var(--color-page-bg)] rounded-lg shadow-sm p-6 mb-8">
      <div className="flex flex-col gap-2 mb-6">
        <h3 className="text-lg font-bold text-[var(--color-page-text-title)]">Opciones de vuelo</h3>
        <p className="text-sm text-[var(--color-page-text)]">
          Se muestran las mejores opciones por tramo para el itinerario cargado.
        </p>
      </div>

      {searchResult.isLoading && (
        <div className="py-8 text-center text-[var(--color-page-text)]">Buscando opciones en Duffel...</div>
      )}

      {searchResult.isError && (
        <div className="py-4 px-4 rounded bg-red-50 border border-red-200 text-red-700">
          No fue posible cargar las opciones de vuelo.
        </div>
      )}

      {!searchResult.isLoading && !searchResult.isError && data && (
        <div className="space-y-8">
          {data.results_by_segment.map((segment, index) => {
            const destination = sortedDestinations[index];
            const segmentDate = destination?.departure_date_raw || destination?.departure_date || destination?.arrival_date_raw || destination?.arrival_date || '';

            return (
              <div key={segment.segment_index} className="space-y-4">
                <div className="flex flex-col gap-1 border-b border-[var(--color-border)] pb-3">
                  <h4 className="text-base font-semibold text-[var(--color-page-text-title)]">
                    Tramo {segment.segment_index + 1}: {segment.route}
                  </h4>
                  <p className="text-sm text-[var(--color-page-text)]">
                    Fecha sugerida: {segmentDate ? formatDate(segmentDate) : 'Sin fecha'}
                  </p>
                </div>

                {segment.results.length > 0 ? (
                  <div className="grid gap-4">
                    {segment.results.map((flight) => (
                      <FlightCard
                        key={flight.provider_offer_id}
                        flight={flight}
                        selectLabel={destination ? `Usar para destino #${destination.destination_order}` : 'Usar opción'}
                        onSelect={() => {
                          if (!destination) {
                            return;
                          }

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
                  <div className="rounded bg-[var(--color-page-bg)] border border-[var(--color-border)] p-4 text-sm text-[var(--color-page-text)]">
                    No hay resultados para este tramo.
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