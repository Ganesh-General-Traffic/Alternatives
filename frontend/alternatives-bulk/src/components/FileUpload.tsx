import { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null); // State to store the file
  const [fileName, setFileName] = useState<string>(""); // State to store the file name

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]; // Safely access the first file
    if (selectedFile) {
      setFile(selectedFile); // Store the file object
      setFileName(selectedFile.name); // Update the filename in the state for display
    } else {
      setFile(null);
      setFileName("");
    }
  };

  const handleUploadFile = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file); // Append the file object to the form data

      const response = await fetch("/api/uploadFile", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data); // Log the response from the server
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <p className="text-5xl font-bold mb-6">Alternatives Bulk Update</p>

      {/* File Input */}
      <div className="mb-4">
        <div className="flex justify-center gap-2">
          <label
            htmlFor="fileInput"
            className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded shadow-md hover:bg-blue-600 transition"
          >
            Choose File
            <input
              id="fileInput"
              type="file"
              accept=".csv"
              onChange={handleChange}
              className="hidden"
            />
          </label>
          {file && (
            <button
              className="border p-2 rounded border-red-600 hover:text-white hover:bg-red-600"
              onClick={() => {
                setFile(null);
                setFileName("");
              }}
            >
              Remove File
            </button>
          )}
        </div>
        {file && (
          <p className="mt-3 text-gray-700 text-lg">
            Selected File: <span className="font-semibold">{fileName}</span>
          </p>
        )}
      </div>

      {/* Upload Button */}
      {file && (
        <button
          className={`border border-blue-500 p-3 rounded hover:text-white hover:bg-blue-500 flex items-center justify-between`}
          onClick={handleUploadFile}
        >
          <span>
            <FaCloudUploadAlt />
          </span>
          <span className="mx-2">Upload File</span>
        </button>
      )}
    </div>
  );
};

export default FileUpload;
