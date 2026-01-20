import React from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";

interface SettingSectionProps {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isActive: boolean;
  onToggle: (id: string | null) => void;
}

const SettingSection: React.FC<SettingSectionProps> = ({
  id,
  title,
  description,
  icon: Icon,
  children,
  isActive,
  onToggle,
}) => {
  if (isActive) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => onToggle(null)}
            className="mr-3 p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Icon className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {children}
      </div>
    );
  }

  return (
    <button
      onClick={() => onToggle(id)}
      className="w-full bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Icon className="w-5 h-5 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </button>
  );
};

export default SettingSection;
