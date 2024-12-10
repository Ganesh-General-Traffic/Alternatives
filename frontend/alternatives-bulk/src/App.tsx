import React, { useState } from "react";

import "./App.css";
import FileUpload from "./components/FileUpload";
import ToastWrapper from "./components/ToastWrapper";
import PaginatedTable from "./components/PaginatedTable";

export interface ViewState {
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

  const [existingClusterColumn, setExistingClusterColumn] =
    useState<string>("");
  const [newPartColumn, setNewPartColumn] = useState<string>("");

  return (
    <>
      <ToastWrapper />
      {viewState.spinner && <div className="spinner"></div>}
      {viewState.fileUpload && (
        <FileUpload
          setViewState={setViewState}
          setDataFrameTable={setDataFrameTable}
          setExistingClusterColumn={setExistingClusterColumn}
          setNewPartColumn={setNewPartColumn}
        />
      )}
      {viewState.table && (
        <PaginatedTable
          dataFrameTable={dataFrameTable}
          existingClusterColumn={existingClusterColumn}
          newPartColumn={newPartColumn}
        />
      )}
    </>
  );
};

export default App;
