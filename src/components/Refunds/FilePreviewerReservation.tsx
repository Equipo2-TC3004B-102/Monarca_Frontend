/**
 * FileName: FilePreviewerReservation.tsx
 * Description: This file contains the FilePreviewer component used in the 
 * Refunds section of the application, specifically for reservation files.
 * It provides a preview of a reservation file with its metadata and download options.
 * Authors: Original Moncarca team
 * Last Modification made: 
 * 17/04/2026 [Rebeca-Davila] Made the container for the pdf previews smaller for mobil screens
 */
import formatMoney from "../../utils/formatMoney";


interface FilePreviewerProps {
    file: {
        link: string;
        class: string;
        price: number;
    };
    fileIndex: number;
}

/**
 * FilePreviewer, displays a reservation file preview with price metadata and PDF download option.
 * Input: file (object with link, class, price), fileIndex (number)
 * Output: JSX element - a preview panel with iframe and price information with PDF download button
 */

const FilePreviewer = ({ file, fileIndex }: FilePreviewerProps) => {
    return (
        <>
          <div className="flex flex-col">
            <div className="flex flex-col bg-white p-6 gap-3 col-span-1 ml-14">
              <p id={`price-file-${fileIndex}`}><span className="font-semibold text-[var(--blue)]">Cantidad: </span><span className="text-green-700">{formatMoney(file.price)}</span></p>
            </div>
            <div className="w-[100%] max-w-4xl h-[70vh] lg:h-[90vh] relative self-center">
              <iframe
                src={`${file.link}#navpanes=0&view=FitH`}
                width="100%"
                height="100%"
                title={`Comprobante de Solicitud ${fileIndex + 1}`}
                className="border-0 col-span-2"
            /> 
          </div>
          </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex space-x-4">
                  <button
                    onClick={async () => {
                      const response = await fetch(file.link);
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
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer"
                  >
                    Descargar PDF
                  </button>
                </div>
              </div>
        </>
    )
}

export default FilePreviewer;