/**
 * FileName: FlightSearchMultiSegmentForm.tsx
 * Description: Multi-segment flight search form. Allows users to add multiple flight segments.
 * Authors: Debug Studio (Diego de la Vega)
 * Last Modification made:
 * 12/05/2026 [Diego de la Vega] Created FlightSearchMultiSegmentForm component.
 */

import { useState } from 'react';
import { FlightSearchMultiSegmentQuery, FlightSegmentInput } from '../../hooks/flights/useFlightSearchMultiSegment';

interface FlightSearchMultiSegmentFormProps {
  onSearch: (query: FlightSearchMultiSegmentQuery) => void;
}

export default function FlightSearchMultiSegmentForm({ onSearch }: FlightSearchMultiSegmentFormProps) {
  const [segments, setSegments] = useState<FlightSegmentInput[]>([
    { origin: 'MEX', destination: 'NYC', departure_date: '2026-06-15' },
    { origin: 'NYC', destination: 'CUN', departure_date: '2026-06-18' },
    { origin: 'CUN', destination: 'MEX', departure_date: '2026-06-20' },
  ]);
  const [passengers, setPassengers] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleSegmentChange = (index: number, field: keyof FlightSegmentInput, value: string) => {
    const newSegments = [...segments];
    newSegments[index]![field] = value;
    setSegments(newSegments);
  };

  const addSegment = () => {
    if (segments.length === 0) return;
    
    const lastSegment = segments[segments.length - 1]!;
    setSegments([
      ...segments,
      {
        origin: lastSegment.destination,
        destination: 'NYC',
        departure_date: '2026-06-25',
      },
    ]);
  };

  const removeSegment = (index: number) => {
    if (segments.length > 1) {
      setSegments(segments.filter((_, i) => i !== index));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const query: FlightSearchMultiSegmentQuery = {
      slices: segments.map((seg) => ({
        origin: seg.origin.toUpperCase(),
        destination: seg.destination.toUpperCase(),
        departure_date: seg.departure_date,
      })),
      passengers,
    };

    onSearch(query);
    setTimeout(() => setIsLoading(false), 100);
  };

  return (
    <form onSubmit={handleSearch} className="space-y-6">
      {/* Passengers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Pasajeros</label>
        <input
          type="number"
          min={1}
          max={9}
          value={passengers}
          onChange={(e) => setPassengers(parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Segments */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Tramos del Viaje</h3>
        {segments.map((segment, idx) => (
          <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Tramo {idx + 1}</span>
              {segments.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSegment(idx)}
                  className="text-red-600 hover:text-red-800 text-sm font-semibold"
                >
                  Remover
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Origen</label>
                <input
                  type="text"
                  value={segment.origin}
                  onChange={(e) => handleSegmentChange(idx, 'origin', e.target.value)}
                  placeholder="MEX"
                  maxLength={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Destino</label>
                <input
                  type="text"
                  value={segment.destination}
                  onChange={(e) => handleSegmentChange(idx, 'destination', e.target.value)}
                  placeholder="NYC"
                  maxLength={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={segment.departure_date}
                  onChange={(e) => handleSegmentChange(idx, 'departure_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Segment Button */}
      <button
        type="button"
        onClick={addSegment}
        className="w-full py-2 px-4 border-2 border-dashed border-blue-400 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition"
      >
        + Agregar Tramo
      </button>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
      >
        {isLoading ? 'Buscando...' : 'Buscar Vuelos Multi-Destino'}
      </button>
    </form>
  );
}
