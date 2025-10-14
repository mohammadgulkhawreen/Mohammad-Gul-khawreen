import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setDate(new Date()), 1000);
    return () => {
      clearInterval(timerId);
    };
  }, []);

  const timeString = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="flex items-center bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5">
      <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 tabular-nums tracking-wider">
        {timeString}
      </span>
    </div>
  );
};

export default Clock;
