"use client";

import { Sidebar } from "@/components/Sidebar";
import { HeroSection } from "@/components/HeroSection";
import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState(auth.getCurrentUser());
  const [hasUploadedResume, setHasUploadedResume] = useState(false);
  const [pastResumes, setPastResumes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/');
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleUploadResume = (file: File) => {
    console.log('Resume uploaded:', file.name);
    setPastResumes((prev) => [...prev, file.name]);
    setHasUploadedResume(true);
  };

  const handleOfferingSelect = async (selectedOption: string) => {
    if (user) {
      try {
        // Implement your offering selection logic here
        console.log('Selected offering:', selectedOption);
      } catch (error) {
        console.error('Error saving user preference:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Welcome back, <span className="text-blue-600">{user?.username || 'User'}</span>! 👋
          </h1>
        </div>

        <HeroSection 
          user={user} 
          hasUploadedResume={hasUploadedResume} 
          onUploadResume={handleUploadResume}
          pastResumes={pastResumes}
          onOfferingSelect={handleOfferingSelect}
        />
      </main>
    </div>
  );
} 