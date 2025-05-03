/* eslint-disable react/display-name */
import { memo, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { useResume } from "./forms/ResumeProvider";
import { Phone, Mail, Linkedin, Github } from "lucide-react";
import { formatDate } from "date-fns/format";
import DOMPurify from "dompurify";
import useDimensions from "@/hooks/useDimensions";
import { ResumeValues } from "@/lib/validation";

interface TwoColumnColoredResumePreviewProps {
  contentRef?: React.Ref<HTMLDivElement>;
  className?: string;
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
  color?: string;
}

export default function TwoColumnColoredResumePreview({ className, contentRef }: TwoColumnColoredResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useDimensions(containerRef as React.RefObject<HTMLElement>);
  const { resumeData } = useResume();

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
        "bg-white text-black h-fit w-full aspect-[210/297] shadow-lg",
        className
      )}
      ref={containerRef}
    >
      <div
        className={cn("p-0", !width && "invisible")}
        style={{ zoom: (1 / 794) * width }}
        ref={contentRef}
      >
        {/* Main Grid Layout */}
        <div className="flex w-full h-full">
          {/* Left Column - Dark Background */}
          <div className="w-1/3 bg-zinc-800 text-white p-8">
            <div className="space-y-6 break-words">
              <PersonalInfoHeader personalInfo={resumeData?.personalInfo} />
              <EducationSection education={filteredData?.education} />
              <SkillsSection skills={resumeData?.skills} />
              <LanguagesSection languages={resumeData?.languages} />
            </div>
          </div>

          {/* Right Column - White Background */}
          <div className="w-2/3 p-8 space-y-6">
            <WorkExperienceSection workExperiences={filteredData?.workExperiences} />
            <ProjectsSection projects={filteredData?.projects} />
            <VolunteerSection volunteer={resumeData?.volunteer} />
            <InterestsSection interests={resumeData?.interests} />
            <AwardsSection awards={resumeData?.awards} />
            <ReferencesSection references={resumeData?.references} />
          </div>
        </div>
      </div>
    </div>
  );
}

const PersonalInfoHeader = memo(({ personalInfo }: ResumeSectionProps) => {
  const { firstname, lastname, email, phone, socials, city, country, summary } =
    personalInfo || {};
  const { linkedin, github } = socials || {};

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold break-words">
          {firstname} {lastname}
        </h1>
        {(city || country) && (
          <p className="text-zinc-400 mt-1 break-words">
            {city}
            {city && country ? ", " : ""}
            {country}
          </p>
        )}
      </div>

      <div className="space-y-2 text-sm">
        {phone && (
          <p className="flex items-center gap-2 break-all">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span className="break-words">{phone}</span>
          </p>
        )}
        {email && (
          <p className="flex items-center gap-2 break-all">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="break-words">{email}</span>
          </p>
        )}
        {linkedin && (
          <p className="flex items-center gap-2 break-all">
            <Linkedin className="w-4 h-4 flex-shrink-0" />
            <span className="break-words">{linkedin}</span>
          </p>
        )}
        {github && (
          <p className="flex items-center gap-2 break-all">
            <Github className="w-4 h-4 flex-shrink-0" />
            <span className="break-words">{github}</span>
          </p>
        )}
      </div>

      {summary && (
        <div>
          <h2 className="text-xl font-semibold border-b border-zinc-600 pb-2 mb-2">
            Summary
          </h2>
          <p className="text-sm text-zinc-300 whitespace-pre-line break-words">{summary}</p>
        </div>
      )}
    </div>
  );
});

const EducationSection = memo(({ education }: ResumeSectionProps) => {
  if (!education?.length) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold border-b border-zinc-600 pb-2 mb-4">
        Education
      </h2>
      <div className="space-y-4">
        {education.map((edu, index) => (
          <div key={index} className="space-y-1">
            <p className="font-medium break-words">{edu.institution}</p>
            <p className="text-sm text-zinc-300 break-words">{edu.studyType}</p>
            <p className="text-sm text-zinc-300 break-words">{edu.area}</p>
            {edu.startDate && (
              <p className="text-sm text-zinc-400 break-words">
                {formatDate(edu.startDate, "MM/yyyy")} -{" "}
                {edu.endDate ? formatDate(edu.endDate, "MM/yyyy") : "Present"}
              </p>
            )}
            {edu.score && (
              <p className="text-sm text-zinc-400 break-words">Score: {edu.score}</p>
            )}
            {edu.courses && (
              <div
                className="text-sm text-zinc-300 break-words"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(edu.courses),
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

const WorkExperienceSection = memo(({ workExperiences }: ResumeSectionProps) => {
  if (!workExperiences?.length) return null;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-800 mb-4 break-words">
        Work Experience
      </h2>
      <div className="space-y-6">
        {workExperiences.map((exp, index) => (
          <div key={index} className="space-y-2">
            <div className="flex flex-col gap-1">
              <div className="w-full break-words">
                <h3 className="font-semibold text-zinc-800 break-words">{exp.name}</h3>
                <p className="text-zinc-600 break-words">{exp.position}</p>
              </div>
              {exp.startDate && (
                <p className="text-sm text-zinc-500 break-words">
                  {formatDate(exp.startDate, "MM/yyyy")} -{" "}
                  {exp.endDate ? formatDate(exp.endDate, "MM/yyyy") : "Present"}
                </p>
              )}
            </div>
            {(exp.city || exp.country) && (
              <p className="text-sm text-zinc-600 break-words">
                {exp.city}
                {exp.city && exp.country ? ", " : ""}
                {exp.country}
              </p>
            )}
            {exp.description && (
              <div
                className="text-sm text-zinc-600 break-words"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(exp.description),
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

const ProjectsSection = memo(({ projects }: ResumeSectionProps) => {
  if (!projects?.length) return null;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-800 mb-4 break-words">Projects</h2>
      <div className="space-y-4">
        {projects.map((project, index) => (
          <div key={index} className="space-y-2">
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-zinc-800 break-words w-full">{project.title}</h3>
              {project.startDate && (
                <p className="text-sm text-zinc-500 break-words">
                  {formatDate(project.startDate, "MM/yyyy")} -{" "}
                  {project.endDate
                    ? formatDate(project.endDate, "MM/yyyy")
                    : "Present"}
                </p>
              )}
            </div>
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all inline-block max-w-full"
              >
                {project.link}
              </a>
            )}
            {project.description && (
              <div
                className="text-sm text-zinc-600 break-words"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(project.description),
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

const GenericSection = memo(({ title, data, color }: GenericSectionProps) => {
  if (!data?.description) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold border-b border-zinc-600 pb-2 mb-2">
        {title}
      </h2>
      <div
        className={cn("text-sm break-words", color || "text-zinc-300")}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(data.description),
        }}
      />
    </div>
  );
});

const SkillsSection = memo(({ skills }: ResumeSectionProps) => {
  return <GenericSection title="Skills" data={skills} color="text-zinc-300" />;
});

const LanguagesSection = memo(({ languages }: ResumeSectionProps) => {
  return <GenericSection title="Languages" data={languages} color="text-zinc-300" />;
});

const VolunteerSection = memo(({ volunteer }: ResumeSectionProps) => {
  return <GenericSection title="Volunteer Experience" data={volunteer} color="text-zinc-600" />;
});

const InterestsSection = memo(({ interests }: ResumeSectionProps) => {
  return <GenericSection title="Interests" data={interests} color="text-zinc-600" />;
});

const AwardsSection = memo(({ awards }: ResumeSectionProps) => {
  return <GenericSection title="Awards" data={awards} color="text-zinc-600" />;
});

const ReferencesSection = memo(({ references }: ResumeSectionProps) => {
  return <GenericSection title="References" data={references} color="text-zinc-600" />;
}); 