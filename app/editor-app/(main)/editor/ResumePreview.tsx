/* eslint-disable react/display-name */
import useDimensions from "@/hooks/useDimensions";
import { cn } from "@/lib/utils";
import { memo, useMemo, useRef } from "react";
import { useResume } from "./forms/ResumeProvider";
import { Phone, Mail, Linkedin, Github, ExternalLink } from "lucide-react";
import { formatDate } from "date-fns/format";
import { ResumeValues } from "@/lib/validation";
import DOMPurify from "dompurify";

interface ResumePreviewProps {
  className?: string;
  contentRef?: React.Ref<HTMLDivElement>;
}

interface ResumeSectionProps {
  personalInfo?: ResumeValues["personalInfo"];
  workExperiences?: ResumeValues["workExperiences"];
  education?: ResumeValues["education"];
  projects?: ResumeValues["projects"];
  skills?: ResumeValues["skills"];
  languages?: ResumeValues["languages"];
  volunteer?: ResumeValues["volunteer"];
  interests?: ResumeValues["interests"];
  awards?: ResumeValues["awards"];
  references?: ResumeValues["references"];
}

interface GenericSectionProps {
  title: string;
  data?: { description?: string; description_text?: string };
}

export default function ResumePreview({ className, contentRef }: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useDimensions(containerRef as React.RefObject<HTMLElement>);
  const { resumeData } = useResume();
  console.log(resumeData);
  // 794 is the width of the resume previewer
  // 210/297 is the aspect ratio of an A4 paper

  const filteredData = useMemo(
    () => ({
      workExperiences: resumeData?.workExperiences?.filter((exp) =>
        Object.values(exp).some(Boolean)
      ),
      education: resumeData?.education?.filter((edu) =>
        Object.values(edu).some(Boolean)
      ),
      projects: resumeData?.projects?.filter((project) =>
        Object.values(project).some(Boolean)
      ),
    }),
    [resumeData]
  );

  return (
    <div
      className={cn(
        "bg-white text-black h-fit w-full aspect-[210/297]",
        className
      )}
      ref={containerRef}
    >
      <div
        className={cn("space-y-6 p-6", !width && "invisible")}
       // style={{ zoom: (1 / 794) * width }}
        ref={contentRef}
        id="resumePreviewContent"
      >
        <PersonalInfoHeader personalInfo={resumeData?.personalInfo} />
        <WorkExperienceSection
          workExperiences={filteredData?.workExperiences}
        />
        <EducationSection education={filteredData?.education} />
        <ProjectsSection projects={filteredData?.projects} />
        <SkillsSection skills={resumeData?.skills} />
        <LanguagesSection languages={resumeData?.languages} />
        <VolunteerSection volunteer={resumeData?.volunteer} />
        <InterestsSection interests={resumeData?.interests} />
        <AwardsSection awards={resumeData?.awards} />
        <ReferencesSection references={resumeData?.references} />
      </div>
    </div>
  );
}

const PersonalInfoHeader = memo(({ personalInfo }: ResumeSectionProps) => {
  const { firstname, lastname, email, phone, socials, city, country, summary } =
    personalInfo || {};
  const { linkedin, github } = socials || {};

  return (
    <div className="w-full break-words">
      {/* Name & Contact Info (Centered) */}
      <div className="flex justify-center">
        <div className="max-w-[80%] text-center break-words">
          {/* Name */}
          <h1 className="text-3xl font-bold break-words">
            {firstname} {lastname}
          </h1>

          {/* Contact Info & Location */}
          <div className="flex justify-center items-center flex-wrap gap-4 mt-2 text-sm">
            {/* Location (City, Country) */}
            {(city || country) && (
              <span className="text-gray-600 break-words">
                {city}
                {city && country ? ", " : ""}
                {country}
              </span>
            )}

            {/* Phone */}
            {phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {phone}
              </span>
            )}

            {/* Email */}
            {email && (
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {email}
              </span>
            )}

            {/* LinkedIn */}
            {linkedin && (
              <span className="flex items-center gap-1">
                <Linkedin className="w-4 h-4" />
                {linkedin}
              </span>
            )}

            {/* GitHub */}
            {github && (
              <span className="flex items-center gap-1">
                <Github className="w-4 h-4" />
                {github}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Summary Section (Full Width) */}
      {summary && (
        <div className="mt-4">
          <div className="w-full text-left space-y-1 break-inside-avoid">
            <p className="text-lg font-semibold break-words">Summary</p>
            <hr className="border-black border-1" />
            <div className="whitespace-pre-line text-sm">{summary}</div>
          </div>
        </div>
      )}
    </div>
  );
});

const WorkExperienceSection = memo(
  ({ workExperiences }: ResumeSectionProps) => {
    if (!workExperiences?.length) return null;

    return (
      <div className="w-full">
        {/* Work Experience Heading & Line */}
        <p className="text-lg font-semibold break-words">Work Experience</p>
        <hr className="border-black border-1 mb-2" />

        {/* Work Experience List */}
        {workExperiences.map((exp, index) => (
          <div key={index} className="break-inside-avoid">
            {/* Company Name & Date */}
            <div className="flex justify-between items-start">
              <p className="text-md font-bold mt-1 break-words">{exp.name}</p>
              {exp.startDate && (
                <span className="break-words">
                  {formatDate(exp.startDate, "MM/yyyy")} -{" "}
                  {exp.endDate ? formatDate(exp.endDate, "MM/yyyy") : "Present"}
                </span>
              )}
            </div>

            {/* Position & Location */}
            <div className="flex justify-between text-sm italic">
              {exp.position && <p className="break-words">{exp.position}</p>}
              {(exp.city || exp.country) && (
                <p className="text-right break-words">
                  {exp.city}
                  {exp.city && exp.country ? ", " : ""}
                  {exp.country}
                </p>
              )}
            </div>

            {/* Description (Bullet Points) */}
            {exp.description && (
              <div
                className="mt-2 text-sm break-words"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(exp.description) }}
              />
            )}
          </div>
        ))}
      </div>
    );
  }
);

const EducationSection = memo(({ education }: ResumeSectionProps) => {
  if (!education?.length) return null;

  return (
    <div className="w-full break-inside-avoid">
      {/* Education Heading & Line */}
      <p className="text-lg font-semibold break-words">Education</p>
      <hr className="border-black border-1 mb-2" />

      {/* Education List */}
      {education.map((edu, index) => (
        <div key={index} className="space-y-2">
          {/* Institution & Date */}
          <div className="flex justify-between items-start">
            <p className="text-md font-bold break-words">{edu.institution}</p>
            {edu.startDate && (
              <span className="break-words">
                {formatDate(edu.startDate, "MM/yyyy")} -{" "}
                {edu.endDate ? formatDate(edu.endDate, "MM/yyyy") : "Present"}
              </span>
            )}
          </div>

          {/* Degree & Field of Study */}
          <div className="flex justify-between text-sm italic">
            {edu.studyType && <p className="break-words">{edu.studyType}</p>}
            {edu.area && <p className="text-right break-words">{edu.area}</p>}
          </div>

          {/* Score (if exists) */}
          {edu.score && <p className="text-sm break-words">Score: {edu.score}</p>}

          {/* Courses or Description */}
          {edu.courses && (
            <div
              className="mt-2 text-sm break-words"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(edu.courses) }}
            />
          )}
        </div>
      ))}
    </div>
  );
});

const ProjectsSection = memo(({ projects }: ResumeSectionProps) => {
  if (!projects?.length) return null;

  return (
    <div className="w-full">
      {/* Projects Heading & Line */}
      <p className="text-lg font-semibold break-words">Projects</p>
      <hr className="border-black border-1 mb-2" />

      {/* Projects List */}
      {projects.map((project, index) => (
        <div key={index} className="break-inside-avoid space-y-2">
          {/* Project Title & Date */}
          <div className="flex justify-between items-start">
            <p className="text-md font-bold break-words">{project.title}</p>
            {project.startDate && (
              <span className="break-words">
                {formatDate(project.startDate, "MM/yyyy")} -{" "}
                {project.endDate
                  ? formatDate(project.endDate, "MM/yyyy")
                  : "Present"}
              </span>
            )}
          </div>

          {/* Project Link (if available) */}
          {project.link && (
            <p className="text-sm text-blue-600">
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 break-all"
              >
                View Project <ExternalLink className="w-4 h-4" />
              </a>
            </p>
          )}

          {/* Project Description */}
          {project.description && (
            <div
              className="mt-2 text-sm break-words"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.description) }}
            />
          )}
        </div>
      ))}
    </div>
  );
});

const SkillsSection = memo(({ skills }: ResumeSectionProps) => {
  return <GenericSection title="Skills" data={skills} />;
});

const LanguagesSection = memo(({ languages }: ResumeSectionProps) => {
  return <GenericSection title="Languages" data={languages} />;
});

const VolunteerSection = memo(({ volunteer }: ResumeSectionProps) => {
  return <GenericSection title="Volunteer Experience" data={volunteer} />;
});

const InterestsSection = memo(({ interests }: ResumeSectionProps) => {
  return <GenericSection title="Interests" data={interests} />;
});

const AwardsSection = memo(({ awards }: ResumeSectionProps) => {
  return <GenericSection title="Awards" data={awards} />;
});

// eslint-disable-next-line react/display-name
const ReferencesSection = memo(({ references }: ResumeSectionProps) => {
  return <GenericSection title="References" data={references} />;
});

// eslint-disable-next-line react/display-name
const GenericSection = memo(({ title, data }: GenericSectionProps) => {
  if (!data || !data.description || data.description === "<p></p>") return null;
  const sanitizedHTML = DOMPurify.sanitize(data.description);

  return (
    <div className="w-full">
      <p className="text-lg font-semibold break-words">{title}</p>
      <hr className="border-black border-1 mb-2" />
      
      {data.description && (
        <div
          className="mt-2 text-sm break-words"
          dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
        />
      )}
    </div>
  );
});
