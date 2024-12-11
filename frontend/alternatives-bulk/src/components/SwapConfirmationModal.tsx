import React from "react";

interface SwapConfirmationModalProps {
  currClusterSum: number;
  fromColumnSum: number;
  existingClusterColumn: string;
  newPartColumn: string;
  handleSwapConfirm: () => void;
  handleSwapCancel: () => void;
}

const SwapConfirmationModal: React.FC<SwapConfirmationModalProps> = ({
  currClusterSum,
  fromColumnSum,
  existingClusterColumn,
  newPartColumn,
  handleSwapConfirm,
  handleSwapCancel,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h2 id="modal-title" className="text-xl font-bold mb-4">
          Confirm Swap
        </h2>
        <p>
          <strong>{newPartColumn} </strong>has {fromColumnSum} Alternatives
          total
        </p>
        <p>
          <strong>{existingClusterColumn} </strong>has {currClusterSum}{" "}
          Alternatives total
        </p>
        <p className="text-gray-700 mb-6">
          Are you sure you want to proceed with the swap?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition"
            onClick={handleSwapCancel}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            onClick={handleSwapConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapConfirmationModal;
