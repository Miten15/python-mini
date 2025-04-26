"use client";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isUpward: boolean;
  };
  color?: string;
  animate?: boolean;
}

function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  color = "from-blue-500 to-indigo-600", 
  animate = false 
}: StatCardProps) {
  return (
    <div className={`stat-card hover-lift ${animate ? 'animate-fade-in' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{title}</h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
          
          {trend && (
            <div className="flex items-center">
              <span 
                className={`text-xs ${
                  trend.isUpward 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                } flex items-center`}
              >
                {trend.isUpward ? (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {trend.value}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last week</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color} text-white`}>
          {icon}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r opacity-50 rounded-b-lg" style={{ background: `linear-gradient(to right, ${color.split(' ')[1]}, ${color.split(' ')[3]})` }}></div>
    </div>
  );
}

interface StatsOverviewProps {
  totalAlerts: number;
  criticalAlerts: number;
  pcapAnalyses: number;
  monitoredIps: number;
}

export default function StatsOverview({
  totalAlerts = 0,
  criticalAlerts = 0,
  pcapAnalyses = 0,
  monitoredIps = 0
}: Partial<StatsOverviewProps>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-8">
      <StatCard 
        title="Total Alerts" 
        value={totalAlerts} 
        icon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        }
        trend={{ value: 12, isUpward: true }}
        animate 
      />
      
      <StatCard 
        title="Critical Alerts" 
        value={criticalAlerts}
        color="from-red-500 to-pink-600"
        icon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        }
        trend={{ value: 8, isUpward: true }}
        animate
      />
      
      <StatCard 
        title="PCAP Analyses" 
        value={pcapAnalyses}
        color="from-emerald-500 to-teal-600"
        icon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        }
        trend={{ value: 5, isUpward: true }}
        animate
      />
      
      <StatCard 
        title="Monitored IPs" 
        value={monitoredIps}
        color="from-amber-500 to-orange-600"
        icon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
          </svg>
        } 
        animate
      />
    </div>
  );
}