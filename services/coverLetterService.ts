import { API_CONFIG } from '@/config/api';

export interface CoverLetter {
  id: string;
  name: string;
  lastModified: string;
  url?: string;
  cloudPath?: string;
}

interface UserDataResponse {
  data: {
    uploaded_cover_letter?: Array<{
      cloud_path: string;
      public_url: string;
    }>;
  };
  message: string;
  mode: string;
  status: number;
}

export const coverLetterService = {
  async getUserCoverLetters(userId: string): Promise<CoverLetter[]> {
    try {
      console.log('Fetching cover letters for user:', userId);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PDF_TO_PARSED_JSON}?user_id=${userId}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cover letters: ${response.status}`);
      }
      
      const data = await response.json() as UserDataResponse;
      console.log('API Response:', data); // Debug log
      
      // Check if we have cover letters in the response
      if (data.data && Array.isArray(data.data.uploaded_cover_letter)) {
        return data.data.uploaded_cover_letter.map((coverLetter, index) => {
          const cloudPath = coverLetter.cloud_path || '';
          const fileName = cloudPath.split('/').pop() || `Cover Letter ${index + 1}`;
          
          return {
            id: index.toString(),
            name: fileName,
            lastModified: new Date().toISOString().split('T')[0],
            url: coverLetter.public_url,
            cloudPath: coverLetter.cloud_path,
          };
        });
      }
      
      console.log('No cover letters found in response');
      return [];
    } catch (error) {
      console.error('Error in getUserCoverLetters:', error);
      throw error;
    }
  },
  
  async uploadCoverLetter(userId: string, file: File): Promise<CoverLetter> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD_COVER_LETTER}?user_id=${userId}`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to upload cover letter: ${errorData.message || response.status}`);
      }
      
      const result = await response.json();
      const newCoverLetter = {
        id: Date.now().toString(),
        name: result.data.file_name,
        lastModified: new Date().toISOString().split('T')[0],
        url: result.data.public_url,
        cloudPath: result.data.cloud_file_path,
      };
      
      return newCoverLetter;
    } catch (error) {
      console.error('Error in uploadCoverLetter:', error);
      throw error;
    }
  },
}; 