
import React from 'react';

interface StatusBarProps {
  dark?: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({ dark = false }) => {
  return (
    <div className={`mobile-only-status px-8 pt-10 pb-2 flex justify-between items-center w-full ${dark ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
      <span className="text-sm font-semibold">9:41</span>
      <div className="flex items-center space-x-1.5">
        <span className="material-icons-round text-sm">signal_cellular_alt</span>
        <span className="material-icons-round text-sm">wifi</span>
        <span className="material-icons-round text-sm">battery_full</span>
      </div>
    </div>
  );
};

export default StatusBar;
