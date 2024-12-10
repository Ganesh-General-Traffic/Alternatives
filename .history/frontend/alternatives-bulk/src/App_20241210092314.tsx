import React, { useState } from "react";

import "./App.css";
import FileUpload from "./components/FileUpload";
import ToastWrapper from "./components/ToastWrapper";
import PaginatedTable from "./components/PaginatedTable";

const App: React.FC = () => {
  const [viewState, setViewState] = useState<{ [key: string]: boolean }>({
    spinner: false,
    fileUpload: true,
  });

  const [dataFrameTable, setDataFrameTable] = useState<
    Array<{ [key: string]: any }>
  >([]);

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
      {dataFrameTable.length > 0 && (
        <PaginatedTable dataFrameTable={dataFrameTable} />
      )}
    </>
  );
};

export default App;
