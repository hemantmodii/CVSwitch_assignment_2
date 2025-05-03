"use client";

import { useState, useRef, useEffect } from "react";
import {
  DocumentArrowUpIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useResumes } from "@/hooks/useResumes";
import { Loader2 } from "lucide-react";
import { resumeService } from "@/services/resumeService";
import axios from "axios";
import { API_CONFIG } from "@/config/api";

interface Resume {
  id: string;
  name: string;
  lastModified: string;
  url?: string;
  cloudPath?: string;
  jsonUrl?: string | null;
  parsingStatus?: "parsing" | "completed" | "failed" | undefined;
}

interface ResumeAnalysis {
  Areas_of_Improvment: string[];
  strengths: string[];
}

export function ResumeSection() {
  const { user } = useAuth();
  const { 
    resumes, 
    isLoading, 
    uploadResume, 
    uploadLoading 
  } = useResumes(user?.uid);

  console.log(resumes, 'resumes')
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "strengths" | "weaknesses" | "improvements"
  >("strengths");
  const [parsingStatus, setParsingStatus] = useState<"idle" | "parsing" | "completed" | "failed">("idle");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null);
  const [currentlyParsingResumeId, setCurrentlyParsingResumeId] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && user) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setParsingStatus("idle");
      
      try {
        // Upload the resume
        const uploadedResume = await uploadResume(file);
        
        // Show parsing status
        setParsingStatus("parsing");
        
        if (uploadedResume?.data?.resume_id) {
          const resumeId = uploadedResume?.data?.resume_id;
          setCurrentlyParsingResumeId(resumeId);
          
          // Call parse_uploaded_resume endpoint
          const parseResponse = await axios.get(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PARSE_UPLOADED_RESUME}?resume_id=${resumeId}&user_id=${user.uid}`
          );
          
          if (parseResponse.status === 200) {
            setParsingStatus("completed");
            setCurrentlyParsingResumeId(null);
          } else {
            setParsingStatus("failed");
            setCurrentlyParsingResumeId(null);
            setError("Failed to parse resume. Please try again.");
          }
        } else {
          setParsingStatus("failed");
          setCurrentlyParsingResumeId(null);
          setError("Failed to get resume ID. Please try again.");
        }
      } catch (error) {
        console.error("Error in resume upload/parsing:", error);
        setParsingStatus("failed");
        setCurrentlyParsingResumeId(null);
        setError("An error occurred while processing your resume. Please try again.");
      }
    }
  };

  const handleAnalyze = async (resume: Resume) => {
    if (!user?.uid || !resume.jsonUrl) {
      setError('Missing required data for analysis');
      return;
    }

    setAnalysisLoading(true);
    setShowAnalysisModal(true);
    setError(null);
    
    try {
      const analysis = await resumeService.analyzeResume(user.uid, resume.jsonUrl);
      console.log('Analysis response:', analysis); // Debug log
      setCurrentAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while analyzing the resume');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!user?.uid) {
      setError('User not authenticated');
      return;
    }

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_RESUME}`,
        {
          user_id: user.uid,
          resume_id: resumeId
        }
      );

      if (response.status === 200) {
        // Refresh the resumes list
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting resume:", error);
      setError('Failed to delete resume. Please try again.');
      setTimeout(() => setError(null), 2000);
    }
  };

  const handleDeleteClick = (resumeId: string) => {
    setResumeToDelete(resumeId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (resumeToDelete) {
      await handleDelete(resumeToDelete);
      setShowDeleteModal(false);
      setResumeToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="ml-64 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-800 mb-6 dark:text-white">
            Resume Optimizer
          </h1>

          {/* Primary Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-200 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer hover:dark:bg-slate-300 duration-300 ease-in-out"
            >
              {uploadLoading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              ) : (
                <DocumentArrowUpIcon className="w-12 h-12 text-indigo-600 mb-3" />
              )}
              <h3 className="font-semibold text-lg mb-1 text-slate-800">Upload Resume</h3>
              <p className="text-slate-500 text-center">
                Upload an existing resume file
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
            </div>

            <Link href="/editor-app/editor">
              <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-200 rounded-xl border-2 border-slate-200 hover:border-indigo-300 transition-all cursor-pointer h-full hover:dark:bg-slate-300 duration-300 ease-in-out">
                <PencilIcon className="w-12 h-12 text-indigo-600 mb-3" />
                <h3 className="font-semibold text-lg mb-1 text-slate-800">
                  Create from Scratch
                </h3>
                <p className="text-slate-500 text-center">
                  Build a new resume with our editor
                </p>
              </div>
            </Link>
          </div>
          
          {/* Parsing Status Message */}
          {parsingStatus !== "idle" && (
            <div className={`text-center p-2 mb-6 rounded-lg ${
              parsingStatus === "parsing" 
                ? "bg-amber-50 text-amber-700" 
                : "bg-green-50 text-green-700"
            }`}>
              {parsingStatus === "parsing" 
                ? "Your resume is being parsed. This may take a few moments..." 
                : "Resume successfully parsed! You can now analyze it."}
            </div>
          )}

          {/* Past Resumes Section */}
          <div className="bg-white dark:bg-slate-200 rounded-xl border border-slate-200 p-6 mb-8 shadow-sm hover:dark:bg-slate-300 duration-300 ease-in-out">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Past Resumes</h2>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-slate-500">Loading your resumes...</p>
              </div>
            ) : resumes.length > 0 ? (
              <div className="space-y-3">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className={`flex items-center justify-between p-3 bg-slate-50 rounded-lg ${
                      currentlyParsingResumeId === resume.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
                      <div>
                        <p className="font-medium text-slate-800">{resume.name}</p>
                        <p className="text-sm text-slate-500">
                          Last modified: {resume.lastModified}
                        </p>
                        {currentlyParsingResumeId === resume.id && (
                          <p className="text-sm text-amber-600">Parsing in progress...</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAnalyze(resume)}
                        variant="default"
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700"
                        disabled={currentlyParsingResumeId === resume.id}
                      >
                        Analyze
                      </Button>

                      <Link href={`/editor-app/editor?resume_id=${resume.id}`}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-slate-600 hover:bg-slate-100"
                          disabled={currentlyParsingResumeId === resume.id}
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Button>
                      </Link>

                      {resume.url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-600 hover:bg-slate-100"
                          onClick={() => window.open(resume.url, '_blank')}
                          disabled={currentlyParsingResumeId === resume.id}
                        >
                          <ArrowDownTrayIcon className="w-5 h-5" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(resume.id)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled={currentlyParsingResumeId === resume.id}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>
                  {user ? "No resumes found. Upload or create a new resume to get started." : 
                   "Please sign in to view your resumes."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600">
              Are you sure you want to delete this resume? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analysis Modal */}
      <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
        <DialogContent className="sm:max-w-4xl p-0 rounded-lg overflow-hidden border-0 shadow-xl">
          <DialogHeader className="border-b border-slate-200 p-4">
            <DialogTitle className="text-slate-800">Resume Analysis</DialogTitle>
          </DialogHeader>

          {error ? (
            <div className="flex items-center justify-center p-12 text-red-600">
              <p>{error}</p>
            </div>
          ) : analysisLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <span className="ml-3 text-slate-600">Analyzing your resume...</span>
            </div>
          ) : currentAnalysis ? (
            <div className="flex h-[500px]">
              {/* Sidebar */}
              <div className="w-48 border-r border-slate-200 p-4 bg-slate-50">
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab("strengths")}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeTab === "strengths"
                        ? "bg-indigo-100 text-indigo-700 font-medium border-l-4 border-indigo-500"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    Strengths
                  </button>
                  <button
                    onClick={() => setActiveTab("improvements")}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeTab === "improvements"
                        ? "bg-indigo-100 text-indigo-700 font-medium border-l-4 border-indigo-500"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    Improvements
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <ScrollArea className="flex-1 p-6">
                <h3 className="text-lg font-medium mb-4 text-slate-800 capitalize">
                  {activeTab === "improvements" ? "Areas of Improvement" : activeTab}
                </h3>

                <ul className="space-y-4">
                  {activeTab === "strengths" && currentAnalysis.strengths && 
                    currentAnalysis.strengths.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-emerald-500"></span>
                        <p className="text-slate-700">{item}</p>
                      </li>
                    ))
                  }
                  {activeTab === "improvements" && currentAnalysis.Areas_of_Improvment && 
                    currentAnalysis.Areas_of_Improvment.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-amber-500"></span>
                        <p className="text-slate-700">{item}</p>
                      </li>
                    ))
                  }
                </ul>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex items-center justify-center p-12">
              <p className="text-slate-600">No analysis data available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}