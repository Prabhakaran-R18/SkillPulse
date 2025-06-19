"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Brain,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  Zap,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
} from "lucide-react";

type TabID = "upload" | "analysis" | "recommendations" | "learning";

interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
}

interface Experience {
  title?: string;
  duration?: string;
  is_current?: boolean;
}

interface Education {
  description: string;
  type: string;
}

interface ResumeAnalysis {
  personal_info: PersonalInfo;
  skills: string[];
  experience: Experience[];
  education: Education[];
  experience_level: string;
  extracted_text_preview: string;
}

interface CareerRecommendation {
  role: string;
  match_percentage: number;
  required_match: string;
  preferred_match: string;
  salary_range: string;
  growth_outlook: string;
  description: string;
}

interface SkillGap {
  role: string;
  missing_required: string[];
  missing_preferred: string[];
  priority: string;
}

interface LearningPath {
  skill: string;
  priority: string;
  difficulty: string;
  estimated_time: string;
  resources: {
    courses: string[];
    youtube: string[];
    books: string[];
    practice: string[];
  };
  target_role: string;
}

interface AnalysisResult {
  profile_analysis: ResumeAnalysis;
  career_recommendations: {
    recommended_roles: CareerRecommendation[];
    total_analyzed: number;
  };
  skill_gaps: SkillGap[];
  learning_paths: LearningPath[];
  success: boolean;
}

export default function SkillPulse() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabID>("upload");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a resume file to analyze.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF or Word (.doc/.docx) files are supported.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/analyze-profile/`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data: AnalysisResult = await response.json();
      setAnalysis(data);
      setActiveTab("analysis");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      console.error("Analysis failed:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setAnalysis(null);
    setError("");
    setActiveTab("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-50";
    if (percentage >= 60) return "text-blue-600 bg-blue-50";
    if (percentage >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getExperienceIcon = (level: string) => {
    switch (level) {
      case "Entry Level":
        return "🌱";
      case "Mid Level":
        return "🌿";
      case "Senior Level":
        return "🌳";
      case "Executive Level":
        return "🏆";
      default:
        return "📊";
    }
  };

  const tabs: { id: TabID; label: string; icon: any }[] = [
    { id: "analysis", label: "Profile Analysis", icon: User },
    { id: "recommendations", label: "Career Matches", icon: Target },
    { id: "learning", label: "Learning Path", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen">
      {/* ... retain your full return() UI code as is ... */}

      {/* Wherever you had this: */}
      {/* onClick={() => setActiveTab(tab.id as any)} */}

      {/* Now just use this: */}
      {/* onClick={() => setActiveTab(tab.id)} */}

      {/* ✅ Example */}
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} // ✅ Now type-safe
            className={`...`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}

      {/* ... rest of your component ... */}
    </div>
  );
}
