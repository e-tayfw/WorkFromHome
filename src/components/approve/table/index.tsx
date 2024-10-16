import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import ApproveEntry from '@/components/approve/entry';
import { BodyLarge } from '@/components/TextStyles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from "react-redux";

interface Request {
  requestId: number;
  requestorId: number;
  approverId: number;
  status: string;
  dateRequested: string;
  requestBatch: string;
  dateOfRequest: string;
  duration: string;
}

interface Employee {
  Staff_ID: number;
  Staff_FName: string;
  Staff_LName: string;
}

interface ApproveTableProps {
  employees: Employee[];
}

const ApproveTable: React.FC<ApproveTableProps> = ({ employees }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [expandedStaff, setExpandedStaff] = useState<number[]>([]); // Track expanded staff tables
  const [sortConfig, setSortConfig] = useState<{ key: keyof Request; direction: string } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allDataLoaded, setAllDataLoaded] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all'); // Status filter state
  const [pagination, setPagination] = useState<{ [staffId: number]: number }>({});
  const [searchTerm, setSearchTerm] = useState<string>(''); // Search term for staff name
  const [searchSuggestions, setSearchSuggestions] = useState<Employee[]>([]); // For dynamic suggestions
  const [isClient, setIsClient] = useState(false); 

  const staffId = useSelector((state: any) => state.auth.staffId);
  const requestsPerPage = 5;

  // Define fetchRequests to refresh data and collapse expanded tables
  const fetchRequests = useCallback(async () => {
    try {
      const requestRes = await axios.get(`http://127.0.0.1:8085/api/request/approverID/${staffId}`);

      const mappedRequests: Request[] = requestRes.data.map((item: any) => ({
        requestId: item.Request_ID,
        requestorId: item.Requestor_ID,
        approverId: item.Approver_ID,
        status: item.Status,
        dateRequested: item.Date_Requested,
        requestBatch: item.Request_Batch,
        dateOfRequest: new Date(item.created_at).toISOString().split('T')[0],
        duration: item.Duration
      }));

      setRequests(mappedRequests);
      setLoading(false);

      // If employees are also loaded, show the success toast
      if (employees.length > 0) {
        setAllDataLoaded(true);
      }

      // Collapse all expanded sections after refresh
      setExpandedStaff([]);
      
    } catch (err) {
      console.error('Error fetching approval data:', err);
      setError('Failed to load approval data');
      setLoading(false);
      toast.error('Failed to load approvals, please try again!');
    }
  }, [staffId, employees]);

  useEffect(() => {
    setIsClient(true);
    fetchRequests();
  }, [staffId, employees, fetchRequests]);

  useEffect(() => {
    if (allDataLoaded) {
      toast.success('All data loaded successfully');
    }
  }, [allDataLoaded]);

  // Apply sorting and filtering
  const filteredRequests = useMemo(() => {
    let sortableRequests = [...requests];

    // Apply status filter
    if (filterStatus !== 'all') {
      sortableRequests = sortableRequests.filter((request) => request.status.toLowerCase() === filterStatus.toLowerCase());
    }

    // Apply sorting
    if (sortConfig !== null) {
      sortableRequests.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];

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
  }, [requests, sortConfig, filterStatus]);

  // Filter employees based on search term and handle suggestions
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

  const requestSort = (key: keyof Request) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Request) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} />;
    }
    if (sortConfig.direction === 'ascending') {
      return <FontAwesomeIcon icon={faSortUp} />;
    }
    return <FontAwesomeIcon icon={faSortDown} />;
  };

  const toggleExpand = (staffId: number) => {
    if (expandedStaff.includes(staffId)) {
      setExpandedStaff(expandedStaff.filter((id) => id !== staffId));
    } else {
      setExpandedStaff([...expandedStaff, staffId]);
    }
  };

  const getEmployeeRequests = (employeeId: number) => {
    return filteredRequests.filter((request) => request.requestorId === employeeId);
  };

  // Handle pagination
  const paginate = (requests: Request[], staffId: number) => {
    const currentPage = pagination[staffId] || 1;
    const startIndex = (currentPage - 1) * requestsPerPage;
    const endIndex = startIndex + requestsPerPage;
    return requests.slice(startIndex, endIndex);
  };

  const handlePageChange = (staffId: number, newPage: number) => {
    setPagination((prev) => ({ ...prev, [staffId]: newPage }));
  };

  // Reset pagination when filter is applied
  useEffect(() => {
    setPagination({});
  }, [filterStatus]);

  // Function to handle highlighting of search matches
  const highlightMatch = (text: string, searchTerm: string) => {
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? 
      <span key={index} className="font-bold text-primary">{part}</span> : 
      part
    );
  };

  return (
    <div className="container mx-auto p-4">
      {/* Conditionally render ToastContainer only if it's client-side */}
      {isClient && <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick />}

      {/* Filter and Search Row */}
      <div className="mb-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full">
        {/* Filter Dropdown */}
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

        {/* Grey Vertical Divider */}
        <div className="h-16 w-px bg-gray-300 hidden md:block" />

        {/* Search Input for Staff Member */}
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

          {/* Suggestions Dropdown */}
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
      </div>

      {employees
        .filter((employee) =>
          `${employee.Staff_FName} ${employee.Staff_LName}`.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((employee) => {
          const employeeRequests = getEmployeeRequests(employee.Staff_ID);
          const paginatedRequests = paginate(employeeRequests, employee.Staff_ID);
          const currentPage = pagination[employee.Staff_ID] || 1;
          const totalPages = Math.ceil(employeeRequests.length / requestsPerPage);
          const isExpanded = expandedStaff.includes(employee.Staff_ID);

          return (
            <div key={employee.Staff_ID} className="mb-8">
              {/* Clickable Dropdown Header */}
              <div
                onClick={() => toggleExpand(employee.Staff_ID)}
                className="flex items-center justify-between cursor-pointer bg-gray-100 px-4 py-2 rounded-md"
              >
                <h2 className="text-xl font-semibold text-primary">
                  {employee.Staff_FName} {employee.Staff_LName}
                </h2>
                <FontAwesomeIcon
                  icon={isExpanded ? faChevronDown : faChevronRight}
                />
              </div>

              {/* Staff Request Table - Only display if expanded */}
              {isExpanded && (
                <>
                  {employeeRequests.length === 0 ? (
                    <div className="text-center text-primary mt-4">
                      Staff has no requests of &apos;{filterStatus}&apos; status
                    </div>
                  ) : (
                    <>
                      <table className="table-auto w-full border-collapse mt-4">
                        <thead>
                          <tr className="bg-secondary text-text">
                            <th
                              className="px-4 py-2 text-left cursor-pointer"
                              onClick={() => requestSort("dateRequested")}
                            >
                              <BodyLarge className="text-primary">
                                Date Requested {getSortIcon("dateRequested")}
                              </BodyLarge>
                            </th>
                            <th
                              className="px-4 py-2 text-left cursor-pointer"
                              onClick={() => requestSort("duration")}
                            >
                              <BodyLarge className="text-primary">
                                Duration {getSortIcon("duration")}
                              </BodyLarge>
                            </th>
                            <th
                              className="px-4 py-2 text-left cursor-pointer"
                              onClick={() => requestSort("dateOfRequest")}
                            >
                              <BodyLarge className="text-primary">
                                Date Of Request {getSortIcon("dateOfRequest")}
                              </BodyLarge>
                            </th>
                            <th
                              className="px-4 py-2 text-left cursor-pointer"
                              onClick={() => requestSort("status")}
                            >
                              <BodyLarge className="text-primary">
                                Status {getSortIcon("status")}
                              </BodyLarge>
                            </th>
                            <th className="px-4 py-2 text-left">
                              <BodyLarge className="text-primary">
                                Action
                              </BodyLarge>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedRequests.map((request) => (
                            <ApproveEntry
                              key={request.requestId}
                              requestId={request.requestId}
                              requestorName={`${employee.Staff_FName} ${employee.Staff_LName}`}
                              requestorId={request.requestorId}
                              approverId={request.approverId}
                              status={request.status}
                              dateRequested={request.dateRequested}
                              requestBatch={request.requestBatch}
                              dateOfRequest={request.dateOfRequest}
                              duration={request.duration}
                              teamSize={employees.length}
                              onRefreshRequests={fetchRequests} // Pass fetchRequests to ApproveEntry
                            />
                          ))}
                        </tbody>
                      </table>

                      {/* Pagination Controls */}
                      <div className="flex justify-center items-center mt-4 space-x-4">
                        <button
                          className="bg-primary text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                          disabled={currentPage === 1}
                          onClick={() =>
                            handlePageChange(employee.Staff_ID, currentPage - 1)
                          }
                        >
                          Previous
                        </button>
                        <span className="text-primary font-semibold">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          className="bg-primary text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                          disabled={
                            currentPage === totalPages || totalPages === 0
                          }
                          onClick={() =>
                            handlePageChange(employee.Staff_ID, currentPage + 1)
                          }
                        >
                          Next
                        </button>
                      </div>
                    </>
                  )}

                  {/* Grey Divider between Staff Sections */}
                  <hr className="my-8 border-t-2 border-gray-300" />
                </>
              )}
            </div>
          );
        })}

      {/* Error message display */}
      {error && (
        <div className="flex items-center justify-center mt-6">
          <BodyLarge className="text-red-500">{error}</BodyLarge>
        </div>
      )}
    </div>
  );
};

export default ApproveTable;
