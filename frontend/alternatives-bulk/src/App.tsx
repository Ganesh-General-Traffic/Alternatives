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
      <table>
        <tbody>
          {dataFrameTable.map((item, index) => {
            return (
              <tr key={index}>
                <td>{item["GT Part Number"]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default App;
