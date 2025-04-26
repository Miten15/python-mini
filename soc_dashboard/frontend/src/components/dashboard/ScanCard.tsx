"use client";

import Link from "next/link";

export interface ScanData {
  id?: string;
  fileName: string;
  timestamp: string;
  connections: number;
  dnsQueries: number;
  alerts: number;
  status?: string;
}

interface ScanCardProps {
  scan: ScanData;
  index?: number;
}

export default function ScanCard({ scan, index = 0 }: ScanCardProps) {
  const {
    id = "unknown", 
    fileName, 
    timestamp, 
    connections, 
    dnsQueries, 
    alerts,
    status = "completed"
  } = scan;

  const getFileTypeIcon = (fileName: string) => {
    if (fileName.toLowerCase().endsWith('.pcap') || fileName.toLowerCase().endsWith('.pcapng')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  // Format status for display
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-800">
            <span className="w-1.5 h-1.5 mr-1.5 bg-green-500 rounded-full"></span>
            Completed
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 mr-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            Processing
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-800">
            <span className="w-1.5 h-1.5 mr-1.5 bg-red-500 rounded-full"></span>
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
            <span className="w-1.5 h-1.5 mr-1.5 bg-gray-500 rounded-full"></span>
            {status}
          </span>
        );
    }
  };

  // Add animation delay based on index for staggered entrance
  const getAnimationDelay = () => {
    const delays = ['delay-0', 'delay-100', 'delay-200', 'delay-300', 'delay-400', 'delay-500'];
    const delayIndex = index % delays.length;
    return delays[delayIndex];
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all p-5 hover-lift animate-fade-in ${getAnimationDelay()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getFileTypeIcon(fileName)}
        </div>
        <div className="ml-4 flex-grow">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{fileName}</h3>
            {getStatusBadge(status)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{timestamp}</p>
          
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{connections.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Connections</p>
            </div>
            <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{dnsQueries.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">DNS Queries</p>
            </div>
            <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <p className={`text-sm font-medium ${alerts > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {alerts.toLocaleString()}
                {alerts > 0 && (
                  <span className="ml-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Alerts</p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Link 
              href={`/scans/${id}`} 
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm hover:shadow"
            >
              View Details
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}