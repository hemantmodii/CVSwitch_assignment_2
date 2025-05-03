import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/auth';

const offerings = [
  { id: 'resume', label: 'I need a better resume', route: '/resume-optimizer' },
  { id: 'linkedin', label: 'I want a stronger LinkedIn profile', route: '/linkedin-optimizer' },
  { id: 'cover-letter', label: 'I need a cover letter', route: '/cover-letter' },
  { id: 'interview', label: 'I want to prepare for an interview', route: '/interview-prep' },
];

interface HeroSectionProps {
  user: User | null;
  hasUploadedResume: boolean;
  onUploadResume: (file: File) => void;
  pastResumes: string[];
  onOfferingSelect?: (selectedOption: string) => Promise<void>;
}

export function HeroSection({ 
  hasUploadedResume, 
  onUploadResume, 
  pastResumes,
  onOfferingSelect 
}: HeroSectionProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOfferings] = useState(!hasUploadedResume);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadResume(file);
    }
  };

  const handleCardClick = async (optionId: string) => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      try {
        if (onOfferingSelect) {
          await onOfferingSelect(optionId);
        }
        
        const selectedOption = offerings.find(option => option.id === optionId);
        if (selectedOption) {
          router.push(selectedOption.route);
        }
      } catch (error) {
        console.error('Error processing selection:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (showOfferings) {
    return (
      <div className="bg-white rounded-xl p-8 mb-6 max-w-4xl mx-auto dark:bg-gradient-to-bl dark:from-blue-950 dark:to-green-900">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">What would you start with?</h2>
        <p className="text-gray-500 mb-8">Select an option to begin optimizing your career assets</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offerings.map((option) => (
            <div
              key={option.id}
              onClick={() => handleCardClick(option.id)}
              onMouseEnter={() => setHoveredCard(option.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`relative p-6 rounded-xl border border-gray-200 transition-all cursor-pointer overflow-hidden dark:bg-white
                ${isSubmitting ? 'opacity-70 pointer-events-none' : ''}
                ${hoveredCard === option.id ? 'shadow-lg border-transparent' : 'hover:shadow-md'}
              `}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300
                ${option.id === 'resume' ? 'from-blue-50 to-purple-50 dark:from-blue-400 dark:to-purple-400' : ''}
                ${option.id === 'linkedin' ? 'from-sky-50 to-blue-50 dark:from-sky-400 dark:to-blue-400' : ''}
                ${option.id === 'cover-letter' ? 'from-emerald-50 to-teal-50 dark:from-emerald-400 dark:to-teal-400' : ''}
                ${option.id === 'interview' ? 'from-amber-50 to-orange-50 dark:from-amber-400 dark:to-orange-400' : ''}
                ${hoveredCard === option.id ? 'opacity-100' : 'opacity-0'}
              `}></div>
              
              {/* Animated border effect */}
              <div className={`absolute inset-0 rounded-xl border-2 pointer-events-none transition-all duration-300
                ${option.id === 'resume' ? 'border-blue-200' : ''}
                ${option.id === 'linkedin' ? 'border-sky-200' : ''}
                ${option.id === 'cover-letter' ? 'border-emerald-200' : ''}
                ${option.id === 'interview' ? 'border-amber-200' : ''}
                ${hoveredCard === option.id ? 'opacity-100' : 'opacity-0'}
              `}></div>
              
              <div className="relative flex items-center z-10">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 transition-colors
                  ${option.id === 'resume' ? 'bg-blue-100 text-blue-600' : ''}
                  ${option.id === 'linkedin' ? 'bg-sky-100 text-sky-600' : ''}
                  ${option.id === 'cover-letter' ? 'bg-emerald-100 text-emerald-600' : ''}
                  ${option.id === 'interview' ? 'bg-amber-100 text-amber-600' : ''}
                `}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    {option.id === 'resume' && (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    )}
                    {option.id === 'linkedin' && (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                    )}
                    {option.id === 'cover-letter' && (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    )}
                    {option.id === 'interview' && (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    )}
                  </svg>
                </div>
                <div>
                  <h3 className={`font-semibold text-lg transition-colors 
                    ${option.id === 'resume' ? 'text-blue-800' : ''}
                    ${option.id === 'linkedin' ? 'text-sky-800' : ''}
                    ${option.id === 'cover-letter' ? 'text-emerald-800' : ''}
                    ${option.id === 'interview' ? 'text-amber-800' : ''}
                  `}>
                    {option.label}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {option.id === 'resume' && 'Optimize your resume with AI'}
                    {option.id === 'linkedin' && 'Enhance your LinkedIn profile'}
                    {option.id === 'cover-letter' && 'Create a tailored cover letter'}
                    {option.id === 'interview' && 'Prepare for your next interview'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Your Resume</h2>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-500">PDF, DOC, or DOCX (MAX. 10MB)</p>
            </div>
            <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
          </label>
        </div>
      </div>

      {hasUploadedResume && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Your Resumes</h2>
          <div className="space-y-4">
            {pastResumes.map((resume, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium">{resume}</p>
                    <p className="text-sm text-gray-500">Uploaded {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-800">Edit</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}