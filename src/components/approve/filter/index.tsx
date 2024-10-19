import React from 'react';

interface StatusFilterProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ filterStatus, setFilterStatus }) => {
  return (
    <div className="flex-1 w-full">
      <label htmlFor="statusFilter" className="text-lg font-semibold text-primary">Filter by Status:</label>
      <div className="relative w-full">
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-md shadow-sm leading-tight focus:outline-none focus:ring-primary focus:border-primary"
        >
          <option value="all">All</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="withdraw pending">Withdraw Pending</option>
          <option value="withdraw rejected">Withdraw Rejected</option>
          <option value="rejected">Rejected</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700" />
      </div>
    </div>
  );
};

export default StatusFilter;
