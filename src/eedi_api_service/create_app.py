from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import json
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import pandas as pd
import os

from eedi_api_service.inference.model_inf import analyze_misconception

class QuizData(BaseModel):
    question: str
    correct_answer: str
    incorrect_answer: str
    subject: str
    topic: str

def create_app():
    app = FastAPI()

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "https://rashmibanthia--eedi-misconception-analyzer.modal.run"
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.post("/api/misconceptions/analyze")
    async def get_top_misconceptions(quiz_data: QuizData):
        try:
            print("Received quiz data:", quiz_data.dict())
            analysis = analyze_misconception(quiz_data.dict())
            return analysis
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/api/subjects-and-constructs")
    async def get_subjects_and_constructs():
        try:
            df = pd.read_csv("/root/cache/data/train_formatted.csv")
            unique_subjects = sorted(df['SubjectName'].unique().tolist())
            unique_constructs = sorted(df['ConstructName'].unique().tolist())
            
            return JSONResponse({
                "subjects": unique_subjects,
                "constructs": unique_constructs
            })
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return app