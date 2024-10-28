import React, { useState, useEffect } from 'react';
import { Employee } from '@/components/approve/table';

interface StaffSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  employees: Employee[];
}

const StaffSearch: React.FC<StaffSearchProps> = ({ searchTerm, setSearchTerm, employees }) => {
  const [searchSuggestions, setSearchSuggestions] = useState<Employee[]>([]);

  useEffect(() => {
    if (searchTerm) {
      const matchingSuggestions = employees.filter(employee =>
        `${employee.Staff_FName} ${employee.Staff_LName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchSuggestions(matchingSuggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchTerm, employees]);

  const highlightMatch = (text: string, searchTerm: string) => {
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ?
        <span key={index} className="font-bold text-primary">{part}</span> :
        part
    );
  };

  return (
    <div className="flex-1 w-full relative">
      <label htmlFor="staffSearch" className="text-lg font-semibold text-primary">Search by Name:</label>
      <input
        type="text"
        id="staffSearch"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setSearchSuggestions([]);
          }
        }}
        onBlur={() => setSearchSuggestions([])}
        placeholder="Enter staff name"
        className="block w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
      />

      {searchSuggestions.length > 0 && (
        <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
          {searchSuggestions.map((suggestion) => (
            <li
              key={suggestion.Staff_ID}
              onMouseDown={() => {
                setSearchTerm(`${suggestion.Staff_FName} ${suggestion.Staff_LName}`);
                setSearchSuggestions([]);
              }}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              {highlightMatch(`${suggestion.Staff_FName} ${suggestion.Staff_LName}`, searchTerm)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StaffSearch;
