import React, { useEffect } from 'react';
import 'flowbite/dist/flowbite.min.css';

const Datecomponent = () => {
  useEffect(() => {
    // Ensure that Flowbite's Datepicker is loaded in the browser
    if (typeof window !== 'undefined') {
      import('flowbite-datepicker').then((module) => {
        const { Datepicker } = module;

        const today = new Date();

        // Calculate minDate (2 months back from current date)
        const minDate = new Date(today);
        minDate.setMonth(today.getMonth() - 2);

        // Calculate maxDate (3 months forward from current date)
        const maxDate = new Date(today);
        maxDate.setMonth(today.getMonth() + 3);

        const datepickerElement = document.getElementById('datepicker-format');
        if (datepickerElement) {
          // Instantiate Datepicker
          new Datepicker(datepickerElement, {
            minDate: minDate,
            maxDate: maxDate,
            autoSelectToday: true,
            buttons: true,
          });
        }
      }).catch((error) => {
        console.error("Error loading Flowbite Datepicker:", error);
      });
    }
  }, []);

  return (
    <div className="relative max-w-sm">
      <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
        </svg>
      </div>
      <input
        id="datepicker-format"
        type="text"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="Select date"
      />
    </div>
  );
};

export {Datecomponent};
