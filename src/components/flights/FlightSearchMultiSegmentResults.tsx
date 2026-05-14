/**
 * FileName: FlightSearchMultiSegmentResults.tsx
 * Description: Displays multi-segment flight search results grouped by segment.
 * Authors: Debug Studio (Diego de la Vega)
 * Last Modification made:
 * 12/05/2026 [Diego de la Vega] Created FlightSearchMultiSegmentResults component.
 */

import {
  FlightSearchMultiSegmentQuery,
  FlightSearchMultiSegmentResponse,
  useFlightSearchMultiSegment,
} from '../../hooks/flights/useFlightSearchMultiSegment';
import FlightCard from './FlightCard';

interface FlightSearchMultiSegmentResultsProps {
  query: FlightSearchMultiSegmentQuery | null;
  result: ReturnType<typeof useFlightSearchMultiSegment>;
}

export default function FlightSearchMultiSegmentResults({
  query,
  result,
}: FlightSearchMultiSegmentResultsProps) {
  if (!query) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ingresa los tramos de tu viaje para comenzar la búsqueda</p>
      </div>
    );
  }

  if (result.isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Buscando vuelos en {query.slices.length} tramo(s)...</p>
        </div>
      </div>
    );
  }

  if (result.isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error en la búsqueda</h3>
        <p className="text-red-700">{(result.error as any)?.message || 'Error desconocido'}</p>
      </div>
    );
  }

  const data = result.data as FlightSearchMultiSegmentResponse | undefined;

  if (!data) {
    return null;
  }

  const hasResults = data.results_by_segment.some((seg) => seg.results.length > 0);

  if (!hasResults) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">No se encontraron vuelos para alguno de los tramos especificados</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {data.results_by_segment.map((segment) => (
        <div key={segment.segment_index} className="space-y-4">
          {/* Segment Header */}
          <div className="flex justify-between items-center border-b-2 border-blue-600 pb-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{segment.route}</h2>
              <p className="text-sm text-gray-600">
                Tramo {segment.segment_index + 1} de {data.total_segments}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-blue-600">
                {segment.results.length} oferta{segment.results.length !== 1 ? 's' : ''}
              </p>
              {segment.results.length > 0 && (
                <p className="text-sm text-gray-600">
                  Desde {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                  }).format(Math.min(...segment.results.map((r) => r.total_price_mxn)))}
                </p>
              )}
            </div>
          </div>

          {/* Segment Results */}
          {segment.results.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              {segment.results.map((flight) => (
                <FlightCard key={flight.provider_offer_id} flight={flight} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-600">Sin resultados para este tramo</p>
            </div>
          )}
        </div>
      ))}

      {/* Summary */}
      {data.provider_errors.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            ⚠️ Algunos proveedores no respondieron. Los resultados mostrados pueden ser parciales.
          </p>
        </div>
      )}
    </div>
  );
}
