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
    hour12: true,
  });

  const dateString = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col items-end text-right">
      <div className="font-semibold text-sm text-indigo-600 tabular-nums">
        {timeString}
      </div>
      <div className="text-xs text-slate-500">
        {dateString}
      </div>
    </div>
  );
};

export default Clock;