
import { Clock } from "lucide-react";
import { getUserTimezone, getTimezoneAbbreviation } from "@/utils/timeUtils";

interface TimezoneIndicatorProps {
  className?: string;
  showIcon?: boolean;
  date?: Date;
}

const TimezoneIndicator = ({ 
  className = "", 
  showIcon = true, 
  date 
}: TimezoneIndicatorProps) => {
  const timezone = getUserTimezone();
  const abbreviation = getTimezoneAbbreviation(date);

  return (
    <div className={`flex items-center text-sm text-gray-500 ${className}`}>
      {showIcon && <Clock className="h-4 w-4 mr-1" />}
      <span>{abbreviation} ({timezone})</span>
    </div>
  );
};

export default TimezoneIndicator;
