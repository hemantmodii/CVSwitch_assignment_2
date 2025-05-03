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
import { Education, educationSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight, GraduationCap, Trash2 } from "lucide-react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import {
  Resolver,
  useFieldArray,
  useForm,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { DatePicker } from "@/components/ui/Datepicker";
import { Checkbox } from "@/components/ui/checkbox";
import { useResume } from "./ResumeProvider";
import RichTextEditor from "@/components/RichTextEditor";
import { debounce } from "lodash";
import { extractText } from "@/lib/extractText";

type EducationFormValues = {
  education: Education["education"];
};

export default function EducationForm() {
  const { resumeData, setResumeData } = useResume();
  const [isOpen, setIsOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const form = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema) as Resolver<EducationFormValues>,
    mode: "onChange",
    defaultValues: {
      education: resumeData.education || [],
    },
  });

  const resumeDataRef = useRef(resumeData);

  useEffect(() => {
    resumeDataRef.current = resumeData;
  }, [resumeData]);

  useEffect(() => {
    const updateResumeData = debounce((values: EducationFormValues) => {
      resumeDataRef.current = {
        ...resumeDataRef.current,
        education: values.education || [],
      };

      setResumeData(resumeDataRef.current);
    }, 300);

    const subscription = form.watch((data) =>
      updateResumeData(data as EducationFormValues)
    );

    return () => {
      subscription.unsubscribe();
      updateResumeData.cancel();
    };
  }, [form, setResumeData]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "education",
  });

  return (
    <Card className="max-w-2xl mx-auto mt-10 shadow-md dark:bg-accent">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" /> {/* Education Icon */}
            <span className="text-xl">Education</span>
          </div>
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </CardTitle>
        <CardDescription>
          Add your academic background, degrees, and certifications.
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
                <EducationItem
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
                      institution: "",
                      area: "",
                      studyType: "",
                      startDate: undefined,
                      endDate: null,
                      score: "",
                      courses: "",
                    })
                  }
                >
                  + Add Education
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </div>
    </Card>
  );
}

interface EducationItemProps {
  id: string;
  form: UseFormReturn<EducationFormValues>;
  index: number;
  remove: (index: number) => void;
  openIndex: number | null;
  setOpenIndex: (index: number | null) => void;
}

function EducationItem({
  form,
  index,
  remove,
  openIndex,
  setOpenIndex,
}: EducationItemProps) {
  const isExpanded = openIndex === index;
  const endDate = useWatch({
    control: form.control,
    name: `education.${index}.endDate`,
  });
  const currentlyStudying = endDate === undefined;

  const courses = useWatch({
    control: form.control,
    name: `education.${index}.courses`,
  });

  //useDeferredValue is used to wait till all the courses are loaded before extracting text it is done when React is idle
  const deferredCourses = useDeferredValue(courses);

  useEffect(() => {
    if (deferredCourses) {
      const extractedText = extractText(deferredCourses);
      form.setValue(`education.${index}.description_text`, extractedText, {
        shouldValidate: false,
        shouldDirty: true,
      });
    }
  }, [deferredCourses, form, index]);

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
          <span className="font-semibold">Education {index + 1}</span>
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
            name={`education.${index}.institution`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Institution</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`education.${index}.area`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Field of Study</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`education.${index}.studyType`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Study Type</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`education.${index}.startDate`}
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
              name={`education.${index}.endDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={field.onChange}
                      disabled={currentlyStudying}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={currentlyStudying}
              onCheckedChange={(checked) => {
                form.setValue(
                  `education.${index}.endDate`,
                  checked ? undefined : null
                );
              }}
            />
            <label className="text-sm font-medium">
              I currently study here
            </label>
          </div>

          <FormField
            control={form.control}
            name={`education.${index}.courses`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Courses</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value || ""}
                    onChange={(json) =>
                      form.setValue(`education.${index}.courses`, json)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/*shadow field to store text value of the rich text editor does not show in UI */}
          <input
            type="hidden"
            {...form.register(`education.${index}.description_text`)}
          />
        </CardContent>
      </div>
    </Card>
  );
}
