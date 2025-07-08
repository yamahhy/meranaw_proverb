from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
import numpy as np

from transformers import pipeline
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

 # your firestore init function

app = FastAPI()
collection_name = "meranaw_proverbs"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000"# Frontend dev server (adjust if you're using Nuxt/Vercel)
        "https://meranaw-pananaroon.vercel.app/",
        "https://meranaw-frontend.onrender.com", 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- INTERPRETATION MODEL ---

model_path="./fine-tuned-t5-proverb-interpretation"
generator = pipeline("text2text-generation", model=model_path)

class InterpretRequest(BaseModel):
    data: List # expects [meranaw, englishTranslation, interpretation]

@app.post("/api/meranaw-interpreter")
async def interpret_proverb(req: InterpretRequest):
    meranaw, english_translation, interpretation = req.data  # <- Now expecting 3 values
    prompt = f"Meranaw Proverb: {meranaw}\nEnglish Translation: {english_translation}\nInterpretation: {interpretation}\nInterpretation:"

    result = generator(prompt, max_length=100, do_sample=True)
    interpretation = result[0]['generated_text']

    return {"data": [interpretation]}
