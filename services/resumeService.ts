import type { Resume } from '@/types/resume';
import { API_CONFIG } from '@/config/api';

interface UserDataResponse {
  data: {
    uploaded_resume: Array<{
      resume_url: unknown;
      file_name: unknown;
      id: unknown;
      cloud_path: string;
      public_url: string;
      resume_id?: string;
    }>;
    parsed_resume_json: Array<{
      cloud_path: string;
      public_url: string;
    }>;
  };
  message: string;
  mode: string;
  status: number;
}

interface ResumeAnalysis {
  Areas_of_Improvment: string[];
  strengths: string[];
}

export const resumeService = {
  async getUserResumes(userId: string): Promise<Resume[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FETCH_USER_DATA}?user_id=${userId}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch resumes: ${response.status}`);
      }
      
      const data = await response.json() as UserDataResponse;
      
      if (data.data && Array.isArray(data.data.uploaded_resume)) {
        // Create a map of parsed JSON files by their base name (without extension)
        const parsedJsonMap = new Map();
        if (data.data.parsed_resume_json) {
          data.data.parsed_resume_json.forEach(json => {
            const cloudPath = json.cloud_path || '';
            // Extract the base name without extension (e.g., "1743795375" from "1743795375.json")
            const baseName = cloudPath.split('/').pop()?.split('.')[0] || '';
            parsedJsonMap.set(baseName, json.public_url);
          });
        }
        
        return data.data.uploaded_resume.map((resume) => {
          // Extract filename from cloud_path
          const cloudPath = resume.cloud_path || '';
          
          
          // Check if this resume has a corresponding parsed JSON
          // Extract timestamp from filename (e.g., "1743795375" from "1743795375.008884_Aditya_Yadav_SG-2.pdf")
          const timestamp = cloudPath.split('/').pop()?.split('.')[0] || '';
          const jsonUrl = parsedJsonMap.get(timestamp) || null;
          
          return {
            id: resume.id as string,
            name: resume.file_name as string,
            lastModified: new Date().toISOString().split('T')[0],
            url: resume.resume_url as string,
            cloudPath: resume.cloud_path,
            jsonUrl: jsonUrl,
            // If we have a jsonUrl, the resume has been parsed
            parsingStatus: jsonUrl ? "completed" : undefined
          };
        });
      }
      
      return [];
    } catch (error) {
      console.error('Error in getUserResumes:', error);
      throw error;
    }
  },
  
  async uploadResume(userId: string, file: File): Promise<Resume> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD_RESUME}?user_id=${userId}`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to upload resume: ${response.status}`);
      }
      
      const result = await response.json();
      // const newResume = {
      //   id: Date.now().toString(),
      //   name: result.data.file_name,
      //   lastModified: new Date().toISOString().split('T')[0],
      //   url: result.data.public_url,
      //   cloudPath: result.data.cloud_file_path,
      //   parsingStatus: "parsing" as const
      // };
      
      // Call PDF to parsed JSON with a 2-second delay
      // setTimeout(async () => {
      //   await pdfParserService.convertPdfToJson(userId, newResume.cloudPath || '');
      // }, 2000);
      
      return result;
    } catch (error) {
      console.error('Error in uploadResume:', error);
      throw error;
    }
  },

  async getLinkedInSuggestions(userId: string, resumeId: string): Promise<unknown> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LINKEDIN_SUGGESTIONS}?user_id=${userId}&resume_id=${resumeId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch LinkedIn suggestions: ${response.status}`);
      }

      const data = await response.json();
      return data; // Return the LinkedIn suggestions data
    } catch (error) {
      console.error('Error in getLinkedInSuggestions:', error);
      throw error;
    }
  },

  async analyzeResume(userId: string, jsonUrl: string): Promise<ResumeAnalysis> {
    try {
      const urlParts = jsonUrl.split('cvswitch-54227.appspot.com/');
      const fullPath = urlParts[1];
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE_RESUME}?user_id=${userId}&cloud_file_path=${encodeURIComponent(fullPath)}`
      );
      
      const analyzeResult = await response.json();
      console.log('Analyze API Response:', analyzeResult);

      if (!analyzeResult.data || !analyzeResult.data.cloud_file_path) {
        throw new Error('No analysis file path received');
      }

      // Second API call to fetch the actual analysis JSON
      const fetchAnalysisResponse = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FETCH_ANALYZED_JSON}?user_id=${userId}&cloud_file_path=${encodeURIComponent(analyzeResult.data.cloud_file_path)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const fetchResult = await fetchAnalysisResponse.json();
      console.log('Fetch Analysis API Response:', fetchResult);

      if (!fetchResult.data) {
        throw new Error('No analysis data received');
      }

      // Return the analysis data
      const analysisData = {
        Areas_of_Improvment: fetchResult.data.Areas_of_Improvment || [],
        strengths: fetchResult.data.strengths || []
      };
      console.log('Final Analysis Data:', analysisData);

      return analysisData;
    } catch (error) {
      console.error('Error in analyzeResume:', error);
      throw error;
    }
  },
};