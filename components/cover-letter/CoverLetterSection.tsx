"use client";

import { useRef } from "react";
import {
  DocumentArrowUpIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCoverLetters } from "@/hooks/useCoverLetters";

export function CoverLetterSection() {
  const { user } = useAuth();
  const { 
    coverLetters, 
    isLoading, 
    uploadCoverLetter, 
    uploadLoading,
    error 
  } = useCoverLetters(user?.id);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && user) {
      const file = event.target.files[0];
      await uploadCoverLetter(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="ml-64 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-800 mb-6 dark:text-white">
            Cover Letter Manager
          </h1>

          {/* Primary Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-200 hover:dark:bg-slate-300 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer ease-in-out duration-300"
            >
              {uploadLoading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              ) : (
                <DocumentArrowUpIcon className="w-12 h-12 text-indigo-600 mb-3" />
              )}
              <h3 className="font-semibold text-lg mb-1 text-slate-800">Upload Cover Letter</h3>
              <p className="text-slate-500 text-center">
                Upload an existing cover letter file
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
            </div>

            <Link href="/cover-letter/create">
              <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-200 hover:dark:bg-slate-300 rounded-xl border-2 border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer h-full ease-in-out duration-300">
                <PencilIcon className="w-12 h-12 text-indigo-600 mb-3" />
                <h3 className="font-semibold text-lg mb-1 text-slate-800">
                  Create from Scratch
                </h3>
                <p className="text-slate-500 text-center">
                  Build a new cover letter with our editor
                </p>
              </div>
            </Link>
          </div>

          {/* Past Cover Letters Section */}
          <div className="bg-white dark:bg-slate-200 hover:dark:bg-slate-300  rounded-xl border border-slate-200 p-6 mb-8 shadow-sm ease-in-out duration-300">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Past Cover Letters</h2>

            {error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
              </div>
            ) : isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-slate-500">Loading your cover letters...</p>
              </div>
            ) : coverLetters.length > 0 ? (
              <div className="space-y-3">
                {coverLetters.map((coverLetter) => (
                  <div
                    key={coverLetter.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
                      <div>
                        <p className="font-medium text-slate-800">{coverLetter.name}</p>
                        <p className="text-sm text-slate-500">
                          Last modified: {coverLetter.lastModified}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/cover-letter/${coverLetter.id}`}>
                        <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100">
                          <PencilIcon className="w-5 h-5" />
                        </Button>
                      </Link>

                      {coverLetter.url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-600 hover:bg-slate-100"
                          onClick={() => window.open(coverLetter.url, '_blank')}
                        >
                          <ArrowDownTrayIcon className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>
                  {user ? "No cover letters found. Upload or create a new cover letter to get started." : 
                   "Please sign in to view your cover letters."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}