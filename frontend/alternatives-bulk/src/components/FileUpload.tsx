import { Dispatch, SetStateAction, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { toast } from "sonner";
import { ViewState } from "../App";

interface FileUploadProps {
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
  setExistingClusterColumn: React.Dispatch<React.SetStateAction<string>>;
  setNewPartColumn: React.Dispatch<React.SetStateAction<string>>;
  setDataFrameTable: Dispatch<SetStateAction<{ [key: string]: any }[]>>;
}

const FileUpload: React.FC<FileUploadProps> = ({
  setViewState,
  setDataFrameTable,
  setExistingClusterColumn,
  setNewPartColumn,
}) => {
  const [file, setFile] = useState<File | null>(null); // State to store the file
  const [fileName, setFileName] = useState<string>(""); // State to store the file name

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    e.target.value = ""; // Reset input value to allow re-selection of the same file
    if (selectedFile) {
      if (selectedFile.type === "text/csv") {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        return;
      } else {
        setFile(null);
        setFileName("");
        toast.error("Please upload a valid CSV file.");
        return;
      }
    } else {
      setFile(null);
      setFileName("");
      return;
    }
  };

  const handleUploadFile = async () => {
    if (!file) {
      toast.error("No file selected");
      return;
    }

    setViewState((prev) =>
      Object.keys(prev).reduce((acc, key) => {
        acc[key as keyof ViewState] = key === "spinner";
        return acc;
      }, {} as ViewState)
    );

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/uploadFile", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(
          errorResponse.message || `HTTP error! status: ${response.status}`
        );
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Unable to read server response.");
      }

      const decoder = new TextDecoder("utf-8");

      let accumulatedDataFrame: any[] = []; // Create a list to store accumulated data

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const rawMessage = decoder.decode(value, { stream: true }).trim();
        if (rawMessage) {
          try {
            const messageObj = JSON.parse(rawMessage);

            if (messageObj.status === 1) {
              toast.success(messageObj.message);
            } else if (messageObj.status === -1) {
              toast.error(messageObj.message);
              throw "";
            } else {
              toast.info(messageObj.message);
            }

            if (messageObj.existingClusterColumn && messageObj.newPartColumn) {
              setNewPartColumn(messageObj.newPartColumn);
              setExistingClusterColumn(messageObj.existingClusterColumn);
            }

            if (messageObj.data) {
              accumulatedDataFrame = accumulatedDataFrame.concat(
                messageObj.data
              ); // Append new data
            }
          } catch (error) {
            console.error("Error parsing message:", error);
            toast.error("Invalid server message format");
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        }
      }

      // After streaming ends, update the DataFrameTable state
      if (accumulatedDataFrame.length > 0) {
        const updatedDataFrame = accumulatedDataFrame.map(
          (row: any, index: number) => ({
            ...row,
            Processed: 0, // Add 'Processed' column with all rows set to 0
            id: index, // Set 'id' to the row's index
          })
        );

        setDataFrameTable(updatedDataFrame);

        toast.success("DataFrame formed");

        setViewState((prev) =>
          Object.keys(prev).reduce((acc, key) => {
            acc[key as keyof ViewState] = key === "table";
            return acc;
          }, {} as ViewState)
        );
      }
    } catch (error: any) {
      toast.error(`Error uploading file: ${error.message || "Unknown error"}`);
      console.error("Error uploading file:", error);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } finally {
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <p className="text-4xl font-bold mb-6">Alternatives Bulk Update</p>

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
          className={`border border-blue-500 p-3 rounded hover:text-white hover:bg-blue-500 flex items-center justify-between transition-all duration-200`}
          onClick={handleUploadFile}
        >
          <span>
            <FaCloudUploadAlt />
          </span>
          <span className="mx-2">Upload File</span>
        </button>
      )}
      <p className="italic">
        <strong>Note</strong>: The CSV File always needs to have column names as
        first row,
        <br />
        <span>and should contain a miminum of two columns</span>
      </p>
    </div>
  );
};

export default FileUpload;
