/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import AwardsForm from "./forms/AwardsForm";
import EducationForm from "./forms/EducationForm";
import InterestForm from "./forms/InterestForm";
import LanguagesForm from "./forms/LanguagesForm";
import PersonalInfoForm from "./forms/PersonalInfoForm";
import ReferenceForm from "./forms/ReferenceForm";
import { ResumeProvider, useResume } from "./forms/ResumeProvider";
import SkillsForm from "./forms/SkillsForm";
import VolunteerForm from "./forms/VolunteerForm";
import WorkExperienceForm from "./forms/WorkExperienceForm";
import ProjectsForm from "./forms/ProjectsForm";
import ResumePreviewSection from "./ResumePreviewSection";
import { ResumeValues } from "@/lib/validation";
import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import html2pdf from "html2pdf.js";

interface ResumeEditorProps {
  initialData?: ResumeValues;
  onSave: (resumeData: any, template: string, pdfFile: File) => void;
  contentRef: React.RefObject<HTMLDivElement>;
}

export interface ResumeEditorRef {
  save: () => Promise<void>;
}

type TemplateType = "single" | "double" | "colored" | "singleColored";

// Internal component that has access to ResumeProvider context
function ResumeEditorInternal({
  onSave,
  contentRef,
  template,
  setTemplate,
  saveRef
}: {
  onSave: (resumeData: any, template: string, pdfFile: File) => void;
  contentRef: React.RefObject<HTMLDivElement>;
  template: TemplateType;
  setTemplate: (template: TemplateType) => void;
  saveRef: React.RefObject<{ save: () => Promise<void> }>;
}) {
  const { resumeData } = useResume();

  const handleSave = async () => {
    if (contentRef.current) {
      const options = {
        margin: 1,
        filename: "resume.pdf",
        html2canvas: { scale: 1 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      try {
        const pdfBlob = await html2pdf().set(options).from(contentRef.current).outputPdf("blob");
        const pdfFile = new File([pdfBlob], "resume.pdf", { type: "application/pdf" });
        onSave(resumeData, template, pdfFile);
      } catch (error) {
        console.error("Error generating PDF:", error);
      }
    }
  };

  // Expose save method through ref
  useEffect(() => {
    if (saveRef.current) {
      saveRef.current.save = handleSave;
    }
  }, [resumeData, template]);

  return (
    <div className="flex h-screen">
      <main className="flex grow">
        <div className="w-1/2 px-4 overflow-y-auto mt-16 pb-10 hidden-scrollbar">
          <PersonalInfoForm />
          <WorkExperienceForm />
          <EducationForm />
          <ProjectsForm />
          <SkillsForm />
          <LanguagesForm />
          <VolunteerForm />
          <InterestForm />
          <ReferenceForm />
          <AwardsForm />
        </div>
        <div className="grow border-r h-full" />
        <ResumePreviewSection 
          template={template} 
          setTemplate={setTemplate} 
          contentRef={contentRef as React.RefObject<HTMLDivElement>} 
        />
      </main>
    </div>
  );
}

const ResumeEditor = forwardRef<ResumeEditorRef, ResumeEditorProps>(
  ({ initialData, onSave, contentRef }, ref) => {
    const [template, setTemplate] = useState<TemplateType>("single");
    const internalSaveRef = useRef<{ save: () => Promise<void> }>({ save: async () => {} });

    // Forward the internal save method through the ref
    useImperativeHandle(ref, () => ({
      save: async () => {
        if (internalSaveRef.current) {
          await internalSaveRef.current.save();
        }
      }
    }));

    return (
      <ResumeProvider initialData={initialData}>
        <ResumeEditorInternal
          onSave={onSave}
          contentRef={contentRef}
          template={template}
          setTemplate={setTemplate}
          saveRef={internalSaveRef}
        />
      </ResumeProvider>
    );
  }
);

ResumeEditor.displayName = "ResumeEditor";

export default ResumeEditor;

