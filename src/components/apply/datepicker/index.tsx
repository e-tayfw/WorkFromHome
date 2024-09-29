
import React, { useEffect } from 'react';
import 'flowbite/dist/flowbite.min.css';

interface DateComponentProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const Datecomponent: React.FC<DateComponentProps> = ({
  selectedDate,
  onDateChange,
}) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("flowbite-datepicker")
        .then((module) => {
          const { Datepicker } = module;

          const today = new Date();
          const minDate = new Date(today);
          minDate.setMonth(today.getMonth() - 2);
          const maxDate = new Date(today);
          maxDate.setMonth(today.getMonth() + 3);

          const datepickerElement =
            document.getElementById("datepicker-format");
          if (datepickerElement) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const datepicker = new Datepicker(datepickerElement, {
              minDate: minDate,
              maxDate: maxDate,
              format: "yyyy-mm-dd",
              clearBtn: true,
            });

            // Use the changeDate event of the datepicker
            datepickerElement.addEventListener("changeDate", (event) => {
              const target = event.target as HTMLInputElement;
              if (target && target.value) {
                onDateChange(target.value);
              }
            });
          }
        })
        .catch((error) => {
          console.error("Error loading Flowbite Datepicker:", error);
        });
    }
  }, [onDateChange]);

  return (
    <div className="relative max-w-sm">
      <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
        </svg>
      </div>
      <input
        id="datepicker-format"
        type="text"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:!ring-primary focus:!border-primary block w-full sm:w-auto ps-10 p-2.5"
        placeholder="Select date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
      />
    </div>
  );
};

export { Datecomponent };