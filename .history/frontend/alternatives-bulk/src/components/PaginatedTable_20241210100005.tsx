import React, { useState } from "react";

interface PaginatedTableProps {
  dataFrameTable: Array<{ [key: string]: any }>;
}

const PaginatedTable: React.FC<PaginatedTableProps> = ({ dataFrameTable }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  } | null>(null);

  // Calculate total pages
  const totalPages = Math.ceil(dataFrameTable.length / rowsPerPage);

  const sortedData = React.useMemo(() => {
    if (sortConfig !== null) {
      return [...dataFrameTable].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return dataFrameTable;
  }, [dataFrameTable, sortConfig]);

  const currentData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return {
          key,
          direction:
            prev.direction === "ascending" ? "descending" : "ascending",
        };
      }
      return { key, direction: "ascending" };
    });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const paginationButtonClassName =
    "px-3 py-1 border rounded mx-1 hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:shadow-lg";

  return (
    <>
      <div className="mb-6">
        <button
          className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded shadow-md hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Change File
        </button>
      </div>
      <div className="border rounded-lg p-3 shadow-lg">
        <table>
          <thead className="border-b">
            <tr>
              {dataFrameTable.length > 0 &&
                Object.keys(dataFrameTable[0]).map((key, index) => (
                  <th
                    className="p-2 cursor-pointer hover:underline"
                    key={index}
                    onClick={() => handleSort(key)}
                  >
                    <div>
                      {key}
                      {sortConfig?.key === key && (
                        <span
                          className="ml-1 text-xs align-middle"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {sortConfig.direction === "ascending" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>

          <tbody>
            {currentData.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className={`border-b hover:bg-gray-100 ${
                  Object.values(item).includes(false) ? "text-red-600" : ""
                }`}
              >
                {Object.keys(item).map((key, colIndex) => (
                  <td className="py-2" key={colIndex}>
                    {typeof item[key] === "boolean"
                      ? item[key].toString()
                      : item[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-4">
          {/* Go to First Page Button */}
          <button
            className={paginationButtonClassName}
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            First
          </button>

          {/* Previous Page Button */}
          <button
            className={paginationButtonClassName}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {/* Page Number Buttons */}
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={`${paginationButtonClassName} ${
                currentPage === index + 1 ? "bg-gray-300" : ""
              }`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          {/* Next Page Button */}
          <button
            className={paginationButtonClassName}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>

          {/* Go to Last Page Button */}
          <button
            className={paginationButtonClassName}
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </button>
        </div>
      </div>
    </>
  );
};

export default PaginatedTable;