/**
 * DynamicTableExpand.tsx
 * Description: Dynamic table component that renders configurable columns and rows, supports custom cell rendering, row editing, adding new rows, and optional expandable row content.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Jin Sik Yoon] Added expandable row support (expandedRows + renderExpandedRow) and updated documentation for clarity and maintainability.
 */
import React, { useState } from "react";

/**
 * Column, schema that defines the structure and rendering behavior of each table column.
 * Input:
 * - key (string): Row object key used to access the cell value dynamically.
 * - header (string): Column header label.
 * - defaultValue (string | number | boolean | null | undefined | ReactNode): Default value used when creating a new row.
 * - renderCell (function | undefined): Optional custom cell renderer that receives the current value, an update callback, and the row index.
 * Output: Column interface - Used to build table headers, default row values, and cell rendering.
 *
 * Notes:
 * - Example usage can be found in: src/pages/Refunds/Refunds.tsx
 */
interface Column {
  key: string;
  header: string;
  defaultValue?: string | number | boolean | null | undefined | React.ReactNode;
  renderCell?: (
    value: string | number | boolean | null | undefined | React.ReactNode,
    handleFieldChange: Function,
    rowIndex?: number
  ) => React.ReactNode;
}

/**
 * DynamicTableExpandProps, defines the props for the DynamicTableExpand component.
 * Input:
 * - columns (Column[]): Column definitions for rendering headers and cells.
 * - initialData (Record<string, any>[] | undefined): Optional initial rows for populating the table.
 * - onDataChange ((data: Record<string, any>[]) => void | undefined): Optional callback invoked after table data changes.
 * - expandedRows (number[] | undefined): Optional list of row indexes that should display expandable content.
 * - renderExpandedRow ((index: number) => ReactNode | undefined): Optional renderer for expanded content shown under a row.
 * Output: DynamicTableExpandProps interface - Used to type-check component props.
 */
interface DynamicTableExpandProps {
  columns: Column[];
  initialData?: Record<string, any>[];
  onDataChange?: (data: Record<string, any>[]) => void;
  expandedRows?: number[];
  renderExpandedRow?: (index: number) => React.ReactNode;
}

/**
 * DynamicTableExpand, renders a table with dynamic columns and rows, supports editing cells, adding rows, and optionally expanding rows to show additional content.
 * Input: DynamicTableExpandProps - Columns, initial rows, change callback, and optional expandable-row configuration.
 * Output: JSX.Element - Table UI with optional expanded row sections and an action button to add new rows.
 */
const DynamicTableExpand: React.FC<DynamicTableExpandProps> = ({
  columns,
  initialData = [],
  onDataChange,
  expandedRows = [],
  renderExpandedRow,
}) => {
  const [tableData, setTableData] = useState<Record<string, any>[]>(initialData as Record<string, any>[]);

  /**
   * handleFieldChange, updates a single cell value in the table state and notifies the parent through onDataChange when provided.
   * Input:
   * - rowIndex (number): Index of the row being updated.
   * - columnKey (string): Column key that identifies which field to update.
   * - newValue (string | number | boolean | null | undefined | ReactNode): New value to set for the field.
   * Output: void - Updates internal state and triggers onDataChange(updatedData) when available.
   */
  const handleFieldChange = (
    rowIndex: number,
    columnKey: string,
    newValue: string | number | boolean | null | undefined | React.ReactNode
  ) => {
    const updatedData = [...tableData];

    updatedData[rowIndex] = {
      ...updatedData[rowIndex],
      [columnKey]: newValue,
    };

    setTableData(updatedData);

    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  /**
   * addItem, appends a new row to the table using column defaultValue values (or an empty string when defaultValue is not provided).
   * Input: None.
   * Output: void - Updates internal state and triggers onDataChange(updatedData) when available.
   */
  const addItem = () => {
    const defaultRow = columns.reduce((obj: Record<string, any>, column) => {
      obj[column.key] = column.defaultValue || "";
      return obj;
    }, {} as Record<string, any>);

    const updatedData = [...tableData, defaultRow];
    setTableData(updatedData);

    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  return (
    <div className="relative">
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 border-separate border-spacing-y-2">
          <thead>
            <tr className="text-xs text-white uppercase bg-[#0a2c6d]">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-2 text-center ${
                    index === 0 ? "rounded-l-lg" : ""
                  } ${index === columns.length - 1 ? "rounded-r-lg" : ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <tr className="bg-[#4C6997] text-white text-center">
                  {columns.map((column, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`px-4 py-3 ${
                        cellIndex === 0 ? "rounded-l-lg" : ""
                      } ${
                        cellIndex === columns.length - 1 ? "rounded-r-lg" : ""
                      }`}
                    >
                      {column.renderCell
                        ? column.renderCell(
                            row[column.key],
                            (newValue: any) =>
                              handleFieldChange(rowIndex, column.key, newValue),
                            rowIndex
                          )
                        : row[column.key]}
                    </td>
                  ))}
                </tr>

                {/* Expanded row (optional) */}
                {expandedRows.includes(rowIndex) && renderExpandedRow && (
                  <tr className="bg-[#f4f6f8] text-black">
                    <td colSpan={columns.length} className="px-6 py-4">
                      {renderExpandedRow(rowIndex)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-center">
        <button
          onClick={addItem}
          className="px-4 py-2 bg-[#0a2c6d] text-white rounded-md hover:bg-[#0d3d94] transition-colors hover:cursor-pointer"
        >
          + Añadir comprobante de gasto
        </button>
      </div>
    </div>
  );
};

export default DynamicTableExpand;
