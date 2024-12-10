import React, { useState } from "react";

interface PaginatedTableProps {
  dataFrameTable: Array<{ [key: string]: any }>;
}

const PaginatedTable: React.FC<PaginatedTableProps> = ({ dataFrameTable }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Calculate total pages
  const totalPages = Math.ceil(dataFrameTable.length / rowsPerPage);

  // Get the current page's data
  const currentData = dataFrameTable.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="border rounded-lg p-3 shadow-lg">
      <table>
        <thead className="border-b">
          <tr>
            {dataFrameTable.length > 0 &&
              Object.keys(dataFrameTable[0]).map((key, index) => (
                <th className="p-2" key={index}>
                  {key}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {currentData.map((item, rowIndex) => (
            <tr key={rowIndex} className="border-b">
              {Object.keys(item).map((key, colIndex) => (
                <td className="py-2" key={colIndex}>
                  {item[key]}
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
          className="px-3 py-1 border rounded mx-1"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          First
        </button>

        {/* Previous Page Button */}
        <button
          className="px-3 py-1 border rounded mx-1"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {/* Page Number Buttons */}
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`px-3 py-1 border rounded mx-1 ${
              currentPage === index + 1 ? "bg-gray-300" : ""
            }`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}

        {/* Next Page Button */}
        <button
          className="px-3 py-1 border rounded mx-1"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>

        {/* Go to Last Page Button */}
        <button
          className="px-3 py-1 border rounded mx-1"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last
        </button>
      </div>
    </div>
  );
};

export default PaginatedTable;
