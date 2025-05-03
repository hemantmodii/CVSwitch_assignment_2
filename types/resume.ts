export interface Resume {
  id: string;
  name: string;
  lastModified: string;
  url?: string;
  data?: string;
  cloudPath?: string;
  jsonUrl?: string | null;
  parsingStatus?: "parsing" | "completed" | "failed";
} 