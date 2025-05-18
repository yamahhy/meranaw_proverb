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

# from flask import Flask, request, jsonify, render_template
# from flask_cors import CORS
# import gradio as gr
# import os
# import json
# import re
# from sentence_transformers import SentenceTransformer
# from sklearn.metrics.pairwise import cosine_similarity
# import numpy as np

# app = Flask(__name__)
# CORS(app)  # Allow cross-origin requests from your web frontend

# # Initialize the sentence transformer model for semantic search
# # You may need to install this with: pip install sentence-transformers
# model = SentenceTransformer('all-MiniLM-L6-v2')

# # Placeholder for proverb data - in production, this would be loaded from a file or database
# # In this example, we'll load from a JSON file that you would create from your Firebase data
# proverb_data = []
# proverb_embeddings = []

# def load_proverb_data():
#     """Load proverb data from a JSON file (you'll need to create this from Firebase)"""
#     global proverb_data, proverb_embeddings
    
#     # Check if data file exists, if not create a placeholder
#     if not os.path.exists('proverb_data.json'):
#         print("Warning: proverb_data.json not found. Creating placeholder data.")
#         sample_data = [
#             {
#                 "id": "sample1",
#                 "text": "Sample Meranaw proverb text",
#                 "literalMeaning": "Sample literal meaning",
#                 "translation": "Sample translation",
#                 "theme": "leadership"
#             }
#         ]
#         with open('proverb_data.json', 'w') as f:
#             json.dump(sample_data, f)
    
#     # Load the proverb data
#     try:
#         with open('proverb_data.json', 'r', encoding='utf-8') as f:
#             proverb_data = json.load(f)
            
#         # Generate embeddings for all proverbs
#         texts_to_encode = [
#             p['text'] + " " + p['literalMeaning'] + " " + p['translation']
#             for p in proverb_data
#         ]
#         proverb_embeddings = model.encode(texts_to_encode)
#         print(f"Loaded {len(proverb_data)} proverbs and created embeddings.")
#     except Exception as e:
#         print(f"Error loading proverb data: {e}")
#         proverb_data = []
#         proverb_embeddings = []

# # Set up Gradio interface for semantic search
# def semantic_search(query, top_k=5):
#     """Semantic search function for Gradio interface"""
#     if not proverb_data or not proverb_embeddings.any():
#         return "No proverb data loaded."
    
#     # Encode the query
#     query_embedding = model.encode([query])
    
#     # Calculate similarity
#     similarities = cosine_similarity(query_embedding, proverb_embeddings)[0]
    
#     # Get top k results
#     top_indices = np.argsort(similarities)[-top_k:][::-1]
    
#     results = []
#     for idx in top_indices:
#         proverb = proverb_data[idx]
#         results.append({
#             "id": proverb["id"],
#             "text": proverb["text"],
#             "literalMeaning": proverb["literalMeaning"],
#             "translation": proverb["translation"],
#             "theme": proverb["theme"],
#             "similarity": float(similarities[idx])
#         })
    
#     return results

# # Set up Gradio interface for keyword search
# def keyword_search(query, top_k=5):
#     """Keyword search function for Gradio interface"""
#     if not proverb_data:
#         return "No proverb data loaded."
    
#     query = query.lower()
#     results = []
    
#     for proverb in proverb_data:
#         # Check if query is in any of the text fields
#         text = proverb["text"].lower()
#         literal = proverb["literalMeaning"].lower()
#         translation = proverb["translation"].lower()
        
#         if query in text or query in literal or query in translation:
#             results.append({
#                 "id": proverb["id"],
#                 "text": proverb["text"],
#                 "literalMeaning": proverb["literalMeaning"],
#                 "translation": proverb["translation"],
#                 "theme": proverb["theme"]
#             })
            
#     return results[:top_k]

# # Set up Gradio interface for theme-based search
# def theme_search(theme):
#     """Theme search function for Gradio interface"""
#     if not proverb_data:
#         return "No proverb data loaded."
    
#     theme = theme.lower()
#     results = []
    
#     for proverb in proverb_data:
#         if proverb["theme"].lower() == theme:
#             results.append({
#                 "id": proverb["id"],
#                 "text": proverb["text"],
#                 "literalMeaning": proverb["literalMeaning"],
#                 "translation": proverb["translation"],
#                 "theme": proverb["theme"]
#             })
            
#     return results

# # Interpretation function
# def interpret_proverb(proverb_text, translation):
#     """Interpretation function for Meranaw proverbs - to be enhanced with your trained model"""
#     # This is where you would use your trained model for interpretation
#     # For now, we'll provide a simple template-based interpretation
    
#     # Simplified interpretation (in production, replace with your ML model)
#     keywords = extract_keywords(translation)
#     context = analyze_cultural_context(proverb_text)
    
#     interpretation = f"""
#     This Meranaw proverb emphasizes {', '.join(keywords)}. 
#     It reflects the Meranaw cultural value of {context}.
#     In Meranaw society, this proverb is often used to guide people in situations involving {keywords[0] if keywords else 'wisdom'}.
#     """
    
#     return interpretation.strip()

# def extract_keywords(text):
#     """Extract important keywords from text - placeholder function"""
#     # This would be replaced with proper NLP techniques
#     important_words = ['wisdom', 'respect', 'courage', 'honor', 'patience', 'leadership']
#     words = re.findall(r'\b\w+\b', text.lower())
#     return [word for word in words if len(word) > 3 and word not in ['this', 'that', 'with', 'from']] or important_words[:2]

# def analyze_cultural_context(text):
#     """Analyze cultural context - placeholder function"""
#     # This would be replaced with a more sophisticated analysis
#     contexts = ['community harmony', 'respect for elders', 'leadership wisdom', 'conflict resolution', 'social responsibility']
#     # Very simple "analysis" for now
#     import hashlib
#     hash_val = int(hashlib.md5(text.encode()).hexdigest(), 16)
#     return contexts[hash_val % len(contexts)]

# # Create Gradio interfaces
# def create_gradio_interfaces():
#     # Semantic Search Interface
#     semantic_interface = gr.Interface(
#         fn=semantic_search,
#         inputs=[
#             gr.Textbox(lines=2, placeholder="Enter your search query..."),
#             gr.Slider(minimum=1, maximum=10, value=5, step=1, label="Number of results")
#         ],
#         outputs=gr.JSON(),
#         title="Meranaw Proverbs Semantic Search",
#         description="Search for Meranaw proverbs by meaning rather than exact keywords."
#     )
    
#     # Keyword Search Interface
#     keyword_interface = gr.Interface(
#         fn=keyword_search,
#         inputs=[
#             gr.Textbox(lines=2, placeholder="Enter keywords to search..."),
#             gr.Slider(minimum=1, maximum=10, value=5, step=1, label="Number of results")
#         ],
#         outputs=gr.JSON(),
#         title="Meranaw Proverbs Keyword Search",
#         description="Search for Meranaw proverbs by exact keywords."
#     )
    
#     # Theme Search Interface
#     theme_interface = gr.Interface(
#         fn=theme_search,
#         inputs=gr.Dropdown(
#             choices=["leadership", "conflict_resolution", "argumentation", 
#                     "death_sermon", "enthronement_genealogy", "courtship_marriage", 
#                     "moral_teaching"],
#             label="Select Theme"
#         ),
#         outputs=gr.JSON(),
#         title="Meranaw Proverbs Theme Search",
#         description="Browse Meranaw proverbs by theme."
#     )
    
#     # Interpretation Interface
#     interpretation_interface = gr.Interface(
#         fn=interpret_proverb,
#         inputs=[
#             gr.Textbox(lines=2, placeholder="Enter the Meranaw proverb..."),
#             gr.Textbox(lines=2, placeholder="Enter its English translation...")
#         ],
#         outputs=gr.Textbox(lines=6),
#         title="Meranaw Proverb Interpretation",
#         description="Get a cultural interpretation of a Meranaw proverb."
#     )
    
#     # Combine interfaces
#     combined_interface = gr.TabbedInterface(
#         [semantic_interface, keyword_interface, theme_interface, interpretation_interface],
#         ["Semantic Search", "Keyword Search", "Theme Search", "Interpretation"]
#     )
    
#     return combined_interface

# # Flask routes

# @app.route("/")
# def index():
#     return "Meranaw Proverbs API is running. Access Gradio interface at /gradio"

# @app.route("/api/search", methods=["POST"])
# def search():
#     data = request.json
#     query = data.get("query", "")
#     search_type = data.get("type", "semantic")  # semantic, keyword, or theme
    
#     if search_type == "semantic":
#         results = semantic_search(query)
#     elif search_type == "keyword":
#         results = keyword_search(query)
#     elif search_type == "theme":
#         results = theme_search(query)
#     else:
#         return jsonify({"error": "Invalid search type"}), 400
    
#     return jsonify({"results": results})

# @app.route("/api/interpret", methods=["POST"])
# def interpret():
#     data = request.json
#     proverb = data.get("proverb", "")
#     translation = data.get("translation", "")
    
#     interpretation = interpret_proverb(proverb, translation)
    
#     return jsonify({"interpretation": interpretation})

# @app.route("/api/export-firebase-data", methods=["POST"])
# def export_firebase_data():
#     """Endpoint to export Firebase data to local JSON for the semantic search model"""
#     data = request.json
#     proverbs = data.get("proverbs", [])
    
#     try:
#         with open('proverb_data.json', 'w', encoding='utf-8') as f:
#             json.dump(proverbs, f, ensure_ascii=False, indent=2)
        
#         # Reload the data and embeddings
#         load_proverb_data()
        
#         return jsonify({"status": "success", "message": f"Exported {len(proverbs)} proverbs"})
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500

# # Initialize the app
# @app.before_request
# def before_request_callback():
#     initialize_app()

# # Launch Gradio interface when running directly
# if __name__ == "__main__":
#     # Create and launch Gradio interface
#     interface = create_gradio_interfaces()
    
#     # Launch both Gradio and Flask
#     # Note: This approach runs the Gradio interface on a different port
#     gr.mount_gradio_app(app, interface, path="/gradio")
    
#     # Start the Flask app
#     app.run(debug=True, port=5000)