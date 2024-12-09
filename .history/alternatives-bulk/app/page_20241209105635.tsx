export default function Home() {
  return (
    <>
      <p className="w-full text-center">Alternatives Bulk Update</p>
      <label htmlFor="csvFile">Upload a CSV File</label>
      <input type="file" name="csvFile" id="csvFile" />
    </>
  );
}
