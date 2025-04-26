"use client";

import Link from "next/link";
import { useState } from "react";

export interface Alert {
  id?: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  type: string;
  sourceIp: string;
  destIp: string;
  time: string;
  details?: string;
}

interface AlertTableProps {
  alerts: Alert[];
  title?: string;
  showViewAll?: boolean;
}

export default function AlertTable({ 
  alerts, 
  title = "Recent Alerts", 
  showViewAll = true 
}: AlertTableProps) {
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  if (alerts.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-all">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4"
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
          <p className="text-gray-500 dark:text-gray-400 mb-2">No alerts found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Alerts will appear here when security threats are detected
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium ml-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
            {alerts.length}
          </span>
        </div>
        {showViewAll && (
          <Link href="/alerts" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center">
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
      <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-xl shadow-md">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Source IP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Destination IP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {alerts.map((alert, index) => (
              <AlertRow
                key={alert.id || index}
                severity={alert.severity}
                type={alert.type}
                sourceIp={alert.sourceIp}
                destIp={alert.destIp}
                time={alert.time}
                alertId={alert.id || `alert-${index}`}
                isSelected={selectedAlert === (alert.id || `alert-${index}`)}
                onClick={() => setSelectedAlert(alert.id || `alert-${index}`)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface AlertRowProps extends Omit<Alert, 'id' | 'details'> {
  alertId: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function AlertRow({ 
  severity, 
  type, 
  sourceIp, 
  destIp, 
  time,
  alertId,
  isSelected = false,
  onClick
}: AlertRowProps) {
  // Determine severity color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "severity-badge severity-critical";
      case "high":
        return "severity-badge severity-high";
      case "medium":
        return "severity-badge severity-medium";
      case "low":
        return "severity-badge severity-low";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Determine type icon
  const getTypeIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case "port_scan":
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case "sql_injection":
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
          </svg>
        );
      case "dns_tunneling":
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        );
    }
  };

  return (
    <tr 
      className={`hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
      onClick={onClick}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={getSeverityColor(severity)}>
          {severity}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
        <div className="flex items-center">
          {getTypeIcon(type)}
          {type}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
          {sourceIp}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
          {destIp}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {time}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <Link 
          href={`/alerts/${alertId}`} 
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium flex items-center"
        >
          Details
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
        </Link>
      </td>
    </tr>
  );
}