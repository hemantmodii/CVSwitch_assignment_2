"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Projects, projectsSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight, FolderOpen, Trash2 } from "lucide-react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import {
  useFieldArray,
  useForm,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { DatePicker } from "@/components/ui/Datepicker";
import { useResume } from "./ResumeProvider";
import RichTextEditor from "@/components/RichTextEditor";
import { debounce } from "lodash";
import { extractText } from "@/lib/extractText";

export default function ProjectsForm() {
  const { resumeData, setResumeData } = useResume();
  const [isOpen, setIsOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const form = useForm<Projects>({
    resolver: zodResolver(projectsSchema),
    mode: "onChange",
    defaultValues: {
      projects: resumeData.projects,
    },
  });

  const resumeDataRef = useRef(resumeData);

  useEffect(() => {
    resumeDataRef.current = resumeData;
  }, [resumeData]);

  useEffect(() => {
    const updateResumeData = debounce((values) => {
      resumeDataRef.current = {
        ...resumeDataRef.current,
        projects:
          values.projects?.filter((proj: Projects) => proj !== undefined) || [],
      };

      setResumeData(resumeDataRef.current);
    }, 300);

    const subscription = form.watch(updateResumeData);

    return () => {
      subscription.unsubscribe();
      updateResumeData.cancel();
    };
  }, [form, setResumeData]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  return (
    <Card className="max-w-2xl mx-auto mt-10 shadow-md dark:bg-accent">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" /> {/* Projects Icon */}
            <span className="text-xl">Project</span>
          </div>
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </CardTitle>
        <CardDescription>
          Showcase your notable projects, contributions, and achievements.
        </CardDescription>
      </CardHeader>

      <div
        className={`transition-all duration-700 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[2000px] opacity-100 py-4" : "max-h-0 opacity-0"
        }`}
      >
        <CardContent>
          <Form {...form}>
            <form className="space-y-4">
              {fields.map((field, index) => (
                <ProjectItem
                  id={field.id}
                  key={field.id}
                  index={index}
                  form={form}
                  remove={remove}
                  openIndex={openIndex}
                  setOpenIndex={setOpenIndex}
                />
              ))}

              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={() =>
                    append({
                      title: "",
                      startDate: undefined,
                      endDate: null,
                      description: "",
                      link: "",
                    })
                  }
                >
                  + Add Project
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </div>
    </Card>
  );
}

interface ProjectItemProps {
  id: string;
  form: UseFormReturn<Projects>;
  index: number;
  remove: (index: number) => void;
  openIndex: number | null;
  setOpenIndex: (index: number | null) => void;
}

function ProjectItem({
  id,
  form,
  index,
  remove,
  openIndex,
  setOpenIndex,
}: ProjectItemProps) {
  const isExpanded = openIndex === index;

  const description = useWatch({
    control: form.control,
    name: `projects.${index}.description`,
  });

  //useDeferredValue is used to wait till all the description are loaded before extracting text it is done when React is idle
  const deferreDescription = useDeferredValue(description);

  useEffect(() => {
    const extractedText = extractText(deferreDescription || "");
    form.setValue(`projects.${index}.description_text`, extractedText, {
      shouldValidate: false,
      shouldDirty: true,
    });
  }, [deferreDescription, form, index]);

  return (
    <Card className="border max-w-2xl mx-auto shadow-md relative">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest("button")) {
            setOpenIndex(isExpanded ? null : index);
          }
        }}
      >
        <div className="flex justify-between items-center">
          <span className="font-semibold">Project {index + 1}</span>
          <div className="flex items-center space-x-2">
            {isExpanded ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                remove(index);
              }}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <div
        className={`transition-all duration-700 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[2000px] opacity-100 py-4" : "max-h-0 opacity-0"
        }`}
      >
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name={`projects.${index}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} autoFocus />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name={`projects.${index}.startDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`projects.${index}.endDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={`projects.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value || ""}
                    onChange={(json) =>
                      form.setValue(`projects.${index}.description`, json)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`projects.${index}.link`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link</FormLabel>
                <FormControl>
                  <Input {...field} autoFocus />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <input
            type="hidden"
            {...form.register(`projects.${index}.description_text`)}
          />
        </CardContent>
      </div>
    </Card>
  );
}
