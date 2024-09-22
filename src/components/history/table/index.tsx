import React, { useState, useMemo } from 'react';
import { H1, BodyLarge } from '@/components/TextStyles'; // Correct import path for TextStyles
import RequestEntry from '@/components/history/entry'; // Updated import path for RequestEntry
import { testRequests } from '@/constants/history_test'; // Import the dummy data
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // FontAwesome icon import
import { faSort, faSortUp, faSortDown, faSquareCaretDown } from '@fortawesome/free-solid-svg-icons'; // Import specific icons

interface Request {
  requestId: string;
  requestorId: string;
  approverId: string;
  status: string;
  dateRequested: string;
  requestBatch: string;
  dateOfRequest: string;
  duration: string;
}

export const RequestTable: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Request; direction: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Sort requests
  const sortedRequests = useMemo(() => {
    let sortableRequests = [...testRequests];
    if (sortConfig !== null) {
      sortableRequests.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle sorting for date fields (dateRequested, dateOfRequest)
        if (sortConfig.key === 'dateRequested' || sortConfig.key === 'dateOfRequest') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableRequests;
  }, [testRequests, sortConfig]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    if (filterStatus === 'all') {
      return sortedRequests;
    }
    return sortedRequests.filter(request => request.status.toLowerCase() === filterStatus.toLowerCase());
  }, [filterStatus, sortedRequests]);

  // Function to request sorting
  const requestSort = (key: keyof Request) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Function to get the appropriate icon based on sort state
  const getSortIcon = (key: keyof Request) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} />; // Default icon when no sorting applied
    }
    if (sortConfig.direction === 'ascending') {
      return <FontAwesomeIcon icon={faSortUp} />; // Ascending icon
    }
    return <FontAwesomeIcon icon={faSortDown} />; // Descending icon
  };

  return (
    <div className="container mx-auto p-4">
      <H1 className="mb-6 text-primary">My Requests</H1> {/* Primary color for the heading */}

      {/* Styled Filter Dropdown */}
      <div className="mb-6 flex items-center space-x-4">
        <label htmlFor="statusFilter" className="text-lg font-semibold text-primary">Filter by Status:</label>
        <div className="relative">
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
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <FontAwesomeIcon icon={faSquareCaretDown} />
          </div>
        </div>
      </div>

      <table className="table-auto w-full border-collapse">
        <thead>
          <tr className="bg-secondary text-text"> {/* Using secondary color for the header background */}
            <th className="px-4 py-2 text-left cursor-pointer" onClick={() => requestSort('dateRequested')}>
              <BodyLarge className="text-primary">Date {getSortIcon('dateRequested')}</BodyLarge>
            </th>
            <th className="px-4 py-2 text-left cursor-pointer" onClick={() => requestSort('duration')}>
              <BodyLarge className="text-primary">Arrangement {getSortIcon('duration')}</BodyLarge>
            </th>
            <th className="px-4 py-2 text-left cursor-pointer" onClick={() => requestSort('dateOfRequest')}>
              <BodyLarge className="text-primary">Date Of Request {getSortIcon('dateOfRequest')}</BodyLarge>
            </th>
            <th className="px-4 py-2 text-left cursor-pointer" onClick={() => requestSort('status')}>
              <BodyLarge className="text-primary">Status {getSortIcon('status')}</BodyLarge>
            </th>
            <th className="px-4 py-2 text-left">
              <BodyLarge className="text-primary">Action</BodyLarge>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.map((request, index) => (
            <RequestEntry
              key={index}
              requestId={request.requestId}
              requestorId={request.requestorId}
              approverId={request.approverId}
              status={request.status}
              dateRequested={request.dateRequested}
              duration={request.duration}
              requestBatch={request.requestBatch}
              dateOfRequest={request.dateOfRequest}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestTable;
