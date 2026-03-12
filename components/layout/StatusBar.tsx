
import React from 'react';

interface StatusBarProps {
  dark?: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({ dark = false }) => {
  return (
    <div className="mobile-only-status h-8 w-full" />
  );
};

export default StatusBar;
