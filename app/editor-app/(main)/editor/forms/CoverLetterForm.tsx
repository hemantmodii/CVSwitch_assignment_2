"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Mail } from "lucide-react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import RichTextEditor from "@/components/RichTextEditor";
import { CoverLetter, coverLetterSchema } from "@/lib/validation";
import { debounce } from "lodash";
import { extractText } from "@/lib/extractText";
import { useCoverLetter } from "./CoverLetterProvider";
import { useState } from "react";

export default function CoverLetterForm() {
  const { coverLetterData, setCoverLetterData } = useCoverLetter();
  const [isOpen, setIsOpen] = useState(true);

  const form = useForm<CoverLetter>({
    resolver: zodResolver(coverLetterSchema),
    mode: "onChange",
    defaultValues: {
      coverLetter: {
        description: coverLetterData.description || "",
        description_text: coverLetterData.description_text || "",
      },
    },
  });

  const updateContent = debounce((description: string) => {
    const description_text = extractText(description);
    setCoverLetterData({
      description,
      description_text,
    });
  }, 300);

  const watchedDescription = useWatch({
    control: form.control,
    name: "coverLetter.description",
  });

  useEffect(() => {
    if (watchedDescription) {
      updateContent(watchedDescription);
    }
    return () => updateContent.cancel();
  }, [watchedDescription]);

  return (
    <Card className="max-w-2xl mx-auto mt-10 shadow-md dark:bg-accent">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" /> {/* Cover Letter Icon */}
            <span className="text-xl">Cover Letter</span>
          </div>
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </CardTitle>
        <CardDescription>
          Craft a personalized cover letter to enhance your job applications.
        </CardDescription>
      </CardHeader>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[1000px] opacity-100 py-4 border-slate-50" : "max-h-0 opacity-0"
        }`}
      >
        <CardContent>
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="coverLetter.description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={(json) => {
                          form.setValue("coverLetter.description", json);
                        }}
                        height="400px"
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
