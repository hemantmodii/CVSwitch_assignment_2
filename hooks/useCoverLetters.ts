import { useState, useEffect } from 'react';
import { coverLetterService, CoverLetter } from '@/services/coverLetterService';

export function useCoverLetters(userId: string | undefined) {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoverLetters = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching cover letters...');
      const fetchedCoverLetters = await coverLetterService.getUserCoverLetters(userId);
      console.log('Fetched cover letters:', fetchedCoverLetters);
      setCoverLetters(fetchedCoverLetters);
    } catch (error) {
      console.error('Error fetching cover letters:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch cover letters');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCoverLetters();
    }
  }, [userId]);

  const uploadCoverLetter = async (file: File) => {
    if (!userId) return;
    
    setUploadLoading(true);
    setError(null);
    try {
      const newCoverLetter = await coverLetterService.uploadCoverLetter(userId, file);
      setCoverLetters(prev => [...prev, newCoverLetter]);
      return newCoverLetter;
    } catch (error) {
      console.error('Error uploading cover letter:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload cover letter');
      throw error;
    } finally {
      setUploadLoading(false);
    }
  };

  return {
    coverLetters,
    isLoading,
    uploadCoverLetter,
    uploadLoading,
    error,
    refreshCoverLetters: fetchCoverLetters,
  };
} 