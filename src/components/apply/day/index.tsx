// Day
import React, { useState, useEffect } from "react";

type DayValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 0;

interface DayProps {
  onDayChange: (value: DayValue) => void;
  selectedDay: DayValue;
}

const Daypicker: React.FC<DayProps> = ({ selectedDay, onDayChange }) => {
  const [day, setDay] = useState<DayValue>(selectedDay);

  useEffect(() => {
    setDay(selectedDay);
  }, [selectedDay]);

  useEffect(() => {
    onDayChange(day);
  }, [day, onDayChange]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDay(Number(event.target.value) as DayValue);
  };

  const days = [
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
    { value: 7, label: "Sunday" },
  ];

  return (
    <div>
      <select
        id="day-select"
        value={day}
        onChange={handleChange}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:!ring-primary focus:!border-primary block w-full sm:w-auto p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        <option value={0}>Select a day</option>
        {days.map((day) => (
          <option key={day.value} value={day.value}>
            {day.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export { Daypicker };
