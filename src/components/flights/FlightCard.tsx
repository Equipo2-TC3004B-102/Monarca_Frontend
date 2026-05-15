/**
 * FileName: FlightCard.tsx
 * Description: Individual flight offer card showing details, price, airline and segments.
 * Authors: Debug Studio (Diego de la Vega)
 * Last Modification made:
 * 14/05/2026 [Diego de la Vega] Added Duffel provider and some dark mode buttons.
 */

import { UnifiedFlightOption } from '../../hooks/flights/useFlightSearch';
import { useState } from 'react';

interface FlightCardProps {
  flight: UnifiedFlightOption;
  onSelect?: (flight: UnifiedFlightOption) => void;
  selectLabel?: string;
}

export default function FlightCard({ flight, onSelect, selectLabel }: FlightCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('es-MX', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="bg-[var(--color-page-bg)] border border-[var(--color-border)] rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-[var(--color-page-bg)] border-b border-[var(--color-border)]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--color-page-text-title)]">{flight.airline || 'Airline'}</h3>
            <p className="text-sm text-[var(--color-page-text)]">
              {flight.stops === 0 ? 'Vuelo directo' : `${flight.stops} parada${flight.stops !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[var(--color-page-text-title)]">{formatPrice(flight.total_price_mxn)}</p>
            <p className="text-xs text-[var(--color-page-text)]">
              {formatPrice(flight.original_price, flight.original_currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Segments Preview */}
      <div className="px-6 py-4 border-t border-[var(--color-border)]">
        {flight.segments.map((segment, idx) => (
          <div key={idx} className={`flex items-center justify-between ${idx > 0 ? 'mt-4 pt-4 border-t border-[var(--color-border)]' : ''}`}>
            <div className="flex-1">
              <p className="font-semibold text-[var(--color-page-text-title)]">
                {segment.origin_airport_code} → {segment.destination_airport_code}
              </p>
              <p className="text-sm text-[var(--color-page-text)]">
                {segment.origin_city} a {segment.destination_city}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm text-[var(--color-page-text-title)]">{formatTime(segment.departure_at)}</p>
              <p className="text-xs text-[var(--color-page-text)]">Salida</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 lg:px-6 py-4 bg-[var(--color-page-bg)] border-t border-[var(--color-border)] flex gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 px-4 py-2 text-[var(--color-page-text-title)] bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded hover:opacity-80 font-semibold transition"
        >
          {expanded ? 'Ocultar detalles' : 'Ver detalles'}
        </button>
        {onSelect ? (
          <button
            type="button"
            onClick={() => onSelect(flight)}
            className="flex-1 px-4 py-2 bg-[var(--blue)] hover:opacity-90 text-white rounded font-semibold transition"
          >
            {selectLabel ?? 'Seleccionar'}
          </button>
        ) : (
          <button className="flex-1 px-4 py-2 bg-[var(--blue)] hover:opacity-90 text-white rounded font-semibold transition">
            Seleccionar
          </button>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-6 py-4 bg-[var(--color-card-bg)] border-t border-[var(--color-border)]">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-[var(--color-page-text-title)] mb-2">Información del Vuelo</h4>
              <p className="text-sm text-[var(--color-page-text)]">
                <strong>Proveedor:</strong> Duffel
              </p>
              <p className="text-sm text-[var(--color-page-text)]">
                <strong>ID de Oferta:</strong> <code className="bg-[var(--color-page-bg)] px-2 py-1 rounded text-xs">{flight.provider_offer_id}</code>
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[var(--color-page-text-title)] mb-2">Desglose de Precio</h4>
              <div className="bg-[var(--color-page-bg)] p-3 rounded space-y-1 text-sm">
                <p>
                  <span className="text-[var(--color-page-text)]">Precio original:</span>{' '}
                  <span className="font-semibold text-[var(--color-page-text-title)]">{formatPrice(flight.original_price, flight.original_currency)}</span>
                </p>
                <p>
                  <span className="text-[var(--color-page-text)]">Tasa de cambio:</span>{' '}
                  <span className="font-semibold text-[var(--color-page-text-title)]">
                    {(flight.total_price_mxn / flight.original_price).toFixed(2)} MXN
                  </span>
                </p>
                <p className="border-t border-[var(--color-border)] pt-2 mt-2">
                  <span className="text-[var(--color-page-text)]">Precio en MXN:</span>{' '}
                  <span className="font-semibold text-[var(--blue)]">{formatPrice(flight.total_price_mxn)}</span>
                </p>
              </div>
            </div>

            {flight.segments.length > 1 && (
              <div>
                <h4 className="font-semibold text-[var(--color-page-text-title)] mb-2">Itinerario Completo</h4>
                <div className="space-y-2">
                  {flight.segments.map((segment, idx) => (
                    <div key={idx} className="bg-[var(--color-page-bg)] p-3 rounded text-sm text-[var(--color-page-text)]">
                      <p className="font-semibold text-[var(--color-page-text-title)]">
                        {segment.origin_airport_code} ({segment.origin_city}) → {segment.destination_airport_code} ({segment.destination_city})
                      </p>
                      <p>
                        Salida: {formatTime(segment.departure_at)}
                      </p>
                      <p>
                        Llegada: {formatTime(segment.arrival_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
