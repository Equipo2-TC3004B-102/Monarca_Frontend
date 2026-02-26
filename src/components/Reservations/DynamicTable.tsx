/**
 * DynamicTable.tsx
 * Description: Dynamic table component that renders configurable columns and rows. Supports custom cell rendering and propagates cell updates to the parent via onDataChange.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Jin Sik Yoon] Added detailed comments and documentation for clarity and maintainability.
 */

import React, { useState, ReactNode } from "react";

/**
 * Column, schema that defines the structure and rendering behavior of each table column.
 * Input:
 * - key (string): Row object key used to access the cell value dynamically.
 * - header (string): Column header label.
 * - defaultValue (string | number | boolean | null | undefined | ReactNode): Optional default value (useful for row creation in parent components).
 * - renderCell (function | undefined): Optional custom cell renderer. Receives current cell value and a callback to update that cell.
 * Output: Column interface - Used to render the table header and control cell rendering behavior.
 */
interface Column {
  key: string;
  header: string;
  defaultValue?: string | number | boolean | null | undefined | ReactNode;
  renderCell?: (
    value: string | number | boolean | null | undefined | ReactNode,
    handleFieldChange: (
      newValue: string | number | boolean | null | undefined | ReactNode
    ) => void
  ) => React.ReactNode;
}

/**
 * TableRow, represents a generic table row where each field maps a column key to a value.
 * Input: N/A
 * Output: TableRow interface - Used to type the table data state.
 */
interface TableRow {
  [key: string]: string | number | boolean | null | undefined | ReactNode;
}

/**
 * DynamicTableProps, defines the props for the DynamicTable component.
 * Input:
 * - columns (Column[]): Column definitions for rendering headers and cells.
 * - initialData (TableRow[] | undefined): Optional initial rows for populating the table.
 * - onDataChange ((data: TableRow[]) => void | undefined): Optional callback invoked whenever the table data changes.
 * Output: DynamicTableProps interface - Used to type-check component props.
 */
interface DynamicTableProps {
  columns: Column[];
  initialData?: TableRow[];
  onDataChange?: (data: TableRow[]) => void;
}

/**
 * DynamicTable, renders a dynamic table with customizable columns and per-cell rendering.
 * Input: DynamicTableProps - Columns configuration, initial rows, and optional change callback.
 * Output: JSX.Element - Table UI that renders rows and cells based on provided configuration.
 */
const DynamicTable: React.FC<DynamicTableProps> = ({
  columns,
  initialData = [],
  onDataChange,
}) => {
  const [tableData, setTableData] = useState<TableRow[]>(
    initialData as TableRow[]
  );

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
    newValue: string | number | boolean | null | undefined | ReactNode
  ): void => {
    const updatedData = [...tableData];
    updatedData[rowIndex] = {
      ...updatedData[rowIndex],
      [columnKey]: newValue,
    };
    setTableData(updatedData);
    if (onDataChange) onDataChange(updatedData);
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
              <tr
                key={rowIndex}
                className="bg-[#4C6997] text-white text-center"
              >
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
                      ? column.renderCell(row[column.key], (newValue) =>
                          handleFieldChange(rowIndex, column.key, newValue)
                        )
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DynamicTable;
