"use client";

import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { JobDescriptionModal } from "./JobDescriptionModal";

interface Props {
  onJobDescriptionSubmit: (jobDescription: string) => void;
  hasJobDescription: boolean;
}

export function JobDescriptionButton({ onJobDescriptionSubmit, hasJobDescription }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    console.log("Button clicked");
    setIsModalOpen(true);
  };

  const handleComplete = (jobDescription: string) => {
    console.log("Modal completed");
    onJobDescriptionSubmit(jobDescription);
    setIsModalOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-blue-200 transition-colors"
      >
        <DocumentTextIcon className="w-5 h-5 text-blue-600" />
        <span>{hasJobDescription ? "Job Description Added ✓" : "Paste Job Description"}</span>
      </button>

      <JobDescriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleComplete}
      />
    </div>
  );
} 