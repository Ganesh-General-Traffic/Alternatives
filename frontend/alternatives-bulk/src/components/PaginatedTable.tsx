import React, { useState } from "react";
import { RiRefreshLine } from "react-icons/ri";
import SwapConfirmationModal from "./SwapConfirmationModal";
import { toast } from "sonner";

interface PaginatedTableProps {
  dataFrameTable: Array<{ [key: string]: any }>;
  existingClusterColumn: string;
  newPartColumn: string;
  setExistingClusterColumn: React.Dispatch<React.SetStateAction<string>>;
  setNewPartColumn: React.Dispatch<React.SetStateAction<string>>;
  setDataFrameTable: React.Dispatch<
    React.SetStateAction<
      {
        [key: string]: any;
      }[]
    >
  >;
}

const PaginatedTable: React.FC<PaginatedTableProps> = ({
  dataFrameTable,
  existingClusterColumn,
  newPartColumn,
  setExistingClusterColumn,
  setNewPartColumn,
  setDataFrameTable,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 14;

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  } | null>(null);

  const [showBadRows, setShowBadRows] = useState(false);
  const [columnsToHide, setColumnsToHide] = useState<string[]>([
    "isBadRow",
    "id",
  ]); // Initialize with isBadRow

  const [swapCaptionVisible, setSwapCaptionVisible] = useState(true);

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

  const badRowsPresent = () => {
    return dataFrameTable.some((row) => row.isBadRow === true);
  };

  const SWAP = () => {
    const temp = existingClusterColumn;
    setExistingClusterColumn(newPartColumn);
    setNewPartColumn(temp);
  };

  const handleColumnsTagSwap = () => {
    // const keys = Object.keys(dataFrameTable[0]);
    setSwapConfirmationModal(true);
  };

  const handleSwapConfirm = () => {
    setSwapConfirmationModal(false);
    SWAP();
  };

  const handleSwapCancel = () => {
    setSwapConfirmationModal(false);
  };

  const [mainSaveButtonDisabled, setMainSaveButtonDisabled] = useState(false);

  const handleDBUpdate = async () => {
    setMainSaveButtonDisabled(true);

    // Set all rows to `Processed: -1` before sending the request
    setDataFrameTable((prev) =>
      prev.map((item) => ({ ...item, Processed: -1 }))
    );

    try {
      const response = await fetch("/updateDB", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partList: dataFrameTable.map((row) => [
            row[existingClusterColumn],
            row[newPartColumn],
          ]),
        }),
      });

      if (!response.ok) {
        toast.error(`Something went wrong. Status : ${response.statusText}`);
        throw new Error(`Failed to update DB: ${response.statusText}`);
      }

      // Process the event stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done && reader) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const decodedValue = decoder.decode(value);

          // Split and process each line separately
          for (const line of decodedValue.split("\n")) {
            if (line.trim() !== "") {
              const parsed = JSON.parse(line);
              const { part, status } = parsed;

              // Update Processed column based on status
              setDataFrameTable((prev) => {
                const updatedTable = prev.map((item) =>
                  item[existingClusterColumn] === part[0] &&
                  item[newPartColumn] === part[1]
                    ? { ...item, Processed: status === "success" ? 1 : 0 }
                    : item
                );
                return updatedTable;
              });

              // Wait briefly to ensure React processes the update
              await new Promise((resolve) => setTimeout(resolve, 50)); // Small delay to allow UI rendering
            }
          }
        }
      }

      toast.success("Done, check Processed column");
    } catch (error) {
      console.error("Error updating DB:", error);
      toast.error("Failed to update DB");
    } finally {
      setSwapCaptionVisible(false);
    }
  };

  const paginationButtonClassName =
    "px-3 py-1 border rounded m-1 hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:shadow-lg";

  const [tooltipTopPos, settooltipTopPos] = useState(0);
  const [tooltipLeftPos, settooltipLeftPos] = useState(0);
  const [tooltipVisible, settooltipVisible] = useState(false);
  const [tooltipText, settooltipText] = useState("");
  const [tooltipZindex, settooltipZindex] = useState(1);

  const [swapConfirmationModalVisible, setSwapConfirmationModal] =
    useState(false);

  return (
    <>
      <div
        style={{
          top: `${tooltipTopPos}px`,
          left: `${tooltipLeftPos}px`,
          opacity: `${tooltipVisible ? "1" : "0"}`,
          zIndex: `${tooltipZindex}`,
        }}
        className={`absolute bg-gray-700 text-white p-2 rounded transition-all duration-100`}
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

      <div className="flex items-center my-4 select-none">
        {badRowsPresent() && (
          <div className="flex item-center max-w-max">
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
        )}

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

      {!badRowsPresent() && (
        <div>
          <button
            className="border border-blue-500 w-full p-2 my-2 
                      rounded hover:bg-blue-500 hover:text-white 
                      disabled:cursor-not-allowed
                      disabled:bg-gray-300
                      disabled:border-gray-300
                      disabled:text-gray-100"
            onClick={handleDBUpdate}
            disabled={mainSaveButtonDisabled}
          >
            Update on Alternatives Database
          </button>
        </div>
      )}

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
                          settooltipZindex(1);
                        }}
                        onMouseLeave={() => {
                          settooltipVisible(false);
                          settooltipZindex(-1);
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
                          {key === "Processed" ? (
                            item[key] === 1 ? (
                              <span className="text-green-500">✅</span> // Render tick for true
                            ) : item[key] === 0 ? (
                              <span className="text-red-500">❌</span> // Render cross for false
                            ) : item[key] === -1 ? (
                              <div className="spinner"></div>
                            ) : (
                              item[key] // Render the value for other cases
                            )
                          ) : typeof item[key] === "boolean" ? (
                            item[key].toString()
                          ) : (
                            item[key]
                          )}
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
          {newPartColumn && existingClusterColumn && swapCaptionVisible && (
            <caption className="my-2">
              <div className="flex max-w-max items-center">
                <div>
                  Parts from{" "}
                  <span className="text-blue-500">{newPartColumn}</span> column
                  will be added to{" "}
                  <span className="text-green-500">
                    {existingClusterColumn}
                  </span>{" "}
                  clusters
                </div>
                <div>
                  <button
                    className="mx-2 border border-blue-500 px-2 
                                      rounded p-1 flex items-center 
                                      hover:text-white hover:bg-blue-500 
                                      outline-none"
                    onClick={handleColumnsTagSwap}
                  >
                    Swap <RiRefreshLine />
                  </button>
                </div>
              </div>
            </caption>
          )}
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
            <div className="max-w-3/4 flex-wrap items-center gap-2">
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
            </div>

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
        {swapConfirmationModalVisible && (
          <SwapConfirmationModal
            currClusterSum={dataFrameTable.reduce((sum, row) => {
              // Ensure the column exists and is a number
              const value = row[existingClusterColumn + "_NAlts"];
              return sum + (typeof value === "number" ? value : 0);
            }, 0)}
            fromColumnSum={dataFrameTable.reduce((sum, row) => {
              // Ensure the column exists and is a number
              const value = row[newPartColumn + "_NAlts"];
              return sum + (typeof value === "number" ? value : 0);
            }, 0)}
            handleSwapConfirm={handleSwapConfirm}
            handleSwapCancel={handleSwapCancel}
            existingClusterColumn={existingClusterColumn}
            newPartColumn={newPartColumn}
          />
        )}
      </div>
    </>
  );
};

export default PaginatedTable;
