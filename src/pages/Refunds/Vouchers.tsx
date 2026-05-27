/*
 * Vouchers.tsx
 * Description: Form for users to upload PDF and XML files as evidence for their refund requests.
 * Authors: Original Monarca team
 * Last Modification made:
 * 25/05/2026 [Santiago Coronado Hernández] Added CfdiStatus component.
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
import CfdiStatus from "../../components/Refunds/CfdiStatus";
import { Tutorial } from "../../components/Tutorial";
import { currencyOptions } from "../../utils/currencies";
import { isFileSizeValid, getFileSizeErrorMessage, validateFile } from "../../utils/fileValidation";
import { useTranslation } from "react-i18next";

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
  cfdiStatus?: string;
  isCheckingCfdi?: boolean;
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
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormDataRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        // DEBUG: log vouchers to verify cfdi_status presence
        // Remove or disable this log after verification
        // eslint-disable-next-line no-console
        console.debug('Vouchers.fetchTrip response.vouchers:', response?.vouchers);
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
      toast.error(t('vouchers.selectCurrencyError'));
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      let formDataToSend = null;
      for (const rowData of formData) {
        // Require PDF file; XML is optional. If XML is provided, validate it.
        if (!rowData.PDFFile) {
          toast.error(t('vouchers.pdfRequired') || 'PDF file is required for each voucher.');
          setIsSubmitting(false);
          return;
        }

        // Validate PDF (size + extension + mime)
        const pdfValidation = validateFile(rowData.PDFFile as File, ['.pdf'], ['application/pdf']);
        if (!pdfValidation.isValid) {
          toast.error(pdfValidation.errorMessage || t('vouchers.invalidPDF'));
          setIsSubmitting(false);
          return;
        }

        // If an XML file was attached, validate it before sending.
        if (rowData.XMLFile) {
          const xmlValidation = validateFile(rowData.XMLFile as File, ['.xml'], ['application/xml', 'text/xml']);
          if (!xmlValidation.isValid) {
            toast.error(xmlValidation.errorMessage || t('vouchers.invalidXML'));
            setIsSubmitting(false);
            return;
          }
        }

        formDataToSend = new FormData();

        formDataToSend.append("id_request", trip.id.toString());
        formDataToSend.append("date", rowData.date ? new Date(rowData.date).toISOString() : new Date().toISOString());
        formDataToSend.append("class", rowData.spentClass);
        formDataToSend.append("amount", rowData.amount.toString());
        formDataToSend.append("tax_type", rowData.taxIndicator);
        formDataToSend.append("status", "pending_voucher");
        formDataToSend.append("currency", rowData.currency || "MXN");
        if (rowData.XMLFile) {
          formDataToSend.append("xml", rowData.XMLFile);
        }

        if (rowData.PDFFile) {
          formDataToSend.append("pdf", rowData.PDFFile);
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
      const rawMsg = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
      const apiMessage = typeof rawMsg === 'string' ? rawMsg
        : Array.isArray(rawMsg) ? (rawMsg as string[]).join(', ')
          : null;
      toast.error(apiMessage ?? t('vouchers.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Schema definition for the DynamicTable.
   * Defines headers, default values, and custom cell rendering for each column.
   */
  const columnsSchemaVauchers = [
    {
      key: "spentClass",
      header: t('vouchers.colSpentClass'),
      className: "w-40",
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
          placeholder={t('vouchers.classPlaceholder')}
          wrapperClassName="relative flex flex-col"
        />
      ),
    },
    {
      key: "amount",
      header: t('vouchers.colAmount'),
      className: "w-24",
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
                  toast.error(t('vouchers.amountError'));
                }
              }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "currency",
      header: t('vouchers.colCurrency'),
      defaultValue: "",
      className: "w-20",
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
          placeholder={t('vouchers.currencyPlaceholder')}
          wrapperClassName="relative flex flex-col"
        />
      ),
    },
    {
      key: "taxIndicator",
      header: t('vouchers.colTaxIndicator'),
      defaultValue: "",
      className: "w-40",
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
          placeholder={t('vouchers.indicatorPlaceholder')}
          wrapperClassName="relative flex flex-col"
        />
      ),
    },
    {
      key: "date",
      header: t('vouchers.colDate'),
      className: "w-24",
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
      header: t('vouchers.colXML'),
      className: "w-20",
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
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Validate file size
                  if (!isFileSizeValid(file)) {
                    toast.error(getFileSizeErrorMessage(file.name, file.size));
                    e.target.value = "";
                    return;
                  }

                  onChangeComponentFunction(file);
                  if (rowIndex !== undefined) {
                    const updatedFormData = [...formData];
                    if (updatedFormData[rowIndex]) {
                      updatedFormData[rowIndex].XMLFile = file;
                      updatedFormData[rowIndex].isCheckingCfdi = true;
                      updatedFormData[rowIndex].cfdiStatus = undefined;
                      setFormData(updatedFormData);

                      try {
                        const fd = new FormData();
                        fd.append("xml", file);
                        const result = await postRequest("/vouchers/parse-xml", fd);

                        const latestFormData = [...formData];
                        if (latestFormData[rowIndex]) {
                          latestFormData[rowIndex].XMLFile = file;
                          latestFormData[rowIndex].isCheckingCfdi = false;
                          latestFormData[rowIndex].cfdiStatus = result.cfdi_status;

                          // Auto-populate values if present
                          if (result.amount) {
                            latestFormData[rowIndex].amount = result.amount;
                          }
                          if (result.currency) {
                            latestFormData[rowIndex].currency = result.currency;
                          }
                          if (result.date) {
                            const dateStr = result.date.split("T")[0];
                            latestFormData[rowIndex].date = dateStr;
                          }
                          setFormData(latestFormData);
                        }
                      } catch (err) {
                        console.error("Error parsing XML:", err);
                        const apiMsg = (err as any)?.response?.data?.message;
                        toast.error(typeof apiMsg === "string" ? apiMsg : "Error parsing XML file.");

                        const resetFormData = [...formData];
                        if (resetFormData[rowIndex]) {
                          resetFormData[rowIndex].XMLFile = undefined;
                          resetFormData[rowIndex].isCheckingCfdi = false;
                          resetFormData[rowIndex].cfdiStatus = undefined;
                          setFormData(resetFormData);
                        }
                      }
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
              {xmlName ? t('vouchers.changeFile') : t('vouchers.colXML')}
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
      header: t('vouchers.colPDF'),
      className: "w-20",
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
                  // Validate file size
                  if (!isFileSizeValid(file)) {
                    toast.error(getFileSizeErrorMessage(file.name, file.size));
                    e.target.value = "";
                    return;
                  }

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
              {pdfName ? t('vouchers.changeFile') : t('vouchers.colPDF')}
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
    {
      key: "cfdiStatus",
      header: t('vouchers.colCfdiStatus') || 'CFDI Status',
      className: "w-24",
      defaultValue: "",
      renderCell: (
        _value: CellValueType,
        _onChangeComponentFunction: (newValue: CellValueType) => void,
        rowIndex?: number,
        _cellIndex?: number
      ) => {
        const row = formData[rowIndex || 0];
        if (row?.isCheckingCfdi) {
          return <span className="text-xs text-blue-200 animate-pulse font-medium">{t('vouchers.checkingCfdi') || 'Checking...'}</span>;
        }
        if (row?.cfdiStatus) {
          return <CfdiStatus status={row.cfdiStatus} variant="pill" />;
        }
        return <span className="text-xs text-gray-300">—</span>;
      }
    }
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
        <div className="max-w-full p-6 bg-[var(--color-card-bg)] rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-[var(--color-page-text-title)] mb-1">
            {t('vouchers.title')}
          </h2>
          <div className="mb-4">
            {/*
          * Display general information about the trip, such as ID, name, destination,
          */}
            <h3 className="text-lg font-bold text-[var(--color-page-text-title)] mb-2">
              {t('vouchers.tripInfo')}
            </h3>
            <p className="text-[var(--color-page-text)]">
              <strong>{t('vouchers.tripId')}</strong> {trip.id}
            </p>
            <p className="text-[var(--color-page-text)]">
              <strong>{t('vouchers.tripName')}</strong> {trip.title}
            </p>
            <p className="text-[var(--color-page-text)]">
              <strong>{t('vouchers.destination')}</strong> {trip.destination?.city || trip.destination?.iata_code || t('historial.noDestination')}
            </p>
            <p className="text-[var(--color-page-text)]">
              <strong>{t('vouchers.advance')}</strong> {formatMoney(trip.advance_money)}
            </p>
          </div>
          {/** Existing uploaded vouchers (read-only) */}
          {/** Show CFDI pill for each existing voucher if present */}
          {trip && (trip as any).vouchers && (trip as any).vouchers.length > 0 && (
            <div className="mb-4 bg-[var(--color-page-bg)] p-4 rounded-md border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-[var(--color-page-text)] mb-2">{t('vouchers.existingVouchers')}</h3>
              <div className="flex flex-col gap-3">
                {(trip as any).vouchers.map((v: any, idx: number) => (
                  <div key={v.id || idx} className="flex items-center justify-between p-2 bg-[var(--color-card-bg)] rounded-md">
                    <div className="text-sm text-[var(--color-page-text)]">
                      <div><span className="font-semibold">{t('refundAcceptance.voucherClass')}: </span>{v.class}</div>
                      <div><span className="font-semibold">{t('refundAcceptance.amountMxn')}: </span>{formatMoney(v.amount)}</div>
                      <div><span className="font-semibold">{t('refundAcceptance.date')}: </span>{v.date ? new Date(v.date).toLocaleDateString() : ''}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CfdiStatus status={v.cfdi_status} variant="pill" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
          <h3 className="text-lg font-bold text-[var(--color-page-text-title)] mt-4 mb-2">{t('vouchers.comments')}</h3>
          <InputField
            id="comment-refund"
            type="text"
            value={commentValue}
            placeholder={t('vouchers.commentsPlaceholder')}
            onChange={(e) => setCommentValue(e.target.value)}
          />
          <div className="mt-6 flex justify-between">
            <Link
              to="/refunds"
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors hover:cursor-pointer"
            >
              {t('vouchers.cancel')}
            </Link>
            <button
              id="submit-refund"
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded-md transition-colors ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#0a2c6d] hover:bg-[#0d3d94] hover:cursor-pointer"}`}
              onClick={() => {
                handleSubmitRefund();
              }}
            >
              {isSubmitting ? t('common.loading') : t('vouchers.submit')}
            </button>
          </div>
        </div>
      </Tutorial>
    </>
  );
};
