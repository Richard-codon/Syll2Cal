'use client';

import { useState, useRef } from 'react';
import type { UploadResponse } from '../types';

//component props interface for the file upload component
interface FileUploadProps {
  onUploadSuccess: (data: UploadResponse) => void;
  onUploadError: (error: string) => void;
}


export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, onUploadError }) => {
    //component state management
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
 //validate file type(file should be PDF only)
    if (file.type !== 'application/pdf') {
      onUploadError('Please select a PDF file. Only PDF syllabi are supported.');
      return;
    }

    //validate file size(limit to 10MB)
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      onUploadError('File size too large. Please select a PDF smaller than 10MB.');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status: ${res.status}`);
      }
//parse response and handle success or failure
      const data: UploadResponse = await res.json();

      if (data.success) {
        onUploadSuccess(data);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      onUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  //handle file drop events
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
          ${dragActive 
            ? 'border-blue-400 bg-blue-50 scale-105' 
            : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
          }
          ${isUploading ? 'pointer-events-none opacity-75' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">Processing your syllabus...</p>
              <p className="text-sm text-gray-500">Extracting dates and events from PDF</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-blue-100 rounded-full">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">Upload Your Syllabus</h3>
              <p className="text-gray-600">
                Drag and drop your PDF syllabus here, or click to browse files
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Choose PDF File
            </button>

            <div className="text-xs text-gray-400 space-y-1">
              <p>• Supports PDF files up to 10MB</p>
              <p>• Works best with text-based syllabi (not scanned images)</p>
              <p>• Automatically detects assignments, exams, and important dates</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};