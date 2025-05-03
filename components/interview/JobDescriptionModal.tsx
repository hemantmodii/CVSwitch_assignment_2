"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { DocumentTextIcon, ArrowUpTrayIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (jobDescription: string, resumeFile: File) => void;
}

type Step = 1 | 2 | 3;

export function JobDescriptionModal({ isOpen, onClose, onComplete }: Props) {
  console.log("Modal rendered, isOpen:", isOpen);
  
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [existingResumes] = useState([
    { id: 1, name: "Software_Engineer_Resume.pdf", date: "2024-03-15" },
    { id: 2, name: "Product_Manager_Resume.pdf", date: "2024-03-10" },
  ]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step);
    } else if (jobDescription && resumeFile) {
      onComplete(jobDescription, resumeFile);
      onClose();
    }
  };

  const isNextEnabled = () => {
    switch (currentStep) {
      case 1:
        return jobDescription.trim() !== "" || jobUrl.trim() !== "";
      case 2:
        return !!resumeFile;
      case 3:
        return true;
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Progress Bar */}
                <div className="w-full bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {[1, 2, 3].map((step) => (
                          <div
                            key={step}
                            className={`flex items-center ${step !== 3 ? 'gap-2' : ''}`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                step <= currentStep
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {step}
                            </div>
                            {step !== 3 && (
                              <div className="w-12 h-0.5 bg-gray-200" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      Step {currentStep} of 3
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                        Enter Job Description
                      </Dialog.Title>
                      <div className="space-y-4">
                        <textarea
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Paste the job description here..."
                          className="w-full h-64 p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">or</span>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={jobUrl}
                              onChange={(e) => setJobUrl(e.target.value)}
                              placeholder="Enter job posting URL"
                              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                        Select Resume
                      </Dialog.Title>
                      
                      {/* Existing Resumes */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700">Recent Resumes</h4>
                        {existingResumes.map((resume) => (
                          <button
                            key={resume.id}
                            onClick={() => setResumeFile(new File([], resume.name))} // This is a mock, replace with actual file
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                              resumeFile?.name === resume.name
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-200'
                            }`}
                          >
                            <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                            <div className="flex-1 text-left">
                              <p className="font-medium">{resume.name}</p>
                              <p className="text-sm text-gray-500">{resume.date}</p>
                            </div>
                            {resumeFile?.name === resume.name && (
                              <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Upload New Resume */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Upload New Resume</h4>
                        <label className="flex items-center justify-center gap-2 p-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-200 transition-colors cursor-pointer">
                          <ArrowUpTrayIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-600">
                            Drop your resume here or <span className="text-blue-600">browse</span>
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setResumeFile(file);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                        Ready to Start
                      </Dialog.Title>
                      <div className="space-y-4 text-gray-600">
                        <p>We&apos;ll now analyze your resume against the job description and prepare relevant interview questions.</p>
                        <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                          <p className="font-medium text-gray-700">Summary:</p>
                          <p>• Job Description: {jobDescription.slice(0, 100)}...</p>
                          <p>• Selected Resume: {resumeFile?.name}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!isNextEnabled()}
                    className={`px-6 py-2 rounded-xl text-white transition-colors ${
                      isNextEnabled()
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {currentStep === 3 ? 'Start Interview' : 'Next'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 