/**
 * FileName: FlightSearchResults.tsx
 * Description: Displays flight search results in a card/table format with price sorting.
 * Authors: Debug Studio (Diego de la Vega)
 * Last Modification made:
 * 12/05/2026 [Diego de la Vega] Created FlightSearchResults component.
 */

import { FlightSearchQuery, FlightSearchResponse, useFlightSearch } from '../../hooks/flights/useFlightSearch';
import FlightCard from './FlightCard';

interface FlightSearchResultsProps {
  query: FlightSearchQuery | null;
  result: ReturnType<typeof useFlightSearch>;
}

export default function FlightSearchResults({ query, result }: FlightSearchResultsProps) {
  if (!query) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ingresa los parámetros de búsqueda para comenzar</p>
      </div>
    );
  }

  if (result.isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Buscando vuelos...</p>
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

  const data = result.data as FlightSearchResponse | undefined;

  if (!data || data.results.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">No se encontraron vuelos con los parámetros especificados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Resultados ({data.results_count} oferta{data.results_count !== 1 ? 's' : ''})
        </h2>
        {data.provider_errors.length > 0 && (
          <div className="text-sm text-yellow-700 bg-yellow-50 px-4 py-2 rounded">
            Algunos proveedores no respondieron
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        {data.results.map((flight) => (
          <FlightCard key={flight.provider_offer_id} flight={flight} />
        ))}
      </div>
    </div>
  );
}
