import pandas as pd
import string
from unidecode import unidecode
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load pre-trained SentenceTransformer model once
model = SentenceTransformer('all-mpnet-base-v2')

# Meranaw orthography normalization function
def normalize_meranaw_word(text):
    if not isinstance(text, str):
        return text

    normalization_map = {
        "aden": ["adn", "adun"],
        "ngka": ["angka"],
        "den": ["dn", "dun"],
        "penayaon": ["pnayawn", "penayawn"],
        "ig": ["eg", "tubig"],
        "laod": ["lawd", "laod"],
        "san": ["saan", "san bo"],
        "pembataesen": ["pmbatasn", "pmbatasen"],
        "inged": ["ingd", "ingud", "ing'd"],
        "bangoni": ["bangoningka", "bangon"],
        "myasapad": ["miyasapad"],
        "geda": ["gda", "g'da"],
        "gagao": ["gagaw"],
        "kawarao": ["kawaraw"],
        "tao": ["taw"],
        "skanyan": ["sekaniyan", "skaniyan", "sukaniyan"],
        "bes": ["bs", "bus"],
        "kena": ["kna", "k'na", "kuna"],
        "perak": ["pirak"],
        "sempad": ["sumpad"],
        "saden": ["sadn", "sadun", "sad'n"],
        "bangnsa": ["bangsa"],
        "kapenggiginawai": ["friendship", "ginawae", "kapnggiginawae"],
        "ayaden": ["ayadun", "ayadn", "ayad'n"],
        "maregen": ["margn", "marugun", "marugen"],
        "map'ragon": ["maperagon", "mapragon", "mapuragon"],
        "pen": ["pun", "pn", "p'n"],
        "aya ngka": ["ayangka"],
        "palaw": ["palao"],
        "pheranti": ["pranti", "phuranti", "peranti", "puranti"],
        "betad": ["btad", "butad", "b'tad"],
        "peman": ["pman", "puman"],
        "tademan": ["tadman", "taduman", "tad'man"],
        "madakel": ["madakl", "madakul"],
        "benar": ["bunar", "bnar", "b'nar"],
        "aken": ["akun", "akn"],
        "seka": ["ska", "suka"],
        "gopen": ["gopun", "gopn"],
        "tanoren": ["tanorn", "tanorun"],
        "delem": ["dlm", "dulm", "dulum"],
        "Phagendod": ["phagndod", "phag'ndod"],
        "tindeg": ["tindug", "tindg"],
        "ber-bereg": ["br-brg", "bur-burug", "burug"],
        "pelangkap": ["langkap", "plangkap", "pulangkap"],
        "rek": ["rk", "ruk"],
        "nggalebek": ["galebel", "galubuk", "galbk"],
        "courtship": ["ligaw", "pagidaan", "panoksam", "kapamanganakan", "kandiyalaga"],
        "marriage": ["karoma", "karuma", "kawing", "kakhawing"],
        "leadership": ["kandato", "olowan", "datu", "dato"],
        "conflict resolution": ["kapamasad sa rido", "rido"],
        "enthronment": ["kabangensa", "kabangsa", "khabangsa"],
        "argumentation": ["kapangilat", "kazambi sa lalag", "kasambi sa lalag"],
        "moral teaching": ["kapamangtuma", "tuma", "toma", "ginawa", "sarili"],
        "self-reflection": ["kapangtuma sa ped sa taw"]
    }

    for normalized, variants in normalization_map.items():
        for variant in variants:
            text = text.replace(variant, normalized)

    return text.lower()

# Theme keyword mapping
theme_mapping = {
    "leadership": ["lead", "leader", "authority", "chief", "ruler", "governance", "kandato", "olowan", "datu", "dato"],
    "conflict_resolution": ["conflict", "dispute", "argue", "fight", "peace", "mediate", "settle", "rido", "kapamasad sa rido"],
    "argumentation": ["argue", "debate", "discuss", "reason", "persuade", "claim", "kapangilat", "kasambi sa lalag", "lalag"],
    "death_sermon": ["death", "mourn", "funeral", "legacy", "afterlife", "kapatay"],
    "enthronement_genealogy": ["throne", "family", "ancestor", "lineage", "succession", "royal", "kabangensa", "kabangsa", "bangsa", "khabangsa"],
    "courtship_marriage": ["love", "marry", "wedding", "relationship", "courtship", "romance", "kawing", "kakhawing", "dating", "ligaw", "pagidaan", "panoksam", "kapamanganakan", "kandiyalaga", "karoma", "karuma"],
    "moral_teaching": ["moral", "ethics", "value", "virtue", "conduct", "behavior", "right", "wrong", "tuma", "toma", "ginawa", "sarili", "self-reflection"]
}

def normalize_text(text):
    return unidecode(text).lower() if isinstance(text, str) else ''

def remove_punctuation(text):
    return text.translate(str.maketrans('', '', string.punctuation))

def map_query_to_theme(query, theme_mapping):
    query = query.lower()
    for theme, keywords in theme_mapping.items():
        if query in keywords or any(word in query for word in keywords):
            return theme
    return None

# Main search function
def search_proverbs_combined(query, df):
    results = []
    normalized_query = normalize_meranaw_word(query)

    # Semantic Search
    query_embedding = model.encode(query)
    proverb_embeddings = model.encode(
        df['interpretation'].fillna('').apply(normalize_text) + ' ' +
        df['english_translation'].fillna('').apply(normalize_text) + ' ' +
        df['meranaw_proverb'].fillna('').apply(normalize_meranaw_word)
    )
    semantic_similarities = cosine_similarity([query_embedding], proverb_embeddings)[0]
    semantic_results_indices = semantic_similarities.argsort()[-5:][::-1]

    for index in semantic_results_indices:
        results.append({
            'search_type': 'semantic',
            'meranaw': df.iloc[index]['meranaw_proverb'],  # Use consistent naming
            'interpretation': df.iloc[index]['interpretation'],
            'english': df.iloc[index]['english_translation'],  # Use consistent naming
            'theme': df.iloc[index]['theme'],  # Use consistent naming
            'search_score': float(semantic_similarities[index])
        })

    # Keyword Search
    keyword_results_df = df[
        df['meranaw_proverb'].fillna('').apply(normalize_meranaw_word).str.contains(normalized_query, case=False) |
        df['interpretation'].fillna('').apply(normalize_text).str.contains(normalize_text(query), case=False) |
        df['english_translation'].fillna('').apply(normalize_text).str.contains(normalize_text(query), case=False) |
        df['theme'].fillna('').apply(normalize_meranaw_word).str.contains(normalized_query, case=False)
    ]

    for index, row in keyword_results_df.iterrows():
        results.append({
            'search_type': 'keyword',
            'meranaw': row['meranaw_proverb'],  # Use consistent naming
            'interpretation': row.get('interpretation', ''),
            'english': row.get('english_translation', ''),  # Use consistent naming
            'literal_translation': row.get('literal_translation_meranaw', ''),
            'theme': row.get('theme', ''),  # Use consistent naming
            'search_score': None
        })

    # Theme Search
    mapped_theme = map_query_to_theme(query, theme_mapping)
    if mapped_theme:
        theme_results_df = df[df['theme'].fillna('').apply(normalize_meranaw_word) == normalize_meranaw_word(mapped_theme)]
        for index, row in theme_results_df.iterrows():
            results.append({
                'search_type': 'theme',
                'meranaw': row['meranaw_proverb'],  # Use consistent naming
                'interpretation': row.get('interpretation', ''),
                'english': row.get('english_translation', ''),  # Use consistent naming
                'theme': row.get('theme', ''),  # Use consistent naming
                'search_score': None
            })

    # Prepare final DataFrame (modify as needed)
    results_df = pd.DataFrame(results)
    return results_df[['meranaw', 'english', 'theme']]