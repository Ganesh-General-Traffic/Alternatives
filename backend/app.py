from flask import Flask, send_from_directory, render_template,jsonify, request
import os, io
import pandas as pd

from flask_cors import CORS

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
def upload_file():
    # Check if a file is part of the request
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No file selected"}), 400

    try:
        # Read the file into a Pandas DataFrame
        df = pd.read_csv(io.StringIO(file.stream.read().decode('utf-8')))
        
        # Example: Return the first few rows as JSON
        return jsonify({
            "status": "success",
            "message": "File processed successfully",
            "data": df.head().to_dict(orient="records")  # Convert DataFrame to JSON records
        })
    except Exception as e:
        return jsonify({"status": "error", "message": f"Error processing file: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=3000)
