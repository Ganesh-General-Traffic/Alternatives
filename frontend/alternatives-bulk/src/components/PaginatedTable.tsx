import React, { useState } from "react";

interface PaginatedTableProps {
  dataFrameTable: Array<{ [key: string]: any }>;
  existingClusterColumn: string;
  newPartColumn: string;
}

const PaginatedTable: React.FC<PaginatedTableProps> = ({
  dataFrameTable,
  existingClusterColumn,
  newPartColumn,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 14;

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  } | null>(null);

  const [showBadRows, setShowBadRows] = useState(false);
  const [columnsToHide, setColumnsToHide] = useState<string[]>(["isBadRow"]); // Initialize with isBadRow

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

  const handleHideAdditionalColumns = () => {
    const additionalColumns = Object.keys(dataFrameTable[0]).filter(
      (key) => key.endsWith("_NAlts") || key.endsWith("_PresentInProducts")
    );

    setColumnsToHide((prev) => [...new Set([...prev, ...additionalColumns])]);
  };

  const showAdditionalColumns = () => {
    setColumnsToHide((prev) =>
      prev.filter(
        (key) => !key.endsWith("_NAlts") && !key.endsWith("_PresentInProducts")
      )
    );
  };

  const paginationButtonClassName =
    "px-3 py-1 border rounded mx-1 hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:shadow-lg";

  const [tooltipTopPos, settooltipTopPos] = useState(0);
  const [tooltipLeftPos, settooltipLeftPos] = useState(0);
  const [tooltipVisible, settooltipVisible] = useState(false);
  const [tooltipText, settooltipText] = useState("");

  return (
    <>
      <div
        style={{
          top: `${tooltipTopPos}px`,
          left: `${tooltipLeftPos}px`,
          opacity: `${tooltipVisible ? "1" : "0"}`,
        }}
        className={`absolute z-5 bg-gray-700 text-white p-2 rounded transition-all duration-100`}
      >
        <span className="text-gray-300">{tooltipText}</span>
      </div>
      <div className="mb-6">
        <button
          className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded shadow-md hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Change File
        </button>
      </div>

      <div className="flex items-center">
        <div className="flex item-center my-4 max-w-max select-none">
          <input
            type="checkbox"
            name="badRowsCheckBox"
            id="badRowsCheckBox"
            className="h-[25px] w-[25px] cursor-pointer"
            onChange={(e) => setShowBadRows(e.target.checked)}
          />
          <label
            htmlFor="badRowsCheckBox"
            className="mx-3 text-md cursor-pointer"
          >
            Show Bad Rows
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="additionalColumnsCheckBox"
            id="additionalColumnsCheckBox"
            className="h-[25px] w-[25px] cursor-pointer"
            onChange={(e) => {
              if (e.target.checked) {
                handleHideAdditionalColumns(); // Hide additional columns
              } else {
                showAdditionalColumns(); // Show additional columns
              }
            }}
          />
          <label
            htmlFor="additionalColumnsCheckBox"
            className="mx-3 text-md cursor-pointer"
          >
            Hide/Show Additional Columns
          </label>
        </div>
      </div>

      <div className="border rounded-lg p-3 shadow-lg">
        <table className="table-fixed min-w-full">
          <thead className="border-b select-none">
            <tr>
              {dataFrameTable.length > 0 &&
                Object.keys(dataFrameTable[0])
                  .filter((key) => !columnsToHide.includes(key)) // Exclude columns in columnsToHide
                  .map((key, index) => {
                    // Determine conditional text color
                    const textColor =
                      key === existingClusterColumn
                        ? "text-green-500"
                        : key === newPartColumn
                        ? "text-blue-500"
                        : "";

                    return (
                      <th
                        className={`p-2 cursor-pointer hover:underline ${textColor}`}
                        key={index}
                        onClick={() => handleSort(key)}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect(); // Get position of the current <th>
                          settooltipText(key);
                          settooltipTopPos(rect.top - 40); // Set tooltip position 100px above the element
                          settooltipLeftPos(rect.left);
                          settooltipVisible(true);
                        }}
                        onMouseLeave={() => {
                          settooltipVisible(false);
                          settooltipText("");
                        }}
                      >
                        <div className="flex items-center max-w-max mx-auto">
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
                    );
                  })}
            </tr>
          </thead>

          <tbody>
            {currentData
              .filter((item) => (showBadRows ? item.isBadRow : true)) // Show only bad rows if checked
              .map((item, rowIndex) => {
                const isBadRow = item.isBadRow === true;

                return (
                  <tr
                    key={rowIndex}
                    className={`border-b hover:bg-gray-200 ${
                      isBadRow ? "text-red-500" : ""
                    }`}
                  >
                    {Object.keys(item)
                      .filter((key) => !columnsToHide.includes(key)) // Exclude columns in columnsToHide
                      .map((key, colIndex) => (
                        <td className="py-2" key={colIndex}>
                          {typeof item[key] === "boolean"
                            ? item[key].toString()
                            : item[key]}
                        </td>
                      ))}
                  </tr>
                );
              })}
          </tbody>

          {showBadRows && (
            <caption className="caption-bottom text-gray-500 my-2">
              Showing Bad Rows
            </caption>
          )}
          <caption className="my-2">
            Parts from <span className="text-blue-500">{newPartColumn}</span>{" "}
            will be added to{" "}
            <span className="text-green-500">{existingClusterColumn}</span>{" "}
            clusters
          </caption>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
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
        )}
      </div>
    </>
  );
};

export default PaginatedTable;
