from flask import Flask, send_from_directory, render_template,jsonify, request,Response, stream_with_context
import os, io, time
import pandas as pd
import json
from flask_cors import CORS

from utils import pushToDBPandasApply, removePartFromAlternatives
from db import checkIfInProductTable, getNAlternatives

app = Flask(__name__, static_folder="../frontend/alternatives-bulk/dist/assets", template_folder="../frontend/alternatives-bulk/dist")
CORS(app)  # Enable CORS

PROD = True

# Serve React build files
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(f"build/{path}"):
        return send_from_directory("build", path)
    else:
        return render_template("index.html")


@app.route("/uploadFile", methods=["POST"])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No file selected"}), 400

    @stream_with_context
    def process_file():
        time.sleep(0.25)  # Simulate delay
        # Step 1: Reading file
        print("\nStep 1")
        # yield json.dumps({"message": "Reading file...", "status": 1})
        
        try:
            df = pd.read_csv(io.StringIO(file.stream.read().decode("utf-8")))
            yield json.dumps({"message": "File read successfully.", "status": 1}) 
        except Exception as e:
            yield json.dumps({"message": f"Error reading file: {str(e)}", "status": -1}) 

        if len(df.columns) < 2:
            yield json.dumps({"message": f"PDF has less than 2 columns", "status": -1}) 

        
        time.sleep(0.25)  # Simulate delay

        # Step 2: Replacing NaN values
        print("\nStep 2")
        # yield json.dumps({"message": "Replacing NaN values...", "status": 1}) 
        try:
            df.fillna("",inplace=True)
            df = df[~((df.iloc[:, 0] == "") & (df.iloc[:, 1] == ""))]
            df = df[df.columns[:2]]
            df.drop_duplicates(subset=df.columns[:2], keep='first', inplace=True)

            yield json.dumps({"message": "Dropped Unnecessary Columns and duplicate rows.", "status": 1})
        except Exception as e:
            yield json.dumps({"message": f"Error replacing NaN values: {str(e)}", "status": -1})
            return

        time.sleep(0.25)  # Simulate delay

        # Step 3: Processing completed
        print("\nStep 3")
        yield json.dumps({"message": "Getting N Alts for each part.", "status": 1})

        for col in df:
            time.sleep(0.25)
            yield json.dumps({"message": f"Checking : {col} if all rows are present in products", "status": 0})
            present_in_products_col = col + "_PresentInProducts"
            nAlts_col = col + "_NAlts"
            df[present_in_products_col] = df[col].apply(lambda x : checkIfInProductTable(x) if x else False)
            df[nAlts_col] = df[col].apply(lambda x : getNAlternatives(x) if x else "")
            yield json.dumps({"message": f"Column : {col} Done!", "status": 1})
            time.sleep(0.5)

        print("\nStep 4")
        yield json.dumps({"message": "Tagging Bad Rows", "status": 0})
        badRows = df.apply(lambda row: any(x == "" or x is False for x in row), axis=1)
        badRows |= df.iloc[:, 0] == df.iloc[:, 1]
        df["isBadRow"] = badRows

        time.sleep(0.5)  # Simulate delay

        nAlts_columns = [col for col in df.columns if col.endswith("_NAlts")]
        # Ensure columns are converted to integers with "" replaced by 0
        for col in nAlts_columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)
        
        sums = {col: df[col].sum() for col in nAlts_columns}
        # Find the column with the larger sum and the smaller sum
        existingClusterColumn = max(sums, key=sums.get).replace("_NAlts", "")
        newPartColumn = min(sums, key=sums.get).replace("_NAlts", "")

        if(existingClusterColumn == newPartColumn):
            existingClusterColumn = df.columns[0]
            newPartColumn = df.columns[1]

        yield json.dumps({"status":0, 
                          "message":"Finding Existing Cluster...",
                          "existingClusterColumn":existingClusterColumn,
                          "newPartColumn":newPartColumn})
        
        # yield json.dumps({"status":0, 
        #                   "message":"Finding Existing Cluster...",
        #                   "existingClusterColumn":"",
        #                   "newPartColumn":""})

        time.sleep(0.5)

        # Step 4: Chunked Data Yielding
        chunk_size = 25
        total_chunks = (len(df) + chunk_size - 1) // chunk_size  # Calculate total number of chunks

        for chunk_index, start_row in enumerate(range(0, len(df), chunk_size), start=1):
            chunk = df.iloc[start_row:start_row + chunk_size]  # Slice the DataFrame into chunks
            yield json.dumps({
                "data": chunk.to_dict(orient='records'),
                "status": 0,
                "message": f"Receiving chunk {chunk_index} of {total_chunks}..."
            })
            time.sleep(0.25)  # Optional: simulate delay


    return Response(process_file(), mimetype="text/event-stream")


@app.route("/updateDB", methods=["POST"])
def updateDB():
    req_json = request.get_json()
    if not req_json or 'partList' not in req_json:
        return jsonify({"error": "Invalid request data"}), 400

    @stream_with_context
    def process_parts():
        for part_pair in req_json['partList']:
            try:
                # Process each part pair
                print(part_pair)
                removePartFromAlternatives(part_pair[1])
                pushToDBPandasApply(part_pair)
                yield json.dumps({"part": part_pair, "status": "success"}) + "\n"
            except Exception as e:
                yield json.dumps({"part": part_pair, "status": "error", "message": str(e)}) + "\n"
            finally:
                time.sleep(0.25)

    return Response(process_parts(), content_type="application/json; charset=utf-8")



if __name__ == "__main__":
    if not PROD:
        app.run(debug=True, port=3000, threaded=True)
    else:
        app.run(host='0.0.0.0', port=5001, threaded=True)

