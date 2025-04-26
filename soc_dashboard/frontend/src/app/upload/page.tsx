"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ScanData } from "@/components/dashboard/ScanCard";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<ScanData | null>(null);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile?: File) => {
    setError("");
    if (!selectedFile) return;

    // Check if file is a PCAP file
    if (!selectedFile.name.toLowerCase().endsWith('.pcap') && 
        !selectedFile.name.toLowerCase().endsWith('.pcapng')) {
      setError("Only PCAP/PCAPNG files are allowed.");
      return;
    }

    // Check file size (limit to 100MB for example)
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError("File size exceeds 100MB limit.");
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsUploading(true);
    setError("");
    
    // Create FormData
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      // Simulate progress for demo purposes
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          setUploadProgress(Math.min(progress, 95));
          if (progress >= 100) clearInterval(interval);
        }, 300);
        return interval;
      };
      
      const progressInterval = simulateProgress();
      
      // In a real implementation, you would post to your API
      // const response = await fetch("http://localhost:8000/api/upload", {
      //   method: "POST",
      //   body: formData,
      // });
      
      // For demo, simulate a successful upload after 6 seconds
      await new Promise(resolve => setTimeout(resolve, 6000));
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Simulate response data
      const result: ScanData = {
        id: `scan-${Date.now()}`,
        fileName: file.name,
        timestamp: new Date().toLocaleString(),
        connections: Math.floor(Math.random() * 10000) + 100,
        dnsQueries: Math.floor(Math.random() * 500),
        alerts: Math.floor(Math.random() * 20),
        status: "completed"
      };
      
      setUploadResult(result);
      
      // const result = await response.json();
      // setUploadResult(result);
    } catch (err: any) {
      setError("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadResult(null);
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Upload PCAP File
        </h1>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg px-6 py-6">
          {!uploadResult ? (
            <>
              {/* File Upload Area */}
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer mb-4
                  ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
                  ${error ? 'border-red-300 dark:border-red-700' : ''}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pcap,.pcapng"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                <div className="flex flex-col items-center justify-center">
                  <svg 
                    className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  {file ? (
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 font-medium">{file.name}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        Drag & drop your PCAP file here
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        or click to browse
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                        Supports .pcap and .pcapng files up to 100MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}

              {/* Upload button */}
              <div className="flex justify-end">
                {file && (
                  <button
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 mr-2"
                    onClick={resetUpload}
                  >
                    Cancel
                  </button>
                )}
                <button
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${!file || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Start Analysis'}
                </button>
              </div>
              
              {/* Upload progress */}
              {isUploading && (
                <div className="mt-6">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Uploading & Analyzing
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-150 ease-in-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Upload result */}
              <div className="bg-green-100 dark:bg-green-900/20 px-6 py-6 rounded-lg mb-6">
                <div className="flex items-center mb-4">
                  <svg
                    className="w-8 h-8 text-green-500 dark:text-green-400 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Analysis Complete
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Filename</p>
                    <p className="text-gray-900 dark:text-white font-medium">{uploadResult.fileName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Scan ID</p>
                    <p className="text-gray-900 dark:text-white font-medium">{uploadResult.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Timestamp</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {uploadResult.timestamp}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <p className="text-green-600 dark:text-green-400 font-medium uppercase">
                      {uploadResult.status}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{uploadResult.connections.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Connections</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{uploadResult.dnsQueries.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">DNS Queries</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{uploadResult.alerts.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Alerts</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={resetUpload}
                >
                  Upload Another File
                </button>
                <Link
                  href={`/scans/${uploadResult.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  View Scan Details
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}