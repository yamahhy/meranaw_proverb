import json
from sentence_transformers import SentenceTransformer, util
import torch

# Load model
model = SentenceTransformer('all-MiniLM-L6-v2')

theme_mapping = {
    "leadership": "leadership", "conflict": "conflict_resolution", "family": "family_and_community",
    "community": "family_and_community", "wisdom": "wisdom_and_morality", "morality": "wisdom_and_morality",
    "governance": "governance_and_justice", "justice": "governance_and_justice",
    "peace": "conflict_resolution", "relationships": "family_and_community",
    "values": "wisdom_and_morality", "work": "agriculture_and_livelihood",
    "law": "governance_and_justice", "ruler": "leadership", "leader": "leadership",
    "fight": "conflict_resolution", "kinship": "family_and_community",
    "farm": "agriculture_and_livelihood", "government": "governance_and_justice",
    "food": "agriculture_and_livelihood", "land": "agriculture_and_livelihood",
    "court": "governance_and_justice", "elder": "leadership", "respect": "wisdom_and_morality",
    "honor": "wisdom_and_morality", "custom": "wisdom_and_morality", "tradition": "wisdom_and_morality",
    "lesson": "wisdom_and_morality", "teaching": "wisdom_and_morality",
    "money": "agriculture_and_livelihood", "wealth": "agriculture_and_livelihood",
    "poor": "agriculture_and_livelihood", "rich": "agriculture_and_livelihood",
    "success": "leadership", "failure": "leadership", "problem": "conflict_resolution",
    "solution": "conflict_resolution", "unity": "family_and_community",
    "cooperation": "family_and_community", "loyalty": "family_and_community",
    "duty": "governance_and_justice", "responsibility": "governance_and_justice",
    "judgment": "governance_and_justice", "trial": "governance_and_justice",
    "chief": "leadership", "datu": "leadership", "sultan": "leadership",
    "house": "family_and_community", "home": "family_and_community", "children": "family_and_community",
    "parents": "family_and_community", "old": "wisdom_and_morality", "young": "wisdom_and_morality",
    "virtue": "wisdom_and_morality", "vice": "wisdom_and_morality", "right": "wisdom_and_morality",
    "wrong": "wisdom_and_morality", "moral": "wisdom_and_morality", "ethical": "wisdom_and_morality",
    "harvest": "agriculture_and_livelihood", "plant": "agriculture_and_livelihood",
    "grow": "agriculture_and_livelihood", "trade": "agriculture_and_livelihood",
    "economy": "agriculture_and_livelihood", "rule": "governance_and_justice",
    "order": "governance_and_justice", "rights": "governance_and_justice",
    "power": "leadership", "authority": "leadership", "guide": "leadership",
    "follow": "leadership", "character": "wisdom_and_morality", "destiny": "wisdom_and_morality",
    "fate": "wisdom_and_morality", "luck": "wisdom_and_morality", "fortune": "wisdom_and_morality",
    "hardship": "agriculture_and_livelihood", "struggle": "agriculture_and_livelihood",
    "effort": "agriculture_and_livelihood", "reward": "agriculture_and_livelihood",
    "punishment": "governance_and_justice", "crime": "governance_and_justice",
    "sentence": "governance_and_justice", "verdict": "governance_and_justice",
    "marriage": "Marriage",
    "wedding": "Marriage",
    "kawing": "Marriage",
    "kakhawing": "Marriage",
    "courtship": "Courtship",
    "dating": "Courtship",
    "ligaw": "Courtship",
    "pagidaan": "Courtship",
    "panoksam": "Courtship",
    "kapamanganakan": "Courtship",
    "kandiyalaga": "Courtship",
    "karoma": "Marriage",
    "karuma": "Marriage",
    "leadership": "Leadership",
    "authority": "Leadership",
    "kandato": "Leadership",
    "olowan": "Leadership",
    "datu": "Leadership",
    "dato": "Leadership",
    "conflict resolution": "Conflict Resolution",
    "rido": "Conflict Resolution",
    "kapamasad sa rido": "Conflict Resolution",
    "enthronment": "Enthronment",
    "kabangensa": "Enthronment",
    "kabangsa": "Enthronment",
    "khabangsa": "Enthronment",
    "argumentation": "Argumentation",
    "kapangilat": "Argumentation",
    "kazambi sa lalag": "Argumentation",
    "kasambi sa lalag": "Argumentation",
    "moral teaching": "Moral Teaching and Self-Reflection",
    "tuma": "Moral Teaching and Self-Reflection",
    "toma": "Moral Teaching and Self-Reflection",
    "ginawa": "Moral Teaching and Self-Reflection",
    "sarili": "Moral Teaching and Self-Reflection",
    "self-reflection": "Moral Teaching and Self-Reflection",
    "love": "Love",
    "affection": "Love"
}

reverse_normalization = {
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

# Load and embed local data
def load_cached_proverbs():
    with open('proverbs_cache.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    for item in data:
        combined_text = f"{item.get('meranaw', '')} {item.get('literal_meaning', '')} {item.get('english_translation', '')}"
        item['embedding'] = model.encode(combined_text, convert_to_tensor=True)
    
    return data

def resolve_theme(query):
    """Map a query word to a standard theme name if possible."""
    return theme_mapping.get(query.lower(), None)

def normalize_query_text(text):
    """Normalize each word in the query using reverse normalization."""
    words = text.lower().split()
    normalized = [reverse_normalization.get(word, word) for word in words]
    return " ".join(normalized)


# Unified search: keyword + semantic + theme filter
def unified_search(query, theme=None, top_k=10):
    proverbs = load_cached_proverbs()

    # Normalize query
    normalized_query = normalize_query_text(query)

    # Try resolving theme from query if not explicitly given
    resolved_theme = resolve_theme(query)
    if not theme and resolved_theme:
        theme = resolved_theme

    if theme:
        proverbs = [p for p in proverbs if p.get('theme', '').lower() == theme.lower()]

    # Encode the normalized query
    query_embedding = model.encode(normalized_query, convert_to_tensor=True)

    # Score proverbs semantically
    for p in proverbs:
        p['score'] = util.cos_sim(query_embedding, p['embedding']).item()

    sorted_results = sorted(proverbs, key=lambda x: x['score'], reverse=True)

    for p in sorted_results:
        p.pop('embedding', None)

    return sorted_results[:top_k]

def get_suggestions(partial_query):
    normalized_partial = normalize_query_text(partial_query.lower())
    suggestions = set()

    # From reverse_normalization and theme_mapping keys
    for word in list(reverse_normalization.keys()) + list(theme_mapping.keys()):
        if word.startswith(normalized_partial):
            suggestions.add(word)

    return sorted(suggestions)[:10]  # Limit to top 10

