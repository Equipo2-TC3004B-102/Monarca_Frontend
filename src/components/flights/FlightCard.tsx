/**
 * FileName: FlightCard.tsx
 * Description: Individual flight offer card showing details, price, airline and segments.
 * Authors: Debug Studio (Diego de la Vega)
 * Last Modification made:
 * 20/05/2026 [Jin Sik Yoon] Added internationalization and some UI copy improvements.
 */

import { UnifiedFlightOption } from '../../hooks/flights/useFlightSearch';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface FlightCardProps {
  flight: UnifiedFlightOption;
  onSelect?: (flight: UnifiedFlightOption) => void;
  selectLabel?: string;
}

export default function FlightCard({ flight, onSelect, selectLabel }: FlightCardProps) {
  const [expanded, setExpanded] = useState(false);

  const { t, i18n } = useTranslation();

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString(i18n.language === 'en' ? 'en-US' : 'es-MX',
    {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'es-MX',
      {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
      }
    ).format(price);
  };

  return (
    <div className="bg-[var(--color-page-bg)] border border-[var(--color-border)] rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-[var(--color-page-bg)] border-b border-[var(--color-border)]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--color-page-text-title)]">{flight.airline || 'Airline'}</h3>
            <p className="text-sm text-[var(--color-page-text)]">
              {flight.stops === 0 ? t('flightCard.directFlight') : t('flightCard.stops', { count: flight.stops })}
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
                {segment.origin_city} {t("flightCard.to")}{" "} {segment.destination_city}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm text-[var(--color-page-text-title)]">{formatTime(segment.departure_at)}</p>
              <p className="text-xs text-[var(--color-page-text)]">{t('flightCard.departure')}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 lg:px-6 py-4 bg-[var(--color-page-bg)] border-t border-[var(--color-border)] flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 px-4 py-2 text-[var(--color-page-text-title)] bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded hover:opacity-80 font-semibold transition"
        >
          {expanded ? t('flightCard.hideDetails') : t('flightCard.showDetails')}
        </button>
        {onSelect ? (
          <button
            type="button"
            onClick={() => onSelect(flight)}
            className="flex-1 px-4 py-2 bg-[var(--blue)] hover:opacity-90 text-white rounded font-semibold transition"
          >
            {selectLabel ?? t('flightCard.selectFlight')}
          </button>
        ) : (
          <button className="flex-1 px-4 py-2 bg-[var(--blue)] hover:opacity-90 text-white rounded font-semibold transition">
            {t('flightCard.selectFlight')}
          </button>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-6 py-4 bg-[var(--color-card-bg)] border-t border-[var(--color-border)]">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-[var(--color-page-text-title)] mb-2">{t('flightCard.flightInformation')}</h4>
              <p className="text-sm text-[var(--color-page-text)]">
                <strong>{t('flightCard.provider')}:</strong> Duffel
              </p>
              <p className="text-sm text-[var(--color-page-text)]">
                <strong>{t('flightCard.offerId')}:</strong> <code className="bg-[var(--color-page-bg)] px-2 py-1 rounded text-xs">{flight.provider_offer_id}</code>
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[var(--color-page-text-title)] mb-2">{t('flightCard.priceBreakdown')}</h4>
              <div className="bg-[var(--color-page-bg)] p-3 rounded space-y-1 text-sm">
                <p>
                  <span className="text-[var(--color-page-text)]">{t('flightCard.originalPrice')}:</span>{' '}
                  <span className="font-semibold text-[var(--color-page-text-title)]">{formatPrice(flight.original_price, flight.original_currency)}</span>
                </p>
                <p>
                  <span className="text-[var(--color-page-text)]">{t('flightCard.exchangeRate')}:</span>{' '}
                  <span className="font-semibold text-[var(--color-page-text-title)]">
                    {
                      flight.total_price_mxn != null && flight.original_price != null && Number(flight.original_price) > 0 ? `${(
                        Number(flight.total_price_mxn) / Number(flight.original_price)
                      ).toFixed(2)} MXN` : "N/A"
                    }
                  </span>
                </p>
                <p className="border-t border-[var(--color-border)] pt-2 mt-2">
                  <span className="text-[var(--color-page-text)]">{t('flightCard.priceInMXN')}:</span>{' '}
                  <span className="font-semibold text-[var(--blue)]">{formatPrice(flight.total_price_mxn)}</span>
                </p>
              </div>
            </div>

            {flight.segments.length > 1 && (
              <div>
                <h4 className="font-semibold text-[var(--color-page-text-title)] mb-2">{t('flightCard.fullItinerary')}</h4>
                <div className="space-y-2">
                  {flight.segments.map((segment, idx) => (
                    <div key={idx} className="bg-[var(--color-page-bg)] p-3 rounded text-sm text-[var(--color-page-text)]">
                      <p className="font-semibold text-[var(--color-page-text-title)]">
                        {segment.origin_airport_code} ({segment.origin_city}) → {segment.destination_airport_code} ({segment.destination_city})
                      </p>
                      <p>
                        {t('flightCard.departure')}: {formatTime(segment.departure_at)}
                      </p>
                      <p>
                        {t('flightCard.arrival')}: {formatTime(segment.arrival_at)}
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
