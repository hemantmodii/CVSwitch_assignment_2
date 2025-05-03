"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, ChevronRight, Settings } from "lucide-react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm, useWatch } from "react-hook-form";
import { useResume } from "./ResumeProvider";
import RichTextEditor from "@/components/RichTextEditor";
import { Skills, skillsSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { debounce } from "lodash";
import { extractText } from "@/lib/extractText";

export default function SkillsForm() {
  const { resumeData, setResumeData } = useResume();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<Skills>({
    resolver: zodResolver(skillsSchema),
    mode: "onChange",
    defaultValues: {
      skills: resumeData.skills,
    },
  });

  const updateSkills = debounce((description) => {
    const description_text = extractText(description);
    setResumeData((prev) => ({
      ...prev,
      skills: { description, description_text },
    }));
  }, 300);

  const watchedDescription = useWatch({
    control: form.control,
    name: "skills.description",
  });

  useEffect(() => {
    updateSkills(watchedDescription);
    return () => updateSkills.cancel();
  }, [watchedDescription]);

  return (
    <Card className="max-w-2xl mx-auto mt-10 shadow-md dark:bg-accent">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> {/* Skills Icon */}
            <span className="text-xl">Skills</span>
          </div>
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </CardTitle>
        <CardDescription>
          Highlight your key technical and soft skills.
        </CardDescription>
      </CardHeader>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[1000px] opacity-100 py-4" : "max-h-0 opacity-0"
        }`}
      >
        <CardContent>
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="skills.description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={(json) =>
                          form.setValue("skills.description", json)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </div>
    </Card>
  );
}
