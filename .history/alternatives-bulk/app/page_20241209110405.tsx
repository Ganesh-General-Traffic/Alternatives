"use client";

import { useState } from "react";

export default function Home() {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name); // Update the fileName state with the uploaded file's name
    } else {
      setFileName(""); // Reset the fileName if no file is selected
    }
  };

  return (
    <>
      <p className="w-full text-center">Alternatives Bulk Update</p>
      {fileName !== "" && (
        <div className="max-w-max mx-auto">
          File Name: <strong>{fileName}</strong>{" "}
          <span>
            <MdEdit />
          </span>
        </div>
      )}
      {fileName === "" && (
        <div className="mx-auto max-w-max">
          <label htmlFor="csvFile" className="block text-center">
            Upload a CSV File
            <input
              type="file"
              name="csvFile"
              id="csvFile"
              accept=".csv"
              className="border border-gray-300 rounded p-2 mt-2"
              onChange={handleFileChange} // Attach the event handler here
            />
          </label>
        </div>
      )}
    </>
  );
}
