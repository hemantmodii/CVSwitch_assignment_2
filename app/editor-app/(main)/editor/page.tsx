/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Mail } from "lucide-react";
import ResumeEditor, { ResumeEditorRef } from "./ResumeEditor";
import CoverLetterEditor from "./CoverLetterEditor";
import { useEffect, useRef, useState } from "react";
import { API_CONFIG } from "@/config/api";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import html2pdf from "html2pdf.js";

interface ApiResponse {
  data: {
    public_url: string;
    cloud_file_path: string;
    file_name: string;
    template: string;
    user_resume_id: string;
  }
}

interface ResumeDataResponse {
  data: {
    parsed_json: any;
    template: string;
  };
  message: string;
  status: number;
}

export default function EditorPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "cover-letter" ? "cover-letter" : "resume";
  const resumeId = searchParams.get("resume_id");
  const [mode, setMode] = useState<"resume" | "cover-letter">(initialMode);
  const { user } = useAuth();
  const resumeEditorRef = useRef<ResumeEditorRef>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const [userResumeId, setUserResumeId] = useState<string | null>(resumeId);
  const [initialResumeData, setInitialResumeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (resumeId && user?.id) {
      setIsLoading(true);
      // Fetch resume data when resumeId is present
      axios.get<ResumeDataResponse>(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_RESUME_DATA}?user_id=${user.id}&resume_id=${resumeId}`
      )
        .then((response) => {
          if (response.data.data) {
            setInitialResumeData(response.data.data.parsed_json);
            setUserResumeId(resumeId);
          }
        })
        .catch((error) => {
          console.error("Error fetching resume data:", error);
          setValidationMessage("Error loading resume data. Please try again.");
          setTimeout(() => setValidationMessage(null), 2000);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [resumeId, user?.id]);



  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Function to get HTML with styles
  function getHtmlWithStyles(element: HTMLElement): string {
    const clone = element.cloneNode(true) as HTMLElement;
    const styleSheets = Array.from(document.styleSheets);
  
    styleSheets.forEach((styleSheet) => {
      try {
        const rules = styleSheet.cssRules;
        if (rules) {
          Array.from(rules).forEach((rule) => {
            const cssRule = rule as CSSStyleRule;
            const elements = clone.querySelectorAll(cssRule.selectorText);
            elements.forEach((el) => {
              if (el instanceof HTMLElement) {
                el.style.cssText += cssRule.style.cssText;
              }
            });
          });
        }
      } catch (e) {
        console.error("Error accessing stylesheet rules", e);
      }
    });
  
    return clone.outerHTML;
  }

  // const downloadPdf = async (url: string) => {
  //   try {
  //     const response = await axios.get(url, {
  //       responseType: 'blob'
  //     });
  //     const blob = new Blob([response.data], { type: 'application/pdf' });
  //     const downloadUrl = window.URL.createObjectURL(blob);
  //     const link = document.createElement('a');
  //     link.href = downloadUrl;
  //     link.download = "resume.pdf";
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(downloadUrl);
  //   } catch (error) {
  //     console.error("Error downloading PDF:", error);
  //     setValidationMessage("Error downloading the PDF. Please try again.");
  //     setTimeout(() => setValidationMessage(null), 2000);
  //   }
  // };




  const handleSave = async (resumeData: any, template: string) => {
    // Validation logic
    if (!resumeData) {
      setValidationMessage("Resume data is required.");
      setTimeout(() => setValidationMessage(null), 2000);
      return;
    }

    if (!resumeData.personalInfo?.firstname || !resumeData.personalInfo?.lastname) {
      setValidationMessage("First name and last name are required.");
      setTimeout(() => setValidationMessage(null), 2000);
      return;
    }

    if (!resumeData.workExperiences || resumeData.workExperiences.length === 0) {
      setValidationMessage("At least one work experience is required.");
      setTimeout(() => setValidationMessage(null), 2000);
      return;
    }

    setValidationMessage(null);

    let pdfFile: File | null = null;

    // Generate PDF from HTML
    if (resumePreviewRef.current) {
      const renderedHtmlWithStyles = getHtmlWithStyles(resumePreviewRef.current);

      const options = {
        margin: 1,
        filename: "resume.pdf",
        html2canvas: { scale: 1 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      try {
        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = renderedHtmlWithStyles;
        document.body.appendChild(tempContainer);

        // Generate PDF blob
        const pdfBlob = await html2pdf().set(options).from(tempContainer).outputPdf("blob");
        
        // Create file for upload
        pdfFile = new File([pdfBlob], "resume.pdf", { type: "application/pdf" });
        
        // Trigger download
        const downloadUrl = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = "resume.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        document.body.removeChild(tempContainer);
      } catch (error) {
        console.error("Error generating PDF:", error);
        setValidationMessage("Error generating the PDF. Please try again.");
        setTimeout(() => setValidationMessage(null), 2000);
        return;
      }
    }

    if (!pdfFile) {
      setValidationMessage("Could not generate PDF. Please try again.");
      setTimeout(() => setValidationMessage(null), 2000);
      return;
    }

    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('resumeData', JSON.stringify(resumeData));
      formData.append('template', template);
      
      if (userResumeId) {
        formData.append('user_resume_id', userResumeId);
      }

      const response = await axios.post<ApiResponse>(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HANDLE_EDITED_RESULT}?user_id=${user?.uid}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log(response, 'response111');

      // Store the user_resume_id for future updates
      if (response.data.data) {
        if (response.data.data.user_resume_id) {
          setUserResumeId(response.data.data.user_resume_id);
        }
      }

      console.log("API Response:", response.data);
    } catch (error) {
      console.error("Error saving resume data:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios Error Response:", error.response?.data);
        setValidationMessage("Error saving the resume. Please try again.");
        setTimeout(() => setValidationMessage(null), 2000);
      }
    }
  };

  const handleDownloadClick = async () => {
    if (resumeEditorRef.current) {
      await resumeEditorRef.current.save();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {validationMessage && (
        <div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-center py-2 px-4 rounded shadow-md transition-opacity duration-500 z-50"
          style={{ maxWidth: "400px" }}
        >
          {validationMessage}
        </div>
      )}

      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="flex items-center gap-1 dark:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="flex items-center gap-2 dark:bg-accent backdrop-blur-sm rounded-lg p-1 shadow-sm">
          <Button
            variant={mode === 'resume' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('resume')}
            className="flex items-center gap-1.5 transition-all duration-200"
          >
            <FileText className="h-4 w-4" />
            Resume
          </Button>
          <Button
            variant={mode === 'cover-letter' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('cover-letter')}
            className="flex items-center gap-1.5 transition-all duration-200"
          >
            <Mail className="h-4 w-4" />
            Cover Letter
          </Button>
        </div>

        <div className="flex items-center gap-2 dark:bg-accent backdrop-blur-sm rounded-lg p-1 shadow-sm ml-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadClick}
            className="flex items-center gap-1.5 transition-all duration-200"
          >
            <FileText className="h-4 w-4" />
            Save & Download
          </Button>
        </div>
      </div>
      
      {mode === 'resume' ? (
        <ResumeEditor 
          ref={resumeEditorRef}
          onSave={handleSave} 
          contentRef={resumePreviewRef as unknown as React.RefObject<HTMLDivElement>}
          initialData={initialResumeData}
        />
      ) : (
        <CoverLetterEditor />
      )}
    </div>
  );
}
