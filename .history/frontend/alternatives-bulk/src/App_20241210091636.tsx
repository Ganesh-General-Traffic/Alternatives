import React, { useState } from "react";

import "./App.css";
import FileUpload from "./components/FileUpload";
import ToastWrapper from "./components/ToastWrapper";

const App: React.FC = () => {
  const [viewState, setViewState] = useState<{ [key: string]: boolean }>({
    spinner: false,
    fileUpload: true,
  });

  const [dataFrameTable, setDataFrameTable] = useState([]);

  return (
    <>
      <ToastWrapper />
      {viewState.spinner && <div className="spinner"></div>}
      {viewState.fileUpload && (
        <FileUpload
          setViewState={setViewState}
          setDataFrameTable={setDataFrameTable}
        />
      )}
      <table className="border">
        <thead>
          <tr>
            {Object.keys(dataFrameTable[0]).map((key, index) => (
              <th key={index}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataFrameTable.map((item, index) => (
            <tr key={index}>
              {Object.keys(item).map((key, keyIndex) => (
                <td key={keyIndex}>{item[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default App;
