/*
 * Vouchers.tsx
 * Description: Form for users to upload PDF and XML files as evidence for their refund requests.
 * Authors: Original Monarca team
 * Last Modification made:
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

/**
 * FormDataRow
 * Interface extending DynamicTableRow to include specific refund voucher fields.
 */
interface FormDataRow extends DynamicTableRow {
  spentClass: string;
  amount: number;
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
        formDataToSend.append("currency", "MXN");
        formDataToSend.append("id_approver", "");
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
      navigate("/refunds");
    } catch (err) {
      console.error(
        "Error sending refund request: ",
        err instanceof Error ? err.message : err
      );
      toast.error(
        "Error submitting refund request. Please try again later."
      );
    } finally {
      
      setFormData([]);
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
            onKeyDown={(e) => {
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
      ),
    },
    {
      key: "taxIndicator",
      header: "Indicador de Impuestos",
      defaultValue: "",
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
        <InputField
          id={`date-${_rowIndex}-${_cellIndex}`}
          type="date"
          value={value as string}
          onChange={(e) => onChangeComponentFunction(e.target.value)}
        />
      ),
    },
    {
      key: "XMLFile",
      header: "Archivo XML",
      defaultValue: "",
      renderCell: (
        _value: CellValueType,
        onChangeComponentFunction: (newValue: CellValueType) => void,
        rowIndex?: number,
        _cellIndex?: number
      ) => (
        <InputField
          id={`xml_file-${rowIndex}-${_cellIndex}`}
          selectedFileName={formData[rowIndex || 0]?.XMLFile?.name || ""}
          type="file"
          accept=".xml"
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
          placeholder="Sube archivo XML"
        />
      ),
    },
    {
      key: "PDFFile",
      header: "Archivo PDF",
      defaultValue: "",
      renderCell: (
        _value: CellValueType,
        onChangeComponentFunction: (newValue: CellValueType) => void,
        rowIndex?: number,
        _cellIndex?: number
      ) => (
        <InputField
          id={`pdf_file-${rowIndex}-${_cellIndex}`}
          selectedFileName={formData[rowIndex || 0]?.PDFFile?.name || ""}
          type="file"
          accept=".pdf"
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
          placeholder="Sube archivo PDF"
        />
      ),
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
