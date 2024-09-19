import type { Config } from "tailwindcss";


const Selection = () => {
    return (
        <div className="flex">
            <div className="flex items-center me-4">
                <input id="inline-radio" 
                       type="radio" 
                       value="" 
                       name="inline-radio-group" 
                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                <label htmlFor="inline-radio" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">AM</label>
            </div>
            <div className="flex items-center me-4">
                <input id="inline-2-radio"
                       type="radio" 
                       value="" 
                       name="inline-radio-group" 
                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                <label htmlFor="inline-2-radio" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">PM</label>
            </div>
            <div className="flex items-center me-4">
                <input checked 
                       id="inline-checked-radio" 
                       type="radio" 
                       value="" 
                       name="inline-radio-group" 
                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                <label htmlFor="inline-checked-radio" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Full Day</label>
            </div>
        </div>
    );
  };
  export default Selection;