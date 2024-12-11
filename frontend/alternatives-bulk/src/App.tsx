import React, { useState } from "react";

import "./App.css";
import FileUpload from "./components/FileUpload";
import ToastWrapper from "./components/ToastWrapper";
import PaginatedTable from "./components/PaginatedTable";

export interface ViewState {
  spinner: boolean;
  fileUpload: boolean;
  table: boolean;
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
      {viewState.spinner && (
        <div className="h-[80vh] flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      )}
      {viewState.fileUpload && (
        <div className="flex h-[80vh] items-center justify-center">
          <FileUpload
            setViewState={setViewState}
            setDataFrameTable={setDataFrameTable}
            setExistingClusterColumn={setExistingClusterColumn}
            setNewPartColumn={setNewPartColumn}
          />
        </div>
      )}
      {viewState.table && (
        <div className="max-w-7xl min-w-7xl mx-auto">
          <PaginatedTable
            dataFrameTable={dataFrameTable}
            existingClusterColumn={existingClusterColumn}
            newPartColumn={newPartColumn}
            setDataFrameTable={setDataFrameTable}
            setExistingClusterColumn={setExistingClusterColumn}
            setNewPartColumn={setNewPartColumn}
          />
        </div>
      )}
    </>
  );
};

export default App;
