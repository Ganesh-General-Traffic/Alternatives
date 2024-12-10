import React, { useState } from "react";

import "./App.css";
import FileUpload from "./components/FileUpload";
import ToastWrapper from "./components/ToastWrapper";
import PaginatedTable from "./components/PaginatedTable";

interface ViewState {
  spinner: boolean;
  fileUpload: boolean;
  table: boolean; // Add other keys as needed
}

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>({
    spinner: false,
    fileUpload: true,
    table: false,
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
      {viewState.table && <PaginatedTable dataFrameTable={dataFrameTable} />}
    </>
  );
};

export default App;
