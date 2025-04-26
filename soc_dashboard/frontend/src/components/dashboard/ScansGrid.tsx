"use client";

import Link from "next/link";
import ScanCard, { ScanData } from "./ScanCard";

interface ScansGridProps {
  scans: ScanData[];
  title?: string;
  showViewAll?: boolean;
  columns?: number;
}

export default function ScansGrid({ 
  scans, 
  title = "Recent Scans", 
  showViewAll = true,
  columns = 3
}: ScansGridProps) {
  if (!scans || scans.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No scans found</p>
          <Link 
            href="/upload" 
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Upload PCAP
          </Link>
        </div>
      </div>
    );
  }

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const columnClass = columnClasses[columns as keyof typeof columnClasses] || columnClasses[3];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        {showViewAll && (
          <Link href="/scans" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
            View All
          </Link>
        )}
      </div>
      <div className={`grid ${columnClass} gap-4`}>
        {scans.map((scan, index) => (
          <ScanCard key={scan.id || index} scan={scan} />
        ))}
      </div>
    </div>
  );
}