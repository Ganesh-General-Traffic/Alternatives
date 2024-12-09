export default function Home() {
  const [fileName, setFileName] = useState("");

  return (
    <>
      <p className="w-full text-center">Alternatives Bulk Update</p>
      <div className="max-w-max mx-auto">File Name : </div>
      <div className="mx-auto max-w-max">
        <label htmlFor="csvFile">
          Upload a CSV File
          <input
            type="file"
            name="csvFile"
            id="csvFile"
            accept=".csv"
            className="border border-gray-300 rounded p-2"
          />
        </label>
      </div>
    </>
  );
}
