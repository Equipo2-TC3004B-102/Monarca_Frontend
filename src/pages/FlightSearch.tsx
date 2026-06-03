/**
 * FileName: FlightSearch.tsx
 * Description: Flight search page. Allows users to search for flights with single or
 *              multi-segment itineraries and displays results in a sortable/filterable format.
 * Authors: Debug Studio (Diego de la Vega)
 * Last Modification made:
 * 02/06/2026 [Nicolas Quintana] Added documentation for the FlightSearch component.
 */

import { useState } from 'react';
import Layout from '../components/Layout';
import FlightSearchForm from '../components/flights/FlightSearchForm';
import FlightSearchResults from '../components/flights/FlightSearchResults';
import FlightSearchMultiSegmentForm from '../components/flights/FlightSearchMultiSegmentForm';
import FlightSearchMultiSegmentResults from '../components/flights/FlightSearchMultiSegmentResults';
import { FlightSearchQuery, useFlightSearch } from '../hooks/flights/useFlightSearch';
import {
  FlightSearchMultiSegmentQuery,
  useFlightSearchMultiSegment,
} from '../hooks/flights/useFlightSearchMultiSegment';

type SearchMode = 'single' | 'multi';

/**
 * FlightSearch Component
 * Purpose: Displays a flight search page with toggle between single and multi-segment flight searches.
 * Manages search state for both search modes and displays results in a sortable/filterable format.
 * Inputs:
 * None 
 * Outputs:
 * {JSX.Element} A layout containing search mode tabs, search form, and flight results based on selected mode
 */

export default function FlightSearch() {
  const [searchMode, setSearchMode] = useState<SearchMode>('single');
  const [singleSearchQuery, setSingleSearchQuery] = useState<FlightSearchQuery | null>(null);
  const [multiSearchQuery, setMultiSearchQuery] = useState<FlightSearchMultiSegmentQuery | null>(
    null,
  );

  const singleSearchResult = useFlightSearch(searchMode === 'single' ? singleSearchQuery : null);
  const multiSearchResult = useFlightSearchMultiSegment(
    searchMode === 'multi' ? multiSearchQuery : null,
  );

  const handleSingleSearch = (query: FlightSearchQuery) => {
    setSingleSearchQuery(query);
  };

  const handleMultiSearch = (query: FlightSearchMultiSegmentQuery) => {
    setMultiSearchQuery(query);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8 p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-gray-900">Búsqueda de Vuelos</h1>
          <p className="text-gray-600 mt-2">Encuentra las mejores ofertas de vuelos con múltiples proveedores</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => setSearchMode('single')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              searchMode === 'single'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Viaje Simple
          </button>
          <button
            onClick={() => setSearchMode('multi')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              searchMode === 'multi'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Multi-Destino
          </button>
        </div>

        {/* Search Forms */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {searchMode === 'single' ? (
            <FlightSearchForm onSearch={handleSingleSearch} />
          ) : (
            <FlightSearchMultiSegmentForm onSearch={handleMultiSearch} />
          )}
        </div>

        {/* Results */}
        <div>
          {searchMode === 'single' && (
            <FlightSearchResults query={singleSearchQuery} result={singleSearchResult} />
          )}
          {searchMode === 'multi' && (
            <FlightSearchMultiSegmentResults query={multiSearchQuery} result={multiSearchResult} />
          )}
        </div>
      </div>
    </Layout>
  );
}
