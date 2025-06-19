"use client";

import { useState, useRef } from 'react'
import { Upload, Brain, Target, TrendingUp, Award, BookOpen, Zap, User, Mail, Phone, Calendar, MapPin } from 'lucide-react'

interface PersonalInfo {
  name?: string
  email?: string
  phone?: string
  location?: string
}

interface Experience {
  title?: string
  duration?: string
  is_current?: boolean
}

interface Education {
  description: string
  type: string
}

interface ResumeAnalysis {
  personal_info: PersonalInfo
  skills: string[]
  experience: Experience[]
  education: Education[]
  experience_level: string
  extracted_text_preview: string
}

interface CareerRecommendation {
  role: string
  match_percentage: number
  required_match: string
  preferred_match: string
  salary_range: string
  growth_outlook: string
  description: string
}

interface SkillGap {
  role: string
  missing_required: string[]
  missing_preferred: string[]
  priority: string
}

interface LearningPath {
  skill: string
  priority: string
  difficulty: string
  estimated_time: string
  resources: {
    courses: string[]
    youtube: string[]
    books: string[]
    practice: string[]
  }
  target_role: string
}

interface AnalysisResult {
  profile_analysis: ResumeAnalysis
  career_recommendations: {
    recommended_roles: CareerRecommendation[]
    total_analyzed: number
  }
  skill_gaps: SkillGap[]
  learning_paths: LearningPath[]
  success: boolean
}

export default function SkillPulse() {
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [activeTab, setActiveTab] = useState<'upload' | 'analysis' | 'recommendations' | 'learning'>('upload')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a resume file to analyze.")
      return
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF or Word (.doc/.docx) files are supported.")
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    setError("")
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/analyze-profile/`, {

        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setAnalysis(data)
      setActiveTab('analysis')
    } catch (err: unknown) {
  const errorMessage = err instanceof Error ? err.message : "Something went wrong"
  console.error("Analysis failed:", errorMessage)
  setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const resetAnalysis = () => {
    setFile(null)
    setAnalysis(null)
    setError("")
    setActiveTab('upload')
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50'
    if (percentage >= 60) return 'text-blue-600 bg-blue-50'
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getExperienceIcon = (level: string) => {
    switch (level) {
      case 'Entry Level': return '🌱'
      case 'Mid Level': return '🌿'
      case 'Senior Level': return '🌳'
      case 'Executive Level': return '🏆'
      default: return '📊'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SkillPulse
                </h1>
                <p className="text-sm text-gray-600">AI-Powered Career Intelligence</p>
              </div>
            </div>
            
            {analysis && (
              <button
                onClick={resetAnalysis}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>New Analysis</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      {analysis && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {([
                { id: 'analysis', label: 'Profile Analysis', icon: User },
                { id: 'recommendations', label: 'Career Matches', icon: Target },
                { id: 'learning', label: 'Learning Path', icon: BookOpen },
              ] as { id: 'analysis' | 'recommendations' | 'learning', label: string, icon: typeof User }[]).map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </nav>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Brain className="w-20 h-20 text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Discover Your Career Potential
              </h2>
              <p className="text-gray-600 text-lg">
                Upload your resume and get AI-powered insights into your career path,
                skill gaps, and personalized learning recommendations.
              </p>
            </div>

            {/* File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              
              {file ? (
                <div className="space-y-2">
                  <p className="text-green-600 font-semibold">✓ File Selected</p>
                  <p className="text-sm text-gray-600">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-700">
                    Drop your resume here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, DOC, and DOCX files up to 10MB
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">⚠️ {error}</p>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className={`w-full mt-6 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                !file || loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing Resume...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Analyze with AI</span>
                </div>
              )}
            </button>

            {/* Features Preview */}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: 'AI Analysis',
                  description: 'Advanced parsing of your skills, experience, and qualifications'
                },
                {
                  icon: Target,
                  title: 'Career Matching',
                  description: 'Find roles that match your profile with precision scoring'
                },
                {
                  icon: BookOpen,
                  title: 'Learning Paths',
                  description: 'Personalized recommendations to advance your career'
                }
              ].map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="text-center p-6 rounded-xl bg-white shadow-sm border border-gray-100">
                    <Icon className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Profile Analysis */}
        {activeTab === 'analysis' && analysis && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="w-6 h-6 mr-2 text-blue-600" />
                Profile Analysis
              </h2>

<div className="grid md:grid-cols-2 gap-6">
  {/* Personal Information */}
  <div className="space-y-4 text-gray-800 font-sans">
    <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
    <div className="space-y-2">
      {analysis.profile_analysis.personal_info.name && (
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <span>{analysis.profile_analysis.personal_info.name}</span>
        </div>
      )}
      {analysis.profile_analysis.personal_info.email && (
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-gray-500" />
          <span>{analysis.profile_analysis.personal_info.email}</span>
        </div>
      )}
      {analysis.profile_analysis.personal_info.phone && (
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-gray-500" />
          <span>{analysis.profile_analysis.personal_info.phone}</span>
        </div>
      )}
      {analysis.profile_analysis.personal_info.location && (
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span>{analysis.profile_analysis.personal_info.location}</span>
        </div>
      )}
    </div>
  </div>
                {/* Experience Level */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Experience Level</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {getExperienceIcon(analysis.profile_analysis.experience_level)}
                    </span>
                    <div>
                      <p className="font-semibold text-blue-600">
                        {analysis.profile_analysis.experience_level}
                      </p>
                      <p className="text-sm text-gray-600">
                        Based on work history analysis
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Identified Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.profile_analysis.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {analysis.profile_analysis.skills.length === 0 && (
                  <p className="text-gray-500 italic">No specific skills identified. Consider updating your resume with more technical skills.</p>
                )}
              </div>

              {/* Experience */}
              {analysis.profile_analysis.experience.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Work Experience</h3>
                  <div className="space-y-3">
                    {analysis.profile_analysis.experience.map((exp, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <div>
                          {exp.title && <p className="font-medium">{exp.title}</p>}
                          <p className="text-sm text-gray-600">{exp.duration}</p>
                          {exp.is_current && (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Career Recommendations */}
        {activeTab === 'recommendations' && analysis && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="w-6 h-6 mr-2 text-blue-600" />
                Career Recommendations
              </h2>

              <div className="grid gap-4">
                {analysis.career_recommendations.recommended_roles.map((role, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{role.role}</h3>
                        <p className="text-gray-600 text-sm">{role.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchColor(role.match_percentage)}`}>
                        {role.match_percentage}% Match
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Salary Range:</span>
                        <p className="font-medium text-green-600">{role.salary_range}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Growth Outlook:</span>
                        <p className="font-medium">{role.growth_outlook}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Skill Match:</span>
                        <p className="font-medium">
                          Required: {role.required_match} | Preferred: {role.preferred_match}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Gaps */}
            {analysis.skill_gaps.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
                  Skill Gap Analysis
                </h3>
                
                <div className="space-y-4">
                  {analysis.skill_gaps.map((gap, index) => (
                    <div key={index} className="border-l-4 border-orange-400 pl-4">
                      <h4 className="font-semibold text-gray-900">{gap.role}</h4>
                      <div className="mt-2 space-y-2">
                        {gap.missing_required.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-red-600">Missing Required Skills:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {gap.missing_required.map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {gap.missing_preferred.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-yellow-600">Missing Preferred Skills:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {gap.missing_preferred.map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Learning Paths */}
        {activeTab === 'learning' && analysis && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
                Personalized Learning Paths
              </h2>

              {analysis.learning_paths.length > 0 ? (
                <div className="space-y-6">
                  {analysis.learning_paths.map((path, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{path.skill}</h3>
                          <p className="text-sm text-gray-600">
                            For: {path.target_role} • {path.difficulty} Level • Est. {path.estimated_time}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          path.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {path.priority} Priority
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">📚 Courses</h4>
                          <ul className="text-sm space-y-1">
                            {path.resources.courses.map((course, idx) => (
                              <li key={idx} className="text-gray-600">• {course}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">🎥 YouTube</h4>
                          <ul className="text-sm space-y-1">
                            {path.resources.youtube.map((video, idx) => (
                              <li key={idx} className="text-gray-600">• {video}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">📖 Books</h4>
                          <ul className="text-sm space-y-1">
                            {path.resources.books.map((book, idx) => (
                              <li key={idx} className="text-gray-600">• {book}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">💻 Practice</h4>
                          <ul className="text-sm space-y-1">
                            {path.resources.practice.map((practice, idx) => (
                              <li key={idx} className="text-gray-600">• {practice}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Great Profile Match!
                  </h3>
                  <p className="text-gray-600">
                    Your skills align well with your target roles. Consider exploring advanced topics or adjacent skills to further enhance your profile.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Brain className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">SkillPulse</span>
            </div>
            <p className="text-gray-600 mb-4">
              Empowering careers through AI-driven insights and personalized learning recommendations.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <span>Built with ❤️ by Prabhakaran R</span>
              <span>•</span>
              <span>Powered by AI</span>
              <span>•</span>
              <span>© 2025 SkillPulse_Prabhakaran_R</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}