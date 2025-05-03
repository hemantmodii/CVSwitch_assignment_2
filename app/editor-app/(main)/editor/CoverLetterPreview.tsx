import useDimensions from "@/hooks/useDimensions";
import { cn } from "@/lib/utils";
import { memo, useRef } from "react";
import DOMPurify from "dompurify";
import { useCoverLetter } from "./forms/CoverLetterProvider";

interface CoverLetterPreviewProps {
  className?: string;
  contentRef?: React.Ref<HTMLDivElement>;
}

export default function CoverLetterPreview({ className, contentRef }: CoverLetterPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useDimensions(containerRef as React.RefObject<HTMLElement>);
  const { coverLetterData } = useCoverLetter();
  console.log(coverLetterData);
  // 794 is the width of the resume previewer
  // 210/297 is the aspect ratio of an A4 paper

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
        style={{ zoom: (1 / 794) * width }}
        ref={contentRef}
        id="resumePreviewContent"
      >
        <CoverLetterSection  data={coverLetterData?.description} />
      </div>
    </div>
  );
}

// eslint-disable-next-line react/display-name
const CoverLetterSection = memo(({ data }: { data: string }) => {
  if (!data || data === "<p></p>") return null;
  const sanitizedHTML = DOMPurify.sanitize(data);

  return (
    <div className="w-full">
      <p className="text-lg font-semibold break-words">Cover Letter</p>
      <hr className="border-black border-1 mb-2" />
      
      {data && (
        <div
          className="mt-2 text-sm break-words"
          dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
        />
      )}
    </div>
  );
});
