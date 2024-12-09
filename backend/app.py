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
            df.dropna(inplace=True)
            df = df[df.columns[:2]]
            yield json.dumps({"message": "Dropped Empty Rows and Columns.", "status": 1})
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
            df[present_in_products_col] = df[col].apply(lambda x : checkIfInProductTable(x))
            df[nAlts_col] = df[col].apply(lambda x : getNAlternatives(x))

        # nAlts_cols = [x for x in df.columns if "_NAlts" in x]
        # df.to_csv('testing.csv',index=False)
        
        yield json.dumps({"data" :df.to_dict(orient='records')})
        # return jsonify()
        
        # time.sleep(0.5)  # Simulate delay        

    return Response(process_file(), mimetype="text/event-stream")


if __name__ == "__main__":
    app.run(debug=True, port=3000, threaded=True)
