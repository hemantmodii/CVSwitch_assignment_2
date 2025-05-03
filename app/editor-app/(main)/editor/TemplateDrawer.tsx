import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { LayoutTemplate, LayoutGrid, Palette } from "lucide-react";
import { useState } from "react";

interface TemplateDrawerProps {
  currentTemplate: "single" | "double" | "colored" | "singleColored";
  onTemplateChange: (
    template: "single" | "double" | "colored" | "singleColored"
  ) => void;
}

export default function TemplateDrawer({
  currentTemplate,
  onTemplateChange,
}: TemplateDrawerProps) {
  const [open, setOpen] = useState(false);

  const handleTemplateChange = (
    template: "single" | "double" | "colored" | "singleColored"
  ) => {
    onTemplateChange(template);
    setOpen(false);
  };

  const getTemplateDetails = (type: string) => {
    switch (type) {
      case "single":
        return {
          icon: <LayoutTemplate className="h-5 w-5" />,
          title: "Single Column",
          description:
            "Classic single-column layout perfect for traditional resumes",
        };
      case "double":
        return {
          icon: <LayoutGrid className="h-5 w-5" />,
          title: "Double Column",
          description: "Modern two-column layout with better space utilization",
        };
      case "colored":
        return {
          icon: <Palette className="h-5 w-5" />,
          title: "Colored Two Column",
          description:
            "Modern design with colored sidebar and enhanced visual hierarchy",
        };
      case "singleColored":
        return {
          icon: <Palette className="h-5 w-5 text-purple-500" />,
          title: "Single Column Colored",
          description: "Single-column layout with a vibrant colored theme",
        };
      default:
        return {
          icon: <LayoutTemplate className="h-5 w-5" />,
          title: "Single Column",
          description:
            "Classic single-column layout perfect for traditional resumes",
        };
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed right-4 top-4 z-50 opacity-60 hover:opacity-100"
        >
          <LayoutTemplate className="h-4 w-4" />
        </Button>
      </DrawerTrigger>

      
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Choose Template</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {["single", "double", "colored", "singleColored"].map((type) => {
              const { icon, title, description } = getTemplateDetails(type);
              return (
                <div
                  key={type}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    currentTemplate === type
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() =>
                    handleTemplateChange(
                      type as TemplateDrawerProps["currentTemplate"]
                    )
                  }
                >
                  <div className={`flex items-center gap-2 mb-2 ${currentTemplate === type ? "text-white dark:text-black" : "text-gray-800 dark:text-white"}`}>
                    {icon}
                    <h3 className={`font-semibold`}>{title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
