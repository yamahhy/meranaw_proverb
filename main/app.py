from flask import Flask, request, jsonify, render_template  # Flask
from flask_cors import CORS  # Handling CORS (if needed)
import pandas as pd  # Data manipulation
import firebase_admin  # Firebase Admin SDK
from firebase_admin import credentials, firestore
from sentence_transformers import SentenceTransformer  # Semantic search
from sklearn.metrics.pairwise import cosine_similarity  # Semantic search
import string  # String manipulation
from unidecode import unidecode  # Unicode normalization
from retrieval import normalize_meranaw_word, search_proverbs_combined
 # Import your search function
from flask import Flask, render_template

app = Flask(__name__, template_folder='.')

@app.route('/')
def home():
    return render_template('index.html')
app = Flask(__name__)
CORS(app)

cred = credentials.Certificate("meranaw-pananaroon-firebase-adminsdk-fbsvc-29f342bf95.json") # Replace with your path
firebase_admin.initialize_app(cred)
db = firestore.client()

def fetch_proverbs_from_firebase():
    """Fetches proverbs from Firebase and returns a Pandas DataFrame."""
    proverbs = []
    try:
        proverbs_collection = db.collection("meranaw_proverb").get()  # Adjust collection name if needed
        for doc in proverbs_collection:
            proverb_data = doc.to_dict()
            #  Ensure consistent field names (case-sensitive!)
            proverbs.append({
                "meranaw_proverb": proverb_data.get("meranaw_proverb", ""),
                "literal_translation_meranaw": proverb_data.get("literal_translation_meranaw", ""),
                "english_translation": proverb_data.get("english_translation", ""),
                "theme": proverb_data.get("theme", ""),
                "interpretation": proverb_data.get("interpretation", ""),  # Assuming this exists
                "augmented_interpretation": proverb_data.get("augmented_interpretation", "") # Assuming this exists
            })
        return pd.DataFrame(proverbs)
    except Exception as e:
        print(f"Error fetching data from Firebase: {e}")
        return pd.DataFrame()

@app.route('/api/combined_search', methods=['POST'])
def combined_search():
    """API endpoint for combined search."""

    data = request.get_json()
    query = data.get('query', '')

    if not query:
        return jsonify({"error": "No query provided"}), 400

    proverbs_df = fetch_proverbs_from_firebase()
    if proverbs_df.empty:
        return jsonify({"error": "No proverbs found in database"}), 500

    results_df = search_proverbs_combined(query, proverbs_df)
    results = results_df.to_dict(orient='records')  # Convert DataFrame to list of dicts

    return jsonify(results)

@app.route("/api/interpret", methods=["POST"])
def interpret():
    """API endpoint to simulate proverb interpretation."""
    data = request.json
    proverb = data.get("proverb", "")
    translation = data.get("translation", "")

    # Replace this with your actual interpretation logic
    interpretation = f"This proverb emphasizes {translation.lower()}. It reflects Meranaw cultural wisdom."

    return jsonify({"interpretation": interpretation})


if __name__ == "__main__":
    app.run(debug=True)