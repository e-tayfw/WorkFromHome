import React, { useState } from 'react';
import { testSchedule } from '@/constants/schedule_test';
interface Schedule {
  [date: string]: number; // 0: no WFH, 1: AM WFH, 2: PM WFH, 3: Full Day WFH
}

const schedule: Schedule = testSchedule[0].schedule;
export const WFHCalendar: React.FC = () => {
  const [currentView, setCurrentView] = useState('day');

  const toggleView = () => {
    setCurrentView(currentView === 'day' ? 'week' : 'day');
  };

  const dateFormat = (date: string) => {
    return `${date.slice(0, 2)}-${date.slice(2, 4)}-${date.slice(4)}`;
  };

  const getWeekNumber = (date: string) => {
    const dateParts = date.match(/(\d{2})(\d{2})(\d{4})/);
    if (!dateParts) {
      return 0;
    }
    const day = parseInt(dateParts[1]);
    const month = parseInt(dateParts[2]) - 1;
    const year = parseInt(dateParts[3]);
    const dateObject = new Date(year, month, day);
    return Math.ceil(
      (((+dateObject - +new Date(dateObject.getFullYear(), 0, 1)) / 86400000) +
        dateObject.getDay() +
        1) /
        7
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">WFH Calendar</h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={toggleView}
      >
        Toggle View
      </button>
      {currentView === 'day' ? (
        <div className="flex flex-col">
          {Object.keys(schedule).map((date, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-4 border border-gray-200 rounded mb-4"
            >
              <h2 className="text-lg font-bold">{dateFormat(date)}</h2>
              <p>
                {schedule[date] === 0
                  ? 'No WFH'
                  : schedule[date] === 1
                  ? 'AM WFH'
                  : schedule[date] === 2
                  ? 'PM WFH'
                  : 'Full Day WFH'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center">
          {Object.values(Object.keys(schedule).reduce((weeks: { [key: number]: Schedule }, date) => {
            const weekNumber = getWeekNumber(date);
            if (!weeks[weekNumber]) {
              weeks[weekNumber] = {};
            }
            weeks[weekNumber][date] = schedule[date];
            return weeks;
            }, {})).map((week: Schedule, index: number) => (
            <div key={index} className="flex flex-wrap justify-center">
              {Object.keys(week).map((date, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded w-1/7"
                >
                  <h2 className="text-lg font-bold">{dateFormat(date)}</h2>
                  <p>
                    {week[date] === 0
                      ? 'No WFH'
                      : week[date] === 1
                      ? 'AM WFH'
                      : week[date] === 2
                      ? 'PM WFH'
                      : 'Full Day WFH'}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
