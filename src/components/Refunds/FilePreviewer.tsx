/**
 * FileName: FilePreviewer.tsx
 * Description: This file contains the FilePreviewer component used in the Refunds section of the application.
 * It provides a preview of a file with its metadata and download options.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/05/2026 [Santiago Coronado Hernández] Added CfdiStatus component.
 */
import formatDate from "../../utils/formatDate";
import formatMoney from "../../utils/formatMoney";
import { useTranslation } from "react-i18next";
import CfdiStatus from './CfdiStatus';


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
        cfdi_status?: string | null;
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
                        {file.file_url_pdf ? (
                  <iframe
                    src={`${file.file_url_pdf}#navpanes=0&view=FitH`}
                    width="100%"
                    height="100%"
                    title={`Comprobante de Solicitud ${fileIndex + 1}`}
                    className="border-0 col-span-1 md:col-span-2 h-64 md:h-96"
                  />
                ) : (
                  <div className="col-span-1 md:col-span-2 h-64 md:h-96 flex flex-col items-center justify-center bg-[var(--color-page-bg)] border border-dashed border-gray-400 rounded-md gap-3">
                    <span className="text-4xl">📄</span>
                    <p className="text-sm font-medium text-[var(--color-page-text)]">
                      {file.file_url_xml.split('/').pop() ?? `comprobante${fileIndex + 1}.xml`}
                    </p>
                    <p className="text-xs text-gray-400">{t('refundAcceptance.noPreview')}</p>
                  </div>
                )}

                <div className="flex flex-col bg-[var(--color-page-bg)] p-6 gap-3 col-span-1">
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
                  {file.cfdi_status && (
                    <div>
                      <CfdiStatus status={file.cfdi_status} variant="inline" />
                    </div>
                  )}
                </div>
              </div>

              {showDownload && (
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex space-x-4">
                    <button
                      id={`download-file-xml-${fileIndex}`}
                      onClick={async () => {
                        const response = await fetch(file.file_url_xml);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `comprobante${fileIndex + 1}.xml`;
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(url);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:cursor-pointer"
                    >
                      {t('refundAcceptance.downloadXml')}
                    </button>
                    <button
                      id={`download-file-pdf-${fileIndex}`}
                      onClick={async () => {
                        const response = await fetch(file.file_url_pdf);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `comprobante${fileIndex + 1}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(url);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 hover:cursor-pointer"
                    >
                      {t('refundAcceptance.downloadPdf')}
                    </button>
                  </div>
                </div>
              )}
        </>
    )
}

export default FilePreviewer;