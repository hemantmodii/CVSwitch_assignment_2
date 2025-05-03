"use client";

import { useState } from 'react';
import { Sidebar } from "@/components/Sidebar";
import { BriefcaseIcon, PencilIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

interface LinkedInProfile {
  headline?: string;
  summary?: string;
  experiences?: {
    title: string;
    company: string;
    description: string;
    startDate: string;
    endDate?: string;
  }[];
  skills?: string[];
}

export function LinkedInSection() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  // Mock LinkedIn authentication
  const handleLinkedInSignIn = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would redirect to LinkedIn OAuth
      // For now, we'll simulate a successful authentication with mock data
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      // Mock profile data
      const mockProfile: LinkedInProfile = {
        headline: "Software Engineer at Tech Company",
        summary: "Experienced software engineer with a passion for building scalable web applications. Proficient in JavaScript, React, and Node.js.",
        experiences: [
          {
            title: "Senior Software Engineer",
            company: "Tech Company",
            description: "Led development of key features for the company's main product. Collaborated with cross-functional teams to deliver high-quality software.",
            startDate: "2020-01",
            endDate: "Present"
          },
          {
            title: "Software Engineer",
            company: "Previous Company",
            description: "Developed and maintained web applications using React and Node.js.",
            startDate: "2018-03",
            endDate: "2019-12"
          }
        ],
        skills: ["JavaScript", "React", "Node.js", "TypeScript", "HTML", "CSS"]
      };
      
      setProfile(mockProfile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error signing in with LinkedIn:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate suggestions based on profile data
  const generateSuggestions = (profile: LinkedInProfile) => {
    const suggestions = [];
    
    // Headline suggestions
    if (!profile.headline || profile.headline.length < 20) {
      suggestions.push({
        type: "headline",
        message: "Your headline is too short. Consider adding more details about your role and expertise."
      });
    }
    
    // Summary suggestions
    if (!profile.summary || profile.summary.length < 100) {
      suggestions.push({
        type: "summary",
        message: "Your summary is too brief. Add more details about your experience, skills, and career goals."
      });
    } else if (profile.summary.length > 500) {
      suggestions.push({
        type: "summary",
        message: "Your summary is quite long. Consider making it more concise for better readability."
      });
    }
    
    // Experience suggestions
    if (!profile.experiences || profile.experiences.length === 0) {
      suggestions.push({
        type: "experience",
        message: "Add your work experiences to make your profile more complete."
      });
    } else {
      profile.experiences.forEach((exp, index) => {
        if (exp.description.length < 50) {
          suggestions.push({
            type: "experience",
            index,
            message: `The description for your role at ${exp.company} is too brief. Add more details about your responsibilities and achievements.`
          });
        }
      });
    }
    
    // Skills suggestions
    if (!profile.skills || profile.skills.length < 5) {
      suggestions.push({
        type: "skills",
        message: "Add more skills to showcase your expertise. Aim for at least 10 relevant skills."
      });
    }
    
    return suggestions;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6">LinkedIn Profile Optimizer</h1>
        
        {/* User Guide */}
        {showGuide && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <InformationCircleIcon className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">How to Use LinkedIn Optimizer</h3>
                <p className="text-blue-700 mb-2">
                  This tool helps you optimize your LinkedIn profile by analyzing your current profile and providing suggestions for improvement.
                </p>
                <ol className="list-decimal list-inside text-blue-700 space-y-1 mb-3">
                  <li>Click the &#34;Sign in with LinkedIn&#34; button to authenticate and import your profile data</li>
                  <li>Review your imported profile information</li>
                  <li>Check the suggestions provided to improve your profile</li>
                  <li>Edit your profile based on the suggestions</li>
                  <li>Save your changes and update your LinkedIn profile</li>
                </ol>
                <button 
                  onClick={() => setShowGuide(false)}
                  className="text-blue-700 font-medium hover:text-blue-800"
                >
                  Hide Guide
                </button>
              </div>
            </div>
          </div>
        )}
        
        {!isAuthenticated ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <BriefcaseIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connect Your LinkedIn Profile</h2>
            <p className="text-gray-600 mb-6">
              Sign in with LinkedIn to import your profile data and get personalized optimization suggestions.
            </p>
            <button
              onClick={handleLinkedInSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-[#0077B5] text-white rounded-lg px-6 py-2 font-medium hover:bg-[#006699] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0077B5] mx-auto"
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  Sign in with LinkedIn
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Overview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Profile Overview</h2>
                <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <PencilIcon className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Headline */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-gray-700">Headline</h3>
                    {profile?.headline && profile.headline.length >= 20 ? (
                      <span className="text-green-600 text-sm flex items-center">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Good
                      </span>
                    ) : (
                      <span className="text-amber-600 text-sm flex items-center">
                        <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                        Needs Improvement
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 p-3 bg-gray-50 rounded-md">{profile?.headline || "No headline provided"}</p>
                </div>
                
                {/* Summary */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-gray-700">Summary</h3>
                    {profile?.summary && profile.summary.length >= 100 && profile.summary.length <= 500 ? (
                      <span className="text-green-600 text-sm flex items-center">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Good
                      </span>
                    ) : (
                      <span className="text-amber-600 text-sm flex items-center">
                        <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                        Needs Improvement
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 p-3 bg-gray-50 rounded-md whitespace-pre-line">
                    {profile?.summary || "No summary provided"}
                  </p>
                </div>
                
                {/* Skills */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-gray-700">Skills</h3>
                    {profile?.skills && profile.skills.length >= 5 ? (
                      <span className="text-green-600 text-sm flex items-center">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Good
                      </span>
                    ) : (
                      <span className="text-amber-600 text-sm flex items-center">
                        <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                        Needs Improvement
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills provided</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Experience */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
              
              {profile?.experiences && profile.experiences.length > 0 ? (
                <div className="space-y-6">
                  {profile.experiences.map((exp, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800">{exp.title}</h3>
                          <p className="text-gray-600">{exp.company}</p>
                          <p className="text-gray-500 text-sm">
                            {exp.startDate} - {exp.endDate || "Present"}
                          </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-sm font-medium text-gray-700">Description</h4>
                          {exp.description.length >= 50 ? (
                            <span className="text-green-600 text-sm flex items-center">
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Good
                            </span>
                          ) : (
                            <span className="text-amber-600 text-sm flex items-center">
                              <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                              Too Brief
                            </span>
                          )}
                        </div>
                        <p className="text-gray-800 p-3 bg-gray-50 rounded-md">
                          {exp.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No work experience found. Add your work history to enhance your profile.</p>
                </div>
              )}
            </div>
            
            {/* Suggestions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Optimization Suggestions</h2>
              
              {profile && generateSuggestions(profile).length > 0 ? (
                <ul className="space-y-3">
                  {generateSuggestions(profile).map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-md">
                      <ExclamationCircleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-800">{suggestion.message}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {suggestion.type === "headline" && "Update your headline to be more specific and include your key skills or expertise."}
                          {suggestion.type === "summary" && "Your summary should tell your professional story and highlight your achievements."}
                          {suggestion.type === "experience" && "Include specific achievements and quantifiable results in your experience descriptions."}
                          {suggestion.type === "skills" && "Add skills that are relevant to your industry and match keywords from job descriptions."}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-green-600">
                  <CheckCircleIcon className="w-12 h-12 mx-auto mb-3" />
                  <p className="font-medium">Great job! Your LinkedIn profile looks well-optimized.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 