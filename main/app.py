from flask import Flask, request, jsonify, send_file
from firestore_utils import fetch_proverbs_from_firestore
from search_utils import unified_search, get_suggestions
from flask_cors import CORS

app = Flask(__name__)
search_history = []
CORS(app)

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/sync', methods=['POST'])
def sync_firestore():
    proverbs = fetch_proverbs_from_firestore()
    return jsonify({"status": "synced", "count": len(proverbs)})

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('query', '')
    theme = request.args.get('theme', None)

    if query not in search_history:
        search_history.append(query)

    results = unified_search(query, theme)
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)

@app.route('/suggest', methods=['GET'])
def suggest():
    q = request.args.get('q', '')
    if not q:
        return jsonify([])

    suggestions = get_suggestions(q)
    return jsonify(suggestions)