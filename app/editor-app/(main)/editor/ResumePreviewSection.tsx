import ResumePreview from "./ResumePreview";
import TwoColumnResumePreview from "./TwoColumnResumePreview";
import TwoColumnColoredResumePreview from "./TwoColumnColoredResumePreview";
import TemplateDrawer from "./TemplateDrawer";
import SingleColumnColored from "./SingleColumnColored";

type TemplateType = "single" | "double" | "colored" | "singleColored";

interface ResumePreviewSectionProps {
  template: TemplateType;
  setTemplate: (template: TemplateType) => void;
  contentRef: React.RefObject<HTMLDivElement>;
}

export default function ResumePreviewSection({ template, setTemplate, contentRef }: ResumePreviewSectionProps) {
  return (
    <div className="w-1/2">
      <div className="flex w-full justify-center bg-secondary overflow-y-auto h-[100vh] p-3 relative">
        <TemplateDrawer currentTemplate={template} onTemplateChange={setTemplate} />
        
        {
          (() => {
            switch (template) {
              case "single":
                return <ResumePreview  className="max-w-2xl shadow-md"  contentRef = {contentRef}/>;
              case "double":
                return <TwoColumnResumePreview  className="max-w-2xl shadow-md" contentRef = {contentRef} />;
              case "colored":
                return <TwoColumnColoredResumePreview  className="max-w-2xl shadow-md"  contentRef = {contentRef}/>;
              case "singleColored":
                return <SingleColumnColored className="max-w-2xl shadow-md" contentRef = {contentRef} />;
              default:
                return null;
            }
          })()
        }
      </div>
    </div>
  );
}
