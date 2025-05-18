from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from your web frontend

@app.route("/api/interpret", methods=["POST"])
def interpret():
    data = request.json
    proverb = data.get("proverb", "")
    translation = data.get("translation", "")

    # For now, just simulate interpretation
    interpretation = f"This proverb emphasizes {translation.lower()}. It reflects Meranaw cultural wisdom."

    return jsonify({"interpretation": interpretation})

if __name__ == "__main__":
    app.run(debug=True)
