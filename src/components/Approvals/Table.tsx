/**
 * Table.tsx
 * Description: Reusable table component with pagination, row expansion for details, and custom action links.
 * Authors: Original Monarca team
 * Last Modification made:
 * 25/02/2026 [Diego Ortega] Added Specified Format.
 */

import { Link } from "react-router-dom";
import React, { ReactNode, useState, useEffect } from "react";

/**
 * Column
 * Interface representing a table column definition.
 */
interface Column {
  key: string;
  header: string;
}

/**
 * TableProps
 * Interface for component properties.
 * - columns: Configuration for main visible columns.
 * - data: Array of objects containing row information.
 * - itemsPerPage: Number of rows per page (defaults to 5).
 * - link: Base URL for the "Ver detalles" action.
 */
interface TableProps {
  columns: Array<Column>;
  data: Array<{
    id: number;
    [key: string]: string | number | boolean | null | undefined | ReactNode;
  }>;
  itemsPerPage?: number;
  link: string;
}

/**
 * Table Component
 * Displays a paginated table where rows can be expanded to show extra information (requester, email, motive, etc.).
 * * Input:
 * - columns (Column[]): The headers and keys to display.
 * - data (any[]): The source data to populate the rows.
 * - itemsPerPage (number, optional): Paging size.
 * - link (string): Navigation path for the row details.
 * * Output:
 * - JSX.Element: A structured HTML table with pagination and interactive rows.
 */
const Table: React.FC<TableProps> = ({
  columns,
  data,
  itemsPerPage = 5,
  link,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [localData, setLocalData] = useState(data);

  /**
   * Effect to sync internal state when external data changes.
   */
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const totalPages = Math.ceil(localData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = localData.slice(indexOfFirstItem, indexOfLastItem);

  /**
   * Handles page changes ensuring the index stays within bounds.
   * Input: page (number)
   */
  const changePage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  /**
   * Toggles the visibility of the detailed information row.
   * Input: rowId (number | string)
   */
  const toggleExpand = (rowId: number) => {
    setExpandedRowId((curr) => (curr === rowId ? null : rowId));
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
                  } ${
                    index === columns.length - 1 ? "" : ""
                  }`}
                >
                  {column.header}
                </th>
              ))}

              <th className="px-4 py-2 text-center border-r border-[#0a2c6d]">
                Details
              </th>

              <th className="px-4 py-2 text-center rounded-r-lg">Data</th>
            </tr>
          </thead>

          <tbody>
            {currentItems.length <= 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="text-center pt-10">
                  No data available.
                </td>
              </tr>
            ) : currentItems.map((row: any) => (
              <React.Fragment key={row.id}>
                <tr className="bg-[#4C6997] text-white text-center">
                  {columns.map((column, cidx) => (
                    <td
                      key={cidx}
                      className={`py-3 ${
                        cidx === 0 ? "rounded-l-lg" : ""
                      } ${
                        cidx === columns.length - 1 ? "" : ""
                      } ${
                        column.key === "status" ? "px-0" : "px-4"
                    }`}
                    >
                      {row[column.key] !== undefined && row[column.key] !== null
                        ? row[column.key]
                        : "N/A"}
                    </td>
                  ))}

                  <td className="text-sm">
                    <Link
                      to={`${link}/${row.id}`}
                      className="bg-[var(--white)] text-[var(--blue)] p-1 rounded-sm"
                    >
                      See Details
                    </Link>
                  </td>

                  <td className="px-4 py-3 rounded-r-lg">
                    <button
                      onClick={() => toggleExpand(row.id)}
                      className="text-xl hover:text-gray-700"
                      aria-label="Expandir detalles"
                    >
                      {expandedRowId === row.id ? "▲" : "▼"}
                    </button>
                  </td>
                </tr>

                {expandedRowId === row.id && (
                  <tr>
                    <td
                      colSpan={columns.length + 2}
                      className="bg-white text-black p-4 rounded-b-lg"
                    >
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <strong>Applicant:</strong>{" "}
                          {`${row?.user?.name} ${row?.user?.last_name}`}
                        </div>
                        <div>
                          <strong>E-Mail:</strong>{" "}
                          {row?.user?.email}
                        </div>
                        <div>
                          <strong>Approver:</strong>{" "}
                          {`${row?.admin?.name} ${row?.admin?.last_name}`}
                        </div>
                        <div>
                          <strong>Status:</strong> {row?.status}
                        </div>
                        <div>
                          <strong>Motive:</strong> {row?.motive}
                        </div>
                        <div>
                          <strong>Departure date:</strong> {row?.departureDate}
                        </div>
                        <div>
                          <strong>Department:</strong> {row?.user?.department?.name ?? "N/A"}
                        </div>
                        <div>
                          <strong>Cost Center:</strong> {row?.user?.department?.cost_center?.name ?? "N/A"}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg bg-[#0a2c6d] text-white disabled:opacity-50"
            aria-label="Página anterior"
          >
            &lt;
          </button>

          <span className="text-[#0a2c6d] font-medium">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg bg-[#0a2c6d] text-white disabled:opacity-50"
            aria-label="Página siguiente"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
