from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pdfminer.high_level import extract_text
import io
import re
from typing import Dict, List, Optional
from pydantic import BaseModel

from utils import (
    extract_skills, 
    extract_personal_info, 
    extract_experience, 
    extract_education,
    get_career_recommendations,
    get_skill_gap_analysis,
    get_learning_recommendations,
    calculate_experience_level
)

app = FastAPI(title="SkillPulse API", description="AI-Powered Career Path & Learning Recommendation Tool")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResumeAnalysis(BaseModel):
    personal_info: Dict
    skills: List[str]
    experience: List[Dict]
    education: List[Dict]
    experience_level: str
    extracted_text_preview: str

class CareerRecommendation(BaseModel):
    recommended_roles: List[Dict]
    skill_gaps: List[Dict]
    learning_paths: List[Dict]
    market_insights: Dict

@app.get("/")
def root():
    return {
        "message": "SkillPulse API is running!",
        "version": "2.0",
        "endpoints": [
            "/upload-resume/",
            "/analyze-profile/",
            "/career-recommendations/",
            "/health"
        ]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "SkillPulse"}

@app.post("/upload-resume/", response_model=ResumeAnalysis)
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Validate file type
    allowed_types = ["application/pdf", "application/msword", 
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail="Only PDF and Word documents are supported"
        )
    
    try:
        # Extract text from PDF
        contents = await file.read()
        file_stream = io.BytesIO(contents)
        text = extract_text(file_stream)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from file")
        
        # Comprehensive analysis
        personal_info = extract_personal_info(text)
        skills = extract_skills(text)
        experience = extract_experience(text)
        education = extract_education(text)
        experience_level = calculate_experience_level(experience)
        
        return ResumeAnalysis(
            personal_info=personal_info,
            skills=skills,
            experience=experience,
            education=education,
            experience_level=experience_level,
            extracted_text_preview=text[:500] + "..." if len(text) > 500 else text
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/analyze-profile/")
async def analyze_profile(file: UploadFile = File(...), target_role: Optional[str] = None):
    """Complete profile analysis with career recommendations"""
    
    # First get resume analysis
    resume_data = await upload_resume(file)
    
    # Get AI recommendations
    career_recommendations = get_career_recommendations(
        skills=resume_data.skills,
        experience=resume_data.experience,
        education=resume_data.education,
        target_role=target_role
    )
    
    skill_gaps = get_skill_gap_analysis(
        current_skills=resume_data.skills,
        target_roles=career_recommendations["recommended_roles"]
    )
    
    learning_paths = get_learning_recommendations(
        skill_gaps=skill_gaps,
        experience_level=resume_data.experience_level
    )
    
    return {
        "profile_analysis": resume_data,
        "career_recommendations": career_recommendations,
        "skill_gaps": skill_gaps,
        "learning_paths": learning_paths,
        "success": True
    }

@app.post("/career-recommendations/")
async def get_career_advice(
    skills: List[str],
    experience_years: int = 0,
    target_industry: Optional[str] = None
):
    """Get career recommendations based on skills and experience"""
    
    recommendations = get_career_recommendations(
        skills=skills,
        experience_years=experience_years,
        target_industry=target_industry
    )
    
    return recommendations

@app.get("/trending-skills/")
def get_trending_skills():
    """Get current trending skills in tech industry"""
    return {
        "trending_skills": [
            {"skill": "Artificial Intelligence", "growth": "+45%", "demand": "Very High"},
            {"skill": "Cloud Computing", "growth": "+38%", "demand": "High"},
            {"skill": "Data Science", "growth": "+35%", "demand": "High"},
            {"skill": "Cybersecurity", "growth": "+32%", "demand": "Very High"},
            {"skill": "DevOps", "growth": "+28%", "demand": "High"},
            {"skill": "React/Next.js", "growth": "+25%", "demand": "High"},
            {"skill": "Python", "growth": "+22%", "demand": "Very High"},
            {"skill": "Kubernetes", "growth": "+40%", "demand": "Medium"},
        ],
        "last_updated": "2025-06-19"
    }