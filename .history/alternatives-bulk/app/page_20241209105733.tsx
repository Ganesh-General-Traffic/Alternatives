export default function Home() {
  return (
    <>
      <p className="w-full text-center">Alternatives Bulk Update</p>
      <label htmlFor="csvFile" className="mx-auto">
        Upload a CSV File
        <input
          type="file"
          name="csvFile"
          id="csvFile"
          accept=".csv"
          className="border border-gray-300 rounded p-2"
        />
      </label>
    </>
  );
}
