/*
 * Vouchers.tsx
 * Description: Form for users to upload PDF and XML files as evidence for their refund requests.
 * Authors: Original Monarca team
 * Last Modification made:
 * 20/04/2026 [Diego de la Vega] Added destination fallback display to avoid
 *                             null access when destination data is missing.
 * 22/04/2026 [Sebastián Borjas] Added multi-currency support, compact upload buttons, and fixed table cell alignment.
 * 23/04/2026 [Jin Sik Yoon] - Implemented form submission to handle multiple vouchers, added validation for amount field, and enhanced user experience with file upload previews and error handling.
 */

import { Link, useNavigate } from "react-router-dom";
import DynamicTable, {
  TableRow as DynamicTableRow,
  CellValueType,
} from "../../components/Refunds/DynamicTable";
import { useState, useEffect } from "react";
import InputField from "../../components/Refunds/InputField";
import Dropdown from "../../components/Refunds/DropDown";
import { spendOptions, taxIndicatorOptions } from "./local/dummyData";
import { getRequest, patchRequest, postRequest } from "../../utils/apiService";
import { useParams } from "react-router-dom";
import formatMoney from "../../utils/formatMoney";
import { toast } from "react-toastify";
import GoBack from "../../components/GoBack";
import { Tutorial } from "../../components/Tutorial";
import { currencyOptions } from "../../utils/currencies";

/**
 * FormDataRow
 * Interface extending DynamicTableRow to include specific refund voucher fields.
 */
interface FormDataRow extends DynamicTableRow {
  spentClass: string;
  amount: number;
  currency: string;
  taxIndicator: string;
  date: string;
  XMLFile?: File;
  PDFFile?: File;
}

/**
 * Trip
 * Interface representing basic trip information for the header details.
 */
interface Trip {
  id: number | string;
  title: string;
  advance_money: number;
  destination?: {
    city?: string;
    iata_code?: string;
  };
}

/**
 * Vouchers Component
 * Main form for registering refund vouchers associated with a specific trip request.
 * Input: None (uses URL params for ID)
 * Output: JSX.Element - The refund request form view.
 */
export const Vouchers = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState<FormDataRow[]>([]);
  const [trip, setTrip] = useState<Trip>({
    id: 0,
    title: "",
    advance_money: 0,
  });
  const [commentValue, setCommentValue] = useState<string>("");

  /**
   * fetchTrip
   * Fetches the specific trip data from the API using the ID in the URL.
   */
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await getRequest(`/requests/${id}`);
        setTrip(response);
      } catch (err) {
        console.error(
          "Error loading trip: ",
          err instanceof Error ? err.message : err
        );
      }
    };
    fetchTrip();
  }, []);

  /**
   * handleSubmitRefund
   * Processes the form data, uploads each voucher as a multipart/form-data request, 
   * and finalizes the request status.
   * Input: None
   * Output: Promise<void>
   */
  const handleSubmitRefund = async () => {
    if (formData.some((row) => !row.currency)) {
      toast.error("Por favor selecciona una moneda para cada comprobante.");
      return;
    }
    try {
      let formDataToSend = null;
      for (const rowData of formData) {
        formDataToSend = new FormData();

        formDataToSend.append(
          "id_request",
          trip.id.toString()
        );
        formDataToSend.append("date", new Date().toISOString());
        formDataToSend.append("class", rowData.spentClass);
        formDataToSend.append("amount", rowData.amount.toString());
        formDataToSend.append("tax_type", rowData.taxIndicator);
        formDataToSend.append("status", "pending_voucher");
        formDataToSend.append("currency", rowData.currency || "MXN");
        if (rowData.XMLFile) {
          formDataToSend.append("file_url_xml", rowData.XMLFile);
        }

        if (rowData.PDFFile) {
          formDataToSend.append("file_url_pdf", rowData.PDFFile);
        }

        await postRequest("/vouchers/upload", formDataToSend);
        toast.success("Refund request successfully submitted.");
      }
      await patchRequest(`/requests/finished-uploading-vouchers/${id}`, {});
      setFormData([]);
      navigate("/refunds");
    } catch (err) {
      console.error(
        "Error sending refund request: ",
        err instanceof Error ? err.message : err
      );
      toast.error(
        "Error submitting refund request. Please try again later."
      );
    }
  };

  /**
   * Schema definition for the DynamicTable.
   * Defines headers, default values, and custom cell rendering for each column.
   */
  const columnsSchemaVauchers = [
    {
      key: "spentClass",
      header: "Clase de gasto",
      defaultValue: "",
      renderCell: (
        value: CellValueType,
        onChangeComponentFunction: (newValue: CellValueType) => void,
        _rowIndex?: number,
        _cellIndex?: number
      ) => (
        <Dropdown
          id={`spend_class-${_rowIndex}-${_cellIndex}`}
          options={spendOptions}
          value={value as string}
          onChange={(e) => onChangeComponentFunction(e.target.value)}
          placeholder="Clase"
          wrapperClassName="relative flex flex-col"
        />
      ),
    },
    {
      key: "amount",
      header: "Importe",
      defaultValue: "0.00",
      renderCell: (
        value: CellValueType,
        onChangeComponentFunction: (newValue: CellValueType) => void,
        _rowIndex?: number,
        _cellIndex?: number
      ) => (
        <div>
          <div
            onWheelCapture={(e) => {
              e.preventDefault();
              e.stopPropagation();

              const current = Number(value || 0);
              const next =
                e.deltaY < 0 ? current + 1 : Math.max(0, current - 1);

              onChangeComponentFunction(next.toFixed(2));
            }}
            onMouseEnter={() => {
              document.body.style.overflow = "hidden";
            }}
            onMouseLeave={() => {
              document.body.style.overflow = "auto";
            }}
          >
            <InputField
              id={`amount-${_rowIndex}-${_cellIndex}`}
              type="text"
              inputMode="decimal"
              value={(value as string) ?? "0.00"}
              placeholder="0.00"
              onChange={(e) => {
                const val = e.target.value;

                if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                  onChangeComponentFunction(val);
                }
              }}
              onBlur={() => {
                const finalValue =
                  value === "" ? "0.00" : Number(value || 0).toFixed(2);

                onChangeComponentFunction(finalValue);
                document.body.style.overflow = "auto";
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }

                if (e.key === "Enter" && Number(value || 0) === 0) {
                  e.preventDefault();
                  toast.error("El importe no puede ser 0.00");
                }
              }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "currency",
      header: "Moneda",
      defaultValue: "",
      className: "w-32",
      renderCell: (
        value: CellValueType,
        onChangeComponentFunction: (newValue: CellValueType) => void,
        _rowIndex?: number,
        _cellIndex?: number
      ) => (
        <Dropdown
          id={`currency-${_rowIndex}-${_cellIndex}`}
          options={currencyOptions.map((c) => ({ value: c.id, label: c.id }))}
          value={value as string}
          onChange={(e) => onChangeComponentFunction(e.target.value)}
          placeholder="Moneda"
          wrapperClassName="relative flex flex-col"
        />
      ),
    },
    {
      key: "taxIndicator",
      header: "Indicador de Impuestos",
      defaultValue: "",
      className: "w-34",
      renderCell: (
        value: CellValueType,
        onChangeComponentFunction: (newValue: CellValueType) => void,
        _rowIndex?: number,
        _cellIndex?: number
      ) => (
        <Dropdown
          id={`tax_indicator-${_rowIndex}-${_cellIndex}`}
          options={taxIndicatorOptions}
          value={value as string}
          onChange={(e) => onChangeComponentFunction(e.target.value)}
          placeholder="Indicador"
          wrapperClassName="relative flex flex-col"
        />
      ),
    },
    {
      key: "date",
      header: "Fecha de comprobante",
      defaultValue: "",
      renderCell: (
        value: CellValueType,
        onChangeComponentFunction: (newValue: CellValueType) => void,
        _rowIndex?: number,
        _cellIndex?: number
      ) => (
        <div>
          <InputField
            id={`date-${_rowIndex}-${_cellIndex}`}
            type="date"
            value={value as string}
            onChange={(e) => onChangeComponentFunction(e.target.value)}
          />
        </div>
      ),
    },
    {
      key: "XMLFile",
      header: "XML",
      defaultValue: "",
      renderCell: (
        _value: CellValueType,
        onChangeComponentFunction: (newValue: CellValueType) => void,
        rowIndex?: number,
        _cellIndex?: number
      ) => {
        const xmlName = formData[rowIndex || 0]?.XMLFile?.name || "";
        const inputId = `xml_file-${rowIndex}-${_cellIndex}`;
        return (
          <div className="flex flex-col items-center gap-1">
            <input
              id={inputId}
              type="file"
              accept=".xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onChangeComponentFunction(file);
                  if (rowIndex !== undefined) {
                    const updatedFormData = [...formData];
                    if (updatedFormData[rowIndex]) {
                      updatedFormData[rowIndex].XMLFile = file;
                      setFormData(updatedFormData);
                    }
                  }
                }
              }}
            />
            <label
              htmlFor={inputId}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer transition-colors whitespace-nowrap
                ${xmlName
                  ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
                  : "bg-white/20 text-white border border-white/50 hover:bg-white/30"
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {xmlName ? "Cambiar" : "XML"}
            </label>
            {xmlName && (
              <span className="text-xs text-green-200 truncate max-w-[80px]" title={xmlName}>
                {xmlName}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "PDFFile",
      header: "PDF",
      defaultValue: "",
      renderCell: (
        _value: CellValueType,
        onChangeComponentFunction: (newValue: CellValueType) => void,
        rowIndex?: number,
        _cellIndex?: number
      ) => {
        const pdfName = formData[rowIndex || 0]?.PDFFile?.name || "";
        const inputId = `pdf_file-${rowIndex}-${_cellIndex}`;
        return (
          <div className="flex flex-col items-center gap-1">
            <input
              id={inputId}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onChangeComponentFunction(file);
                  if (rowIndex !== undefined) {
                    const updatedFormData = [...formData];
                    if (updatedFormData[rowIndex]) {
                      updatedFormData[rowIndex].PDFFile = file;
                      setFormData(updatedFormData);
                    }
                  }
                }
              }}
            />
            <label
              htmlFor={inputId}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer transition-colors whitespace-nowrap
                ${pdfName
                  ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
                  : "bg-white/20 text-white border border-white/50 hover:bg-white/30"
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {pdfName ? "Cambiar" : "PDF"}
            </label>
            {pdfName && (
              <span className="text-xs text-green-200 truncate max-w-[80px]" title={pdfName}>
                {pdfName}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  /**
   * Syncs the local state with the table's updated data.
   * Input: data (DynamicTableRow[])
   */
  const handleFormDataChange = (newData: FormDataRow[]) => {
    setFormData(newData);
  };

  const handleDynamicTableDataChange = (data: DynamicTableRow[]) => {
    handleFormDataChange(data as FormDataRow[]);
  };

  return (
    <>
      <Tutorial page="vouchers">
        <GoBack />
        <div className="max-w-full p-6 bg-[#eaeced] rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-[#0a2c6d] mb-1">
            Solicitud de comprobante
          </h2>
          <div className="mb-4">
            {/*
          * Display general information about the trip, such as ID, name, destination,
          */}
            <h3 className="text-lg font-bold text-[#0a2c6d] mb-2">
              Información del viaje
            </h3>
            <p>
              <strong>Viaje ID:</strong> {trip.id}
            </p>
            <p>
              <strong>Nombre de viaje:</strong> {trip.title}
            </p>
            <p>
              <strong>Destino:</strong> {trip.destination?.city || trip.destination?.iata_code || "Destino no disponible"}
            </p>
            <p>
              <strong>Anticipo:</strong> {formatMoney(trip.advance_money)}
            </p>
          </div>
          {/*
        * which contains the schema of the table.
        * The table is created initially with initially empty data,
        * and the user can add new rows to the table.
        * The formData array is updated with the handleFormDataChange function,
        * which is passed as a prop to the DynamicTable component.
        * The handleFormDataChange function updates the formData state with the new data.
        */}
          <div id="vouchers">
            <DynamicTable
              columns={columnsSchemaVauchers}
              initialData={formData}
              onDataChange={handleDynamicTableDataChange}
            />
          </div>
          {/*
        * Display a field to add a comment to the refund request.
        * The comment is stored in the commentDescriptionOfSpend state,
        * and is updated with the setCommentDescriptionOfSpend function.
        */}
          <h3 className="text-lg font-bold text-[#0a2c6d] mt-4 mb-2">Comentarios</h3>
          <InputField
            id="comment-refund"
            type="text"
            value={commentValue}
            placeholder="Escribe comentarios"
            onChange={(e) => setCommentValue(e.target.value)}
          />
          <div className="mt-6 flex justify-between">
            <Link
              to="/refunds"
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors hover:cursor-pointer"
            >
              Cancelar
            </Link>
            <button
              id="submit-refund"
              className="px-4 py-2 bg-[#0a2c6d] text-white rounded-md hover:bg-[#0d3d94] transition-colors hover:cursor-pointer"
              onClick={() => {
                handleSubmitRefund();
              }}
            >
              Enviar
            </button>
          </div>
        </div>
      </Tutorial>
    </>
  );
};
