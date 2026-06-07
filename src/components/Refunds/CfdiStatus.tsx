/**
 * FileName: CfdiStatus.tsx
 * Description: This file contains the CfdiStatus component used in the Refunds section of the application.
 * It provides a customizable button with properties for id, label, className, disabled state, and click handler.
 * Authors: DebugStudio team
 * Last Modification made: 
 * 25/05/2026 [Santiago Coronado Hernández] Created file.
 */

import { useTranslation } from 'react-i18next';

interface CfdiStatusProps {
  status?: string | null;
  variant?: 'pill' | 'inline';
}

const CfdiStatus = ({ status, variant = 'pill' }: CfdiStatusProps) => {
  const { t } = useTranslation();
  if (!status) return null;

  const text = t(`cfdi.${status}`) || status;

  const base = 'text-xs px-2 py-1 rounded-full inline-block font-bold';
  const inlineBase = 'text-[var(--color-page-text)]';

  const styles = (() => {
    switch (status) {
      case 'VALID':
        return 'text-[#24390d] bg-[#c7e6ab]';
      case 'CANCELED':
        return 'text-[#680909] bg-[#eca6a6]';
      case 'NOT_FOUND':
        return 'text-[#755619] bg-[#f1dbb1]';
      case 'PENDING':
        return 'text-[var(--dark-blue)] bg-[#99b5e3]';
      default:
        return 'text-white bg-[#6c757d]';
    }
  })();

  if (variant === 'inline') {
    return (
      <span className={`ml-2 ${inlineBase}`} aria-label={`cfdi-${status}`}>
        <span className="font-semibold text-[var(--color-page-text-title)] mr-1">{t('refundAcceptance.cfdiStatus')}:</span>
        <span className={`${base} ${styles}`}>{text}</span>
      </span>
    );
  }

  return <span className={`${base} ${styles}`} aria-label={`cfdi-${status}`}>{text}</span>;
};

export default CfdiStatus;
