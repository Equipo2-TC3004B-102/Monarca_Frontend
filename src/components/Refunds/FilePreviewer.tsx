/**
 * FileName: FilePreviewer.tsx
 * Description: This file contains the FilePreviewer component used in the Refunds section of the application.
 * It provides a preview of a file with its metadata and download options.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 Nicolas Quintana Added detailed comments and documentation for
 * clarity and maintainability.
 * 22/04/2026 [Sebastián Borjas] Added display of original amount, currency, and exchange rate for foreign-currency vouchers.
 */
import formatDate from "../../utils/formatDate";
import formatMoney from "../../utils/formatMoney";
import { useTranslation } from "react-i18next";


interface FilePreviewerProps {
    file: {
        file_url_pdf: string;
        file_url_xml: string;
        class: string;
        amount: number;
        unconverted_amount?: number | null;
        currency?: string;
        exchange_rate?: number | null;
        date: string;
        status: string;
    };
    fileIndex: number;
    showDownload?: boolean;
}

/**
 * FilePreviewer, displays a file preview with metadata (class, amount, date, status) and download options for XML and PDF formats.
 * Input: file (object with file_url_pdf, file_url_xml, class, amount, date, status), fileIndex (number)
 * Output: JSX element - a preview panel with iframe and file information with download buttons
 */
const FilePreviewer = ({ file, fileIndex, showDownload = true }: FilePreviewerProps) => {
    const { t } = useTranslation();
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 w-full mb-4">
                <iframe
                  src={`${file.file_url_pdf}#navpanes=0&view=FitH`}
                  width="100%"
                  height="100%"
                  title={`Comprobante de Solicitud ${fileIndex + 1}`}
                  className="border-0 col-span-1 md:col-span-2 h-64 md:h-96"
                />

                <div className="flex flex-col bg-white p-6 gap-3 col-span-1">
                  <p id={`class-file-${fileIndex}`} className="text-[var(--color-page-text)]"><span className="font-semibold text-[var(--color-page-text-title)]">{t('refundAcceptance.voucherClass')}: </span>{file.class}</p>
                  <p id={`amount-file-${fileIndex}`}>
                    <span className="font-semibold text-[var(--color-page-text-title)]">{t('refundAcceptance.amountMxn')}: </span>
                    <span className="text-green-700">{formatMoney(file.amount)}</span>
                  </p>
                  {file.unconverted_amount != null && file.currency && file.currency !== "MXN" && (
                    <>
                      <p id={`unconverted-amount-file-${fileIndex}`}>
                        <span className="font-semibold text-[var(--color-page-text-title)]">{t('refundAcceptance.originalAmount')}: </span>
                        <span className="text-amber-700">{file.unconverted_amount} {file.currency}</span>
                      </p>
                      {file.exchange_rate != null && (
                        <p id={`exchange-rate-file-${fileIndex}`} className="text-[var(--color-page-text)]">
                          <span className="font-semibold text-[var(--color-page-text-title)]">{t('refundAcceptance.exchangeRate')}: </span>
                          {Number(file.exchange_rate).toFixed(4)} MXN/{file.currency}
                        </p>
                      )}
                    </>
                  )}
                  <p id={`date-file-${fileIndex}`} className="text-[var(--color-page-text)]"><span className="font-semibold text-[var(--color-page-text-title)]">{t('refundAcceptance.date')}: </span>{formatDate(file.date)}</p>
                  <p id={`status-file-${fileIndex}`} className="text-[var(--color-page-text)]"><span className="font-semibold text-[var(--color-page-text-title)]">{t('refundAcceptance.voucherStatus')}: </span>{file.status}</p>
                </div>
              </div>

              {showDownload && (
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex space-x-4">
                    <a
                      id={`download-file-xml-${fileIndex}`}
                      href={file.file_url_xml}
                      download={`comprobante${fileIndex + 1}.xml`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:cursor-pointer"
                    >
                      {t('refundAcceptance.downloadXml')}
                    </a>
                    <a
                      id={`download-file-pdf-${fileIndex}`}
                      href={file.file_url_pdf}
                      download={`comprobante${fileIndex + 1}.pdf`}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 hover:cursor-pointer"
                    >
                      {t('refundAcceptance.downloadPdf')}
                    </a>
                  </div>
                </div>
              )}
        </>
    )
}

export default FilePreviewer;