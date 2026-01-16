
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  changeText: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeText, icon, iconBgColor, iconColor }) => {
  const isPositive = change >= 0;

  return (
    <div className="p-5 bg-white rounded-xl shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`flex items-center justify-center w-12 h-12 rounded-md ${iconBgColor} ${iconColor}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center mt-2 text-sm">
        {isPositive ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12l7-7 7 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12l-7 7-7-7" />
          </svg>
        )}
        <span className={`ml-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {changeText}
        </span>
      </div>
    </div>
  );
};

export default StatCard;