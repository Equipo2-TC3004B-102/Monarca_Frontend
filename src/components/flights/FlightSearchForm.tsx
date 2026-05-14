/**
 * FileName: FlightSearchForm.tsx
 * Description: Single-segment flight search form. Captures origin, destination, dates and passengers.
 * Authors: Debug Studio (Diego de la Vega)
 * Last Modification made:
 * 12/05/2026 [Diego de la Vega] Created FlightSearchForm component.
 */

import { useState } from 'react';
import { FlightSearchQuery } from '../../hooks/flights/useFlightSearch';

interface FlightSearchFormProps {
  onSearch: (query: FlightSearchQuery) => void;
}

export default function FlightSearchForm({ onSearch }: FlightSearchFormProps) {
  const [origin, setOrigin] = useState('MEX');
  const [destination, setDestination] = useState('CUN');
  const [departureDate, setDepartureDate] = useState('2026-06-15');
  const [returnDate, setReturnDate] = useState('2026-06-20');
  const [passengers, setPassengers] = useState(1);
  const [tripType, setTripType] = useState<'round' | 'one-way'>('round');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const query: FlightSearchQuery = {
      origin_airport_code: origin.toUpperCase(),
      destination_airport_code: destination.toUpperCase(),
      departure_date: departureDate,
      return_date: tripType === 'round' ? returnDate : undefined,
      passengers,
    };

    onSearch(query);
    setTimeout(() => setIsLoading(false), 100);
  };

  return (
    <form onSubmit={handleSearch} className="space-y-6">
      {/* Trip Type */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="tripType"
            value="round"
            checked={tripType === 'round'}
            onChange={(e) => setTripType(e.target.value as 'round' | 'one-way')}
            className="w-4 h-4 cursor-pointer"
          />
          <span className="text-gray-700">Viaje Redondo</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="tripType"
            value="one-way"
            checked={tripType === 'one-way'}
            onChange={(e) => setTripType(e.target.value as 'round' | 'one-way')}
            className="w-4 h-4 cursor-pointer"
          />
          <span className="text-gray-700">Viaje Sencillo</span>
        </label>
      </div>

      {/* Origins & Destinations */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Origen</label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="MEX"
            maxLength={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Destino</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="CUN"
            maxLength={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Salida</label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {tripType === 'round' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Regreso</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

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

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
      >
        {isLoading ? 'Buscando...' : 'Buscar Vuelos'}
      </button>
    </form>
  );
}
