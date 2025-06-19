import re
from typing import Dict, List, Optional
from datetime import datetime
import json

# Comprehensive skills database
SKILLS_DATABASE = {
    "programming_languages": [
        "python", "javascript", "java", "c++", "c#", "go", "rust", "swift", "kotlin",
        "typescript", "php", "ruby", "scala", "r", "matlab", "perl", "shell", "bash"
    ],
    "web_technologies": [
        "react", "angular", "vue.js", "next.js", "node.js", "express", "django",
        "flask", "fastapi", "spring", "laravel", "rails", "html", "css", "sass",
        "bootstrap", "tailwind", "webpack", "vite"
    ],
    "databases": [
        "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "cassandra",
        "dynamodb", "sqlite", "oracle", "sql server", "neo4j", "firebase"
    ],
    "cloud_platforms": [
        "aws", "azure", "gcp", "google cloud", "heroku", "netlify", "vercel",
        "digitalocean", "kubernetes", "docker", "terraform", "cloudformation"
    ],
    "data_science": [
        "machine learning", "deep learning", "nlp", "computer vision", "data analysis",
        "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras",
        "matplotlib", "seaborn", "plotly", "jupyter", "tableau", "power bi"
    ],
    "devops_tools": [
        "git", "github", "gitlab", "jenkins", "travis ci", "circleci", "ansible",
        "puppet", "chef", "nagios", "prometheus", "grafana", "elk stack"
    ],
    "mobile_development": [
        "react native", "flutter", "ionic", "xamarin", "android", "ios",
        "swift", "kotlin", "objective-c"
    ],
    "soft_skills": [
        "leadership", "communication", "teamwork", "problem solving", "critical thinking",
        "project management", "agile", "scrum", "time management", "mentoring"
    ]
}

# Career paths database
CAREER_PATHS = {
    "Software Engineer": {
        "required_skills": ["programming", "algorithms", "data structures", "git"],
        "preferred_skills": ["react", "python", "javascript", "sql", "aws"],
        "salary_range": "$70k - $180k",
        "growth_outlook": "High",
        "description": "Design and develop software applications"
    },
    "Data Scientist": {
        "required_skills": ["python", "statistics", "machine learning", "sql"],
        "preferred_skills": ["pandas", "numpy", "tensorflow", "tableau", "r"],
        "salary_range": "$80k - $200k",
        "growth_outlook": "Very High",
        "description": "Analyze complex data to help organizations make decisions"
    },
    "DevOps Engineer": {
        "required_skills": ["linux", "docker", "kubernetes", "ci/cd", "scripting"],
        "preferred_skills": ["aws", "terraform", "ansible", "jenkins", "monitoring"],
        "salary_range": "$75k - $190k",
        "growth_outlook": "High",
        "description": "Bridge development and operations teams"
    },
    "Full Stack Developer": {
        "required_skills": ["frontend", "backend", "database", "api", "git"],
        "preferred_skills": ["react", "node.js", "mongodb", "docker", "aws"],
        "salary_range": "$65k - $170k",
        "growth_outlook": "High",
        "description": "Develop both client and server-side applications"
    },
    "ML Engineer": {
        "required_skills": ["machine learning", "python", "tensorflow", "data processing"],
        "preferred_skills": ["pytorch", "mlops", "kubernetes", "cloud", "statistics"],
        "salary_range": "$90k - $220k",
        "growth_outlook": "Very High",
        "description": "Deploy and maintain machine learning models in production"
    },
    "Cloud Architect": {
        "required_skills": ["cloud platforms", "architecture", "security", "networking"],
        "preferred_skills": ["aws", "azure", "terraform", "microservices", "kubernetes"],
        "salary_range": "$100k - $250k",
        "growth_outlook": "Very High",
        "description": "Design scalable cloud infrastructure solutions"
    }
}

def extract_skills(text: str) -> List[str]:
    """Enhanced skill extraction with better matching"""
    text = text.lower()
    found_skills = []
    
    # Flatten all skills
    all_skills = []
    for category in SKILLS_DATABASE.values():
        all_skills.extend(category)
    
    # Enhanced matching with word boundaries
    for skill in all_skills:
        skill_lower = skill.lower()
        # Use word boundaries for better matching
        pattern = r'\b' + re.escape(skill_lower) + r'\b'
        if re.search(pattern, text):
            found_skills.append(skill.title())
    
    # Remove duplicates and sort
    return sorted(list(set(found_skills)))

def extract_personal_info(text: str) -> Dict:
    """Extract personal information from resume text"""
    info = {}
    
    # Email extraction
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    if emails:
        info["email"] = emails[0]
    
    # Phone extraction
    phone_pattern = r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    phones = re.findall(phone_pattern, text)
    if phones:
        info["phone"] = phones[0]
    
    # Name extraction (basic - first few words before email/phone)
    lines = text.split('\n')[:5]  # Check first 5 lines
    for line in lines:
        line = line.strip()
        if line and not any(char.isdigit() for char in line) and '@' not in line:
            # Likely a name if it's short and has no numbers/email
            words = line.split()
            if 2 <= len(words) <= 4 and all(word.isalpha() for word in words):
                info["name"] = line.title()
                break
    
    # Location extraction (basic)
    location_patterns = [
        r'([A-Za-z\s]+,\s*[A-Z]{2})',  # City, State
        r'([A-Za-z\s]+,\s*[A-Za-z\s]+)',  # City, Country
    ]
    for pattern in location_patterns:
        matches = re.findall(pattern, text)
        if matches:
            info["location"] = matches[0]
            break
    
    return info

def extract_experience(text: str) -> List[Dict]:
    """Extract work experience from resume"""
    experience = []
    
    # Look for common experience patterns
    experience_patterns = [
        r'(\d{4})\s*[-–]\s*(\d{4}|present|current)',  # 2020-2024
        r'(\w+\s+\d{4})\s*[-–]\s*(\w+\s+\d{4}|present|current)',  # Jan 2020 - Dec 2024
    ]
    
    # Find job titles (common patterns)
    job_title_patterns = [
        r'(software engineer|developer|data scientist|analyst|manager|director|lead|senior|junior|intern)',
        r'(full stack|backend|frontend|devops|ml engineer|product manager)'
    ]
    
    lines = text.split('\n')
    current_experience = {}
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
            
        # Check for dates
        for pattern in experience_patterns:
            matches = re.findall(pattern, line, re.IGNORECASE)
            if matches:
                start_date, end_date = matches[0]
                current_experience = {
                    "duration": f"{start_date} - {end_date}",
                    "start_date": start_date,
                    "end_date": end_date,
                    "is_current": end_date.lower() in ['present', 'current']
                }
                
                # Look for job title in nearby lines
                for j in range(max(0, i-2), min(len(lines), i+3)):
                    nearby_line = lines[j].strip()
                    for title_pattern in job_title_patterns:
                        if re.search(title_pattern, nearby_line, re.IGNORECASE):
                            current_experience["title"] = nearby_line.title()
                            break
                
                if current_experience:
                    experience.append(current_experience)
                    current_experience = {}
                break
    
    return experience

def extract_education(text: str) -> List[Dict]:
    """Extract education information"""
    education = []
    
    # Common degree patterns
    degree_patterns = [
        r'(bachelor|master|phd|doctorate|associate|diploma|certificate)',
        r'(b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|ph\.?d\.?)',
        r'(computer science|engineering|mathematics|business|science|arts)'
    ]
    
    # University/College patterns
    institution_patterns = [
        r'university|college|institute|school',
        r'\b[A-Z][a-z]+\s+(University|College|Institute)\b'
    ]
    
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check if line contains education keywords
        has_degree = any(re.search(pattern, line, re.IGNORECASE) for pattern in degree_patterns)
        has_institution = any(re.search(pattern, line, re.IGNORECASE) for pattern in institution_patterns)
        
        if has_degree or has_institution:
            education.append({
                "description": line,
                "type": "degree" if has_degree else "institution"
            })
    
    return education

def calculate_experience_level(experience: List[Dict]) -> str:
    """Calculate experience level based on duration"""
    if not experience:
        return "Entry Level"
    
    total_years = 0
    current_year = datetime.now().year
    
    for exp in experience:
        try:
            start_year = int(re.findall(r'\d{4}', exp.get("start_date", ""))[0])
            if exp.get("is_current", False):
                end_year = current_year
            else:
                end_year = int(re.findall(r'\d{4}', exp.get("end_date", ""))[0])
            
            total_years += (end_year - start_year)
        except (IndexError, ValueError):
            continue
    
    if total_years < 2:
        return "Entry Level"
    elif total_years < 5:
        return "Mid Level"
    elif total_years < 10:
        return "Senior Level"
    else:
        return "Executive Level"

def get_career_recommendations(skills: List[str], experience: List[Dict], 
                             education: List[Dict], target_role: Optional[str] = None) -> Dict:
    """Get AI-powered career recommendations"""
    
    skills_lower = [skill.lower() for skill in skills]
    recommendations = []
    
    for role, details in CAREER_PATHS.items():
        score = 0
        required_matches = 0
        preferred_matches = 0
        
        # Check required skills
        for req_skill in details["required_skills"]:
            if any(req_skill in skill for skill in skills_lower):
                required_matches += 1
                score += 3
        
        # Check preferred skills
        for pref_skill in details["preferred_skills"]:
            if any(pref_skill in skill for skill in skills_lower):
                preferred_matches += 1
                score += 1
        
        # Calculate match percentage
        total_required = len(details["required_skills"])
        total_preferred = len(details["preferred_skills"])
        
        required_percentage = (required_matches / total_required) * 100 if total_required > 0 else 0
        preferred_percentage = (preferred_matches / total_preferred) * 100 if total_preferred > 0 else 0
        
        overall_match = (required_percentage * 0.7) + (preferred_percentage * 0.3)
        
        recommendations.append({
            "role": role,
            "match_percentage": round(overall_match, 1),
            "required_match": f"{required_matches}/{total_required}",
            "preferred_match": f"{preferred_matches}/{total_preferred}",
            "salary_range": details["salary_range"],
            "growth_outlook": details["growth_outlook"],
            "description": details["description"],
            "score": score
        })
    
    # Sort by match percentage
    recommendations.sort(key=lambda x: x["match_percentage"], reverse=True)
    
    return {
        "recommended_roles": recommendations[:6],
        "total_analyzed": len(CAREER_PATHS),
        "analysis_date": datetime.now().isoformat()
    }

def get_skill_gap_analysis(current_skills: List[str], target_roles: List[Dict]) -> List[Dict]:
    """Analyze skill gaps for target roles"""
    
    if not target_roles:
        return []
    
    current_skills_lower = [skill.lower() for skill in current_skills]
    skill_gaps = []
    
    for role_data in target_roles[:3]:  # Analyze top 3 roles
        role = role_data["role"]
        role_details = CAREER_PATHS.get(role, {})
        
        missing_required = []
        missing_preferred = []
        
        # Check missing required skills
        for req_skill in role_details.get("required_skills", []):
            if not any(req_skill in skill for skill in current_skills_lower):
                missing_required.append(req_skill.title())
        
        # Check missing preferred skills
        for pref_skill in role_details.get("preferred_skills", []):
            if not any(pref_skill in skill for skill in current_skills_lower):
                missing_preferred.append(pref_skill.title())
        
        skill_gaps.append({
            "role": role,
            "missing_required": missing_required,
            "missing_preferred": missing_preferred,
            "priority": "High" if missing_required else "Medium"
        })
    
    return skill_gaps

def get_learning_recommendations(skill_gaps: List[Dict], experience_level: str) -> List[Dict]:
    """Get personalized learning recommendations"""
    
    learning_paths = []
    
    # Learning resource mappings
    resource_mapping = {
        "python": {
            "courses": ["Python for Everybody (Coursera)", "Complete Python Bootcamp (Udemy)"],
            "youtube": ["Programming with Mosh", "Corey Schafer Python Tutorials"],
            "books": ["Python Crash Course", "Automate the Boring Stuff"],
            "practice": ["LeetCode", "HackerRank", "Codecademy"]
        },
        "machine learning": {
            "courses": ["Machine Learning by Andrew Ng (Coursera)", "Fast.ai Course"],
            "youtube": ["3Blue1Brown", "StatQuest"],
            "books": ["Hands-On Machine Learning", "Pattern Recognition and Machine Learning"],
            "practice": ["Kaggle", "Google Colab", "Jupyter Notebooks"]
        },
        "react": {
            "courses": ["React - The Complete Guide (Udemy)", "Full Stack Open"],
            "youtube": ["Traversy Media", "The Net Ninja"],
            "books": ["Learning React", "React Up & Running"],
            "practice": ["CodeSandbox", "React Official Tutorial", "FreeCodeCamp"]
        },
        "aws": {
            "courses": ["AWS Certified Solutions Architect", "A Cloud Guru AWS"],
            "youtube": ["AWS Training", "Cloud Practitioner Essentials"],
            "books": ["AWS Certified Solutions Architect Study Guide"],
            "practice": ["AWS Free Tier", "AWS Hands-on Labs"]
        }
    }
    
    for gap in skill_gaps:
        for skill in gap.get("missing_required", []) + gap.get("missing_preferred", []):
            skill_key = skill.lower()
            
            # Find matching resources
            resources = resource_mapping.get(skill_key, {
                "courses": [f"Search for {skill} courses on Coursera/Udemy"],
                "youtube": [f"Search for {skill} tutorials on YouTube"],
                "books": [f"Look for {skill} books on Amazon/O'Reilly"],
                "practice": [f"Practice {skill} on coding platforms"]
            })
            
            # Adjust recommendations based on experience level
            difficulty = "Beginner"
            if experience_level == "Mid Level":
                difficulty = "Intermediate"
            elif experience_level in ["Senior Level", "Executive Level"]:
                difficulty = "Advanced"
            
            learning_paths.append({
                "skill": skill,
                "priority": gap["priority"],
                "difficulty": difficulty,
                "estimated_time": "4-8 weeks",
                "resources": resources,
                "target_role": gap["role"]
            })
    
    return learning_paths