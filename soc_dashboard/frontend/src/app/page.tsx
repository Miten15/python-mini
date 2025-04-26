"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import StatsOverview from "@/components/dashboard/StatsOverview";
import AlertTable, { Alert } from "@/components/dashboard/AlertTable";
import ScansGrid from "@/components/dashboard/ScansGrid";
import { ScanData } from "@/components/dashboard/ScanCard";

export default function Home() {
  const [loading, setLoading] = useState(true);

  // Simulating loading state for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Mock data for our dashboard - in a real app, this would come from an API
  const mockAlerts: Alert[] = [
    {
      severity: "High",
      type: "PORT_SCAN",
      sourceIp: "192.168.1.100",
      destIp: "10.0.0.25",
      time: "2025-04-26 10:15:32"
    },
    {
      severity: "Critical",
      type: "SQL_INJECTION",
      sourceIp: "192.168.1.105",
      destIp: "10.0.0.22",
      time: "2025-04-26 09:42:18"
    },
    {
      severity: "Medium",
      type: "DNS_TUNNELING",
      sourceIp: "192.168.1.112",
      destIp: "10.0.0.5",
      time: "2025-04-26 09:35:47"
    },
    {
      severity: "Low",
      type: "SUSPICIOUS_USER_AGENT",
      sourceIp: "192.168.1.118",
      destIp: "10.0.0.8",
      time: "2025-04-26 08:27:15"
    }
  ];

  const mockScans: ScanData[] = [
    {
      id: "scan-1",
      fileName: "week6.pcap",
      timestamp: "2025-04-26 11:05:22",
      connections: 74342,
      dnsQueries: 221,
      alerts: 15
    },
    {
      id: "scan-2",
      fileName: "ipp.pcap",
      timestamp: "2025-04-25 16:32:48",
      connections: 277,
      dnsQueries: 0,
      alerts: 0
    },
    {
      id: "scan-3",
      fileName: "tfp_capture.pcapng",
      timestamp: "2025-04-24 09:15:37",
      connections: 1842,
      dnsQueries: 58,
      alerts: 3
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-6 py-6 bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              SOC Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Welcome back, Security Analyst. Here's your security overview for today.
            </p>
          </div>
          <div className="mt-4 md:mt-0 animate-fade-in">
            <Link 
              href="/upload" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              Upload PCAP
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview 
          totalAlerts={145} 
          criticalAlerts={28} 
          pcapAnalyses={12} 
          monitoredIps={56} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {/* Recent Alerts */}
            <AlertTable alerts={mockAlerts} title="Recent Alerts" showViewAll={true} />
          </div>

          {/* System Status */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md px-6 py-6 mb-8 animate-fade-in">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">System Status</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CPU Usage</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">64%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory Usage</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">42%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Disk Usage</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Services Status</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">PCAP Analysis Engine</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Alert Monitoring</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Wazuh Integration</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Threat Intelligence</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Scans */}
        <ScansGrid scans={mockScans} title="Recent PCAP Analyses" showViewAll={true} />
      </div>
    </main>
  );
}
