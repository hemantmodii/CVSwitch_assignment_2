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
import { workExperienceSchema, WorkExperience } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import {
  Resolver,
  useFieldArray,
  useForm,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import RichTextEditor from "@/components/RichTextEditor";
import { DatePicker } from "@/components/ui/Datepicker";
import { Checkbox } from "@/components/ui/checkbox";
import { useResume } from "./ResumeProvider";
import { debounce } from "lodash";
import { extractText } from "@/lib/extractText";

type WorkExperienceFormValues = {
  workExperiences: WorkExperience["workExperiences"];
};

export default function WorkExperienceForm() {
  const { resumeData, setResumeData } = useResume();
  const [isOpen, setIsOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const form = useForm<WorkExperienceFormValues>({
    resolver: zodResolver(
      workExperienceSchema
    ) as Resolver<WorkExperienceFormValues>,
    mode: "onChange",
    defaultValues: {
      workExperiences: resumeData.workExperiences,
    },
  });

  const resumeDataRef = useRef(resumeData);

  useEffect(() => {
    resumeDataRef.current = resumeData;
  }, [resumeData]);

  useEffect(() => {
    const updateResumeData = debounce((values: WorkExperienceFormValues) => {
      resumeDataRef.current = {
        ...resumeDataRef.current,
        workExperiences: values.workExperiences || [],
      };

      setResumeData(resumeDataRef.current);
    }, 300);

    const subscription = form.watch((data) =>
      updateResumeData(data as WorkExperienceFormValues)
    );

    return () => {
      subscription.unsubscribe();
      updateResumeData.cancel();
    };
  }, [form, setResumeData]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "workExperiences",
  });

  return (
    <Card className="max-w-2xl mx-auto mt-10 shadow-md dark:bg-accent">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" /> {/* Work Experience Icon */}
            <span className="text-xl">Work Experience</span>
          </div>
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </CardTitle>
        <CardDescription>
          Add your previous jobs, roles, responsibilities, and achievements.
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
                <WorkExperienceItem
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
                      name: "",
                      city: "",
                      country: "",
                      position: "",
                      startDate: undefined,
                      endDate: null,
                      description: "",
                    })
                  }
                >
                  + Add Work Experience
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </div>
    </Card>
  );
}

interface WorkExperienceItemProps {
  id: string;
  form: UseFormReturn<WorkExperienceFormValues>;
  index: number;
  remove: (index: number) => void;
  openIndex: number | null;
  setOpenIndex: (index: number | null) => void;
}

function WorkExperienceItem({
  id,
  form,
  index,
  remove,
  openIndex,
  setOpenIndex,
}: WorkExperienceItemProps) {
  const isExpanded = openIndex === index;
  const endDate = form.watch(`workExperiences.${index}.endDate`);
  const currentlyWorking = endDate === undefined;

  const description = useWatch({
    control: form.control,
    name: `workExperiences.${index}.description`,
  });

  //useDeferredValue is used to wait till all the description are loaded before extracting text it is done when React is idle
  const deferreDescription = useDeferredValue(description);

  useEffect(() => {
    if (deferreDescription) {
      const extractedText = extractText(deferreDescription);
      form.setValue(
        `workExperiences.${index}.description_text`,
        extractedText,
        {
          shouldValidate: false,
          shouldDirty: true,
        }
      );
    }
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
          <span className="font-semibold">Work Experience {index + 1}</span>
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
            name={`workExperiences.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`workExperiences.${index}.position`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
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
              name={`workExperiences.${index}.city`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`workExperiences.${index}.country`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`workExperiences.${index}.startDate`}
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
              name={`workExperiences.${index}.endDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={field.onChange}
                      disabled={currentlyWorking}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={currentlyWorking}
              onCheckedChange={(checked) => {
                form.setValue(
                  `workExperiences.${index}.endDate`,
                  checked ? undefined : null
                );
              }}
            />
            <label className="text-sm font-medium">I currently work here</label>
          </div>

          <FormField
            control={form.control}
            name={`workExperiences.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value || ""}
                    onChange={(json) => {
                      form.setValue(
                        `workExperiences.${index}.description`,
                        json
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <input
            type="hidden"
            {...form.register(`workExperiences.${index}.description_text`)}
          />
        </CardContent>
      </div>
    </Card>
  );
}
