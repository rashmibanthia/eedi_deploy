from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import json
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import pandas as pd
import os
from pathlib import Path

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
            # Determine environment and set path accordingly
            is_modal = os.environ.get('MODAL_ENVIRONMENT') == 'true'
            
            if is_modal:
                # Production path
                file_path = Path("/root/cache/data/train_formatted.csv")
            else:
                # Local development path
                file_path = Path(__file__).parent.parent.parent / "deploy_assets" / "train_formatted.csv"
            
            print(f"Reading CSV from: {file_path}")  # Debug print
            
            df = pd.read_csv(file_path)
            unique_subjects = sorted(df['SubjectName'].unique().tolist())
            unique_constructs = sorted(df['ConstructName'].unique().tolist())
            
            return JSONResponse({
                "subjects": unique_subjects,
                "constructs": unique_constructs
            })
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return app