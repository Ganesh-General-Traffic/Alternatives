from flask import Flask, send_from_directory, render_template,jsonify, request,Response, stream_with_context

import os, io, time
import pandas as pd

import json

from flask_cors import CORS

from db import checkIfInProductTable, getNAlternatives

app = Flask(__name__, static_folder="../frontend/alternatives-bulk/dist/assets", template_folder="../frontend/alternatives-bulk/dist")
CORS(app)  # Enable CORS


# Serve React build files
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(f"build/{path}"):
        return send_from_directory("build", path)
    else:
        return render_template("index.html")
    
@app.route("/uploadFile", methods=["POST"])


@app.route("/uploadFile", methods=["POST"])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No file selected"}), 400

    @stream_with_context
    def process_file():
        # Step 1: Reading file
        print("\nStep 1")
        # yield json.dumps({"message": "Reading file...", "status": 1})
        
        try:
            df = pd.read_csv(io.StringIO(file.stream.read().decode("utf-8")))
            yield json.dumps({"message": "File read successfully.", "status": 1}) 
        except Exception as e:
            yield json.dumps({"message": f"Error reading file: {str(e)}", "status": -1}) 
            return
        
        time.sleep(0.5)  # Simulate delay

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
    
        time.sleep(0.5)  # Simulate delay

        # Step 3: Processing completed
        print("\nStep 3")
        yield json.dumps({"message": "Getting N Alts for each part.", "status": 1})

        for col in df:
            present_in_products_col = col + "_PresentInProducts"
            nAlts_col = col + "_NAlts"
            df[present_in_products_col] = df[col].apply(lambda x : checkIfInProductTable(x) if x else False)
            df[nAlts_col] = df[col].apply(lambda x : getNAlternatives(x) if x else "")
        
        time.sleep(0.75)  # Simulate delay

        print("\nStep 4")
        yield json.dumps({"message": "Tagging Bad Rows", "status": 0})
        badRows = df.apply(lambda row: any(x == "" or x is False for x in row), axis=1)
        df["isBadRow"] = badRows

        time.sleep(0.5)  # Simulate delay
        
        
        yield json.dumps({"data" : df.to_dict(orient='records'), "status":1, "message":"Sending Data.."})
        # return jsonify()
        
        # time.sleep(0.5)  # Simulate delay        

    return Response(process_file(), mimetype="text/event-stream")


if __name__ == "__main__":
    app.run(debug=True, port=3000, threaded=True)
