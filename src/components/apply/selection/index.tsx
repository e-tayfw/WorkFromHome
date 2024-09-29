import React, { useState, useEffect, ChangeEvent } from 'react';

type SelectionValue = 'AM' | 'PM' | 'FD' | '';

interface SelectionProps {
  onSelectionChange: (value: SelectionValue) => void;
  selectedValue: SelectionValue;
}

const Selection: React.FC<SelectionProps> = ({ onSelectionChange, selectedValue }) => {
    const [localSelectedValue, setLocalSelectedValue] = useState<SelectionValue>(selectedValue);

    useEffect(() => {
      setLocalSelectedValue(selectedValue);
    }, [selectedValue]);

    useEffect(() => {
      onSelectionChange(localSelectedValue);
    }, [localSelectedValue, onSelectionChange]);
  
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setLocalSelectedValue(event.target.value as SelectionValue);
    };

    return (
        <div className="flex flex-col ">
            <div className="flex items-center mb-4">
                <input id="inline-radio" 
                       type="radio" 
                       value="AM" 
                       name="inline-radio-group"
                       checked={localSelectedValue === 'AM'}
                       onChange={handleChange} 
                       className="w-4 h-4 !text-primary bg-gray-100 border-gray-300 focus:!ring-primary  "/>
                <label htmlFor="inline-radio" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                AM</label>
            </div>
            <div className="flex items-center mb-4">
                <input id="inline-2-radio"
                       type="radio" 
                       value="PM" 
                       name="inline-radio-group" 
                       checked={localSelectedValue === 'PM'}
                       onChange={handleChange}
                       className="w-4 h-4 !text-primary bg-gray-100 border-gray-300 focus:!ring-primary  dark:focus:ring-blue-600 "/>
                <label htmlFor="inline-2-radio" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                PM</label>
            </div>
            <div className="flex items-center">
                <input id="inline-checked-radio" 
                       type="radio" 
                       value="FD" 
                       name="inline-radio-group"
                       checked={localSelectedValue === 'FD'}
                       onChange={handleChange} 
                       className="w-4 h-4 !text-primary bg-gray-100 border-gray-300 focus:!ring-primary "/>
                <label htmlFor="inline-checked-radio" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                Full Day</label>
            </div>
        </div>
    );
};

export { Selection };