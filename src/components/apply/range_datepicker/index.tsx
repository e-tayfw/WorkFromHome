import React, { useEffect, useRef } from 'react';
import 'flowbite/dist/flowbite.min.css';

interface DateRange {
  start: string;
  end: string;
}

interface DateRangePickerProps {
  selectedDateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}

const DateRangePickerComponent: React.FC<DateRangePickerProps> = ({
  selectedDateRange,
  onDateRangeChange,
}) => {
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("flowbite-datepicker").then((module) => {
        const { Datepicker } = module;

        const today = new Date();
        const minDate = new Date(today);
        minDate.setMonth(today.getMonth() - 2);
        const maxDate = new Date(today);
        maxDate.setMonth(today.getMonth() + 3);

        let startPicker: any;
        let endPicker: any;

        if (startDateRef.current) {
          startPicker = new Datepicker(startDateRef.current, {
            minDate: minDate,
            maxDate: maxDate,
            format: "yyyy-mm-dd",
            clearBtn: true,
            autohide: true,
          });

          startDateRef.current.addEventListener("changeDate", (event: Event) => {
            const target = event.target as HTMLInputElement;
            if (target && target.value) {
              onDateRangeChange({ ...selectedDateRange, start: target.value });
              if (endPicker) {
                const nextDay = new Date(target.value);
                nextDay.setDate(nextDay.getDate() + 1);
                endPicker.setOptions({ minDate: nextDay });
                
                // Clear end date if it's now invalid
                if (selectedDateRange.end && new Date(selectedDateRange.end) <= new Date(target.value)) {
                  onDateRangeChange({ start: target.value, end: '' });
                  endPicker.setDate({ clear: true });
                }
              }
            }
          });
        }

        if (endDateRef.current) {
          const initialMinDate = selectedDateRange.start ? new Date(selectedDateRange.start) : minDate;
          initialMinDate.setDate(initialMinDate.getDate() + 1);

          endPicker = new Datepicker(endDateRef.current, {
            minDate: initialMinDate,
            maxDate: maxDate,
            format: "yyyy-mm-dd",
            clearBtn: true,
            autohide: true,
          });

          endDateRef.current.addEventListener("changeDate", (event: Event) => {
            const target = event.target as HTMLInputElement;
            if (target && target.value) {
              onDateRangeChange({ ...selectedDateRange, end: target.value });
            }
          });
        }

        return () => {
          if (startPicker) startPicker.destroy();
          if (endPicker) endPicker.destroy();
        };
      }).catch((error) => {
        console.error("Error loading Flowbite Datepicker:", error);
      });
    }
  }, [selectedDateRange, onDateRangeChange]);

  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
          </svg>
        </div>
        <input
          ref={startDateRef}
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:!ring-primary focus:!border-primary block w-full sm:w-auto ps-10 p-2.5"
          placeholder="Start date"
          value={selectedDateRange.start}
          readOnly
        />
      </div>
      <div>
        to
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
          </svg>
        </div>
        <input
          ref={endDateRef}
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:!ring-primary focus:!border-primary block w-full sm:w-auto ps-10 p-2.5"
          placeholder="End date"
          value={selectedDateRange.end}
          readOnly
        />
      </div>
    </div>
  );
};

export { DateRangePickerComponent };