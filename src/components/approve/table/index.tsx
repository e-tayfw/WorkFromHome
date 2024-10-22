import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import ApproveEntry from '@/components/approve/entry';
import { BodyLarge } from '@/components/TextStyles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from "react-redux";
import StatusFilter from '@/components/approve/filter';
import StaffSearch from '@/components/approve/search';

interface Request {
  requestId: number;
  requestorId: number;
  approverId: number;
  status: string;
  dateRequested: string;
  requestBatch: string | null;
  dateOfRequest: string;
  duration: string;
}

export interface Employee {
  Staff_ID: number;
  Staff_FName: string;
  Staff_LName: string;
}

interface ApproveTableProps {
  employees: Employee[];
}

const ApproveTable: React.FC<ApproveTableProps> = ({ employees }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [expandedStaff, setExpandedStaff] = useState<number[]>([]);
  const [adhocSortConfig, setAdhocSortConfig] = useState<{ key: keyof Request; direction: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [pagination, setPagination] = useState<{ [staffId: number]: { recurring: number; adhoc: number } }>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  const staffId = useSelector((state: any) => state.auth.staffId);
  const requestsPerPage = 5;

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
        duration: item.Duration,
      }));

      setRequests(mappedRequests);
      setLoading(false);

      if (employees.length > 0) {
        setExpandedStaff([]);
      }
    } catch (err) {
      setError('Failed to load approval data');
      setLoading(false);
    }
  }, [staffId, employees]);

  useEffect(() => {
    setIsClient(true);
    fetchRequests();
  }, [staffId, employees, fetchRequests]);

  const sortedAdhocRequests = useMemo(() => {
    let adhocRequests = [...requests].filter((request) => request.requestBatch === null);

    if (filterStatus !== 'all') {
      adhocRequests = adhocRequests.filter((request) => request.status.toLowerCase() === filterStatus.toLowerCase());
    }

    if (adhocSortConfig !== null) {
      adhocRequests.sort((a, b) => {
        let aValue: any = a[adhocSortConfig.key];
        let bValue: any = b[adhocSortConfig.key];

        if (adhocSortConfig.key === 'dateRequested' || adhocSortConfig.key === 'dateOfRequest') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) {
          return adhocSortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return adhocSortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return adhocRequests;
  }, [requests, adhocSortConfig, filterStatus]);

  const requestSort = (key: keyof Request) => {
    let direction = 'ascending';
    if (adhocSortConfig && adhocSortConfig.key === key && adhocSortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setAdhocSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Request) => {
    if (!adhocSortConfig || adhocSortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} />;
    }
    if (adhocSortConfig.direction === 'ascending') {
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
    return requests.filter((request) => request.requestorId === employeeId);
  };

  const paginate = (requests: Request[] | undefined, staffId: number, type: 'recurring' | 'adhoc') => {
    const currentPage = pagination[staffId]?.[type] || 1;
    const startIndex = (currentPage - 1) * requestsPerPage;
    const endIndex = startIndex + requestsPerPage;

    if (!Array.isArray(requests)) {
      return [];
    }

    return requests.slice(startIndex, endIndex);
  };

  const getTotalPages = (requests: Request[] | undefined) => {
    return requests && requests.length > 0 ? Math.ceil(requests.length / requestsPerPage) : 1;
  };

  const handlePageChange = (staffId: number, newPage: number, type: 'recurring' | 'adhoc') => {
    setPagination((prev) => ({
      ...prev,
      [staffId]: { ...prev[staffId], [type]: newPage },
    }));
  };

  useEffect(() => {
    setPagination({});
  }, [filterStatus]);

  const groupRequestsByBatch = (requests: Request[]) => {
    return requests.reduce((acc: any, request: Request) => {
      const batch = request.requestBatch;
      if (batch) {
        if (!acc.recurring[batch]) {
          acc.recurring[batch] = [];
        }
        acc.recurring[batch].push(request);
      } else {
        acc.adhoc.push(request);
      }
      return acc;
    }, { recurring: {}, adhoc: [] });
  };

  const getShortHeader = (fullHeader: string) => {
    const shortForms: { [key: string]: string } = {
      "Date Requested": "Date Req.",
      "Duration": "Dur.",
      "Date Of Request": "DoR.",
      "Status": "Stat.",
      "Action": "Act.",
    };
    return shortForms[fullHeader] || fullHeader;
  };

  const useShortHeaders = () => {
    // Set breakpoint to use short headers
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 960);
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
    return isMobile;
  };

  const isMobile = useShortHeaders();

  return (
    <div className="container mx-auto p-4">
      {/* Filter and Search Row */}
      <div className="mb-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full">
        <StatusFilter filterStatus={filterStatus} setFilterStatus={setFilterStatus} />
        <div className="h-16 w-px bg-gray-300 hidden md:block" />
        <StaffSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} employees={employees} />
      </div>

      {employees
        .filter((employee) =>
          `${employee.Staff_FName} ${employee.Staff_LName}`.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((employee) => {
          const employeeRequests = getEmployeeRequests(employee.Staff_ID);
          const groupedRequests = groupRequestsByBatch(employeeRequests);
          const isExpanded = expandedStaff.includes(employee.Staff_ID);

          const recurringRequests = groupedRequests.recurring;
          const adhocRequests = groupedRequests.adhoc;

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

              {/* Staff Request Tables - Only display if expanded */}
              {isExpanded && (
                <>
                  {/* Recurring Requests */}
                  {Object.keys(recurringRequests).length > 0 ? (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-primary">
                        Recurring Requests
                      </h3>
                      <table className="table-fixed w-full border-collapse mt-2">
                        <thead>
                          <tr className="bg-secondary text-text">
                            <th className="w-1/5 px-4 py-2 text-left">
                              <BodyLarge className="text-primary">{isMobile ? getShortHeader("Date Requested") : "Date Requested"}</BodyLarge>
                            </th>
                            <th className="w-1/5 px-4 py-2 text-left">
                              <BodyLarge className="text-primary">{isMobile ? getShortHeader("Duration") : "Duration"}</BodyLarge>
                            </th>
                            <th className="w-1/5 px-4 py-2 text-left">
                              <BodyLarge className="text-primary">{isMobile ? getShortHeader("Date Of Request") : "Date Of Request"}</BodyLarge>
                            </th>
                            <th className="w-1/5 px-4 py-2 text-left">
                              <BodyLarge className="text-primary">{isMobile ? getShortHeader("Status") : "Status"}</BodyLarge>
                            </th>
                            <th className="w-1/5 px-4 py-2 text-left">
                              <BodyLarge className="text-primary">{isMobile ? getShortHeader("Action") : "Action"}</BodyLarge>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(recurringRequests)
                            .sort((a, b) => Number(b) - Number(a)) // Sort batch numbers in descending order
                            .map((batchNumber) => {
                              const pendingRequestsInBatch = recurringRequests[batchNumber].filter((request: { status: string; }) => request.status.toLowerCase() === 'pending');

                              return (
                                <React.Fragment key={`batch-${batchNumber}`}>
                                  {/* Batch Row */}
                                  <tr>
                                    <td colSpan={5} className="bg-gray-200 text-center font-semibold py-2">
                                      Batch: {batchNumber}
                                    </td>
                                  </tr>

                                  {paginate(recurringRequests[batchNumber], employee.Staff_ID, 'recurring').map((request: Request, index: number) => (
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
                                      onRefreshRequests={fetchRequests}
                                      isFirstPendingInBatch={index === 0 && request.status.toLowerCase() === 'pending'}
                                      rowSpanCount={pendingRequestsInBatch.length}
                                      isMobile={isMobile}
                                    />
                                  ))}
                                </React.Fragment>
                              );
                            })}
                        </tbody>
                      </table>

                      {/* Pagination for Recurring Requests */}
                      <div className="flex justify-center items-center mt-4 space-x-4">
                        <button
                          className="bg-primary text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                          disabled={(pagination[employee.Staff_ID]?.recurring || 1) === 1}
                          onClick={() => handlePageChange(employee.Staff_ID, (pagination[employee.Staff_ID]?.recurring || 1) - 1, 'recurring')}
                        >
                          Previous
                        </button>
                        <span className="text-primary font-semibold">
                          Page {(pagination[employee.Staff_ID]?.recurring || 1)} of {getTotalPages(recurringRequests[Object.keys(recurringRequests)[0]])}
                        </span>
                        <button
                          className="bg-primary text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                          disabled={paginate(recurringRequests[Object.keys(recurringRequests)[0]], employee.Staff_ID, 'recurring').length < requestsPerPage}
                          onClick={() => handlePageChange(employee.Staff_ID, (pagination[employee.Staff_ID]?.recurring || 1) + 1, 'recurring')}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Adhoc Requests */}
                  {sortedAdhocRequests.length > 0 ? (
                    <div className="mt-4">
                      <hr className="my-4 border-t border-gray-300" />
                      <h3 className="text-lg font-semibold text-primary">Adhoc Requests</h3>
                      <table className="table-fixed w-full border-collapse mt-2">
                        <thead>
                          <tr className="bg-secondary text-text">
                            <th className="w-1/5 px-4 py-2 text-left cursor-pointer" onClick={() => requestSort("dateRequested")}>
                              <BodyLarge className="text-primary">{isMobile ? getShortHeader("Date Requested") : "Date Requested"} {getSortIcon("dateRequested")}</BodyLarge>
                            </th>
                            <th className="w-1/5 px-4 py-2 text-left cursor-pointer" onClick={() => requestSort("duration")}>
                              <BodyLarge className="text-primary">{isMobile ? getShortHeader("Duration") : "Duration"} {getSortIcon("duration")}</BodyLarge>
                            </th>
                            <th className="w-1/5 px-4 py-2 text-left cursor-pointer" onClick={() => requestSort("dateOfRequest")}>
                              <BodyLarge className="text-primary">{isMobile ? getShortHeader("Date Of Request") : "Date Of Request"} {getSortIcon("dateOfRequest")}</BodyLarge>
                            </th>
                            <th className="w-1/5 px-4 py-2 text-left cursor-pointer" onClick={() => requestSort("status")}>
                              <BodyLarge className="text-primary">{isMobile ? getShortHeader("Status") : "Status"} {getSortIcon("status")}</BodyLarge>
                            </th>
                            <th className="w-1/5 px-4 py-2 text-left">
                              <BodyLarge className="text-primary">{isMobile ? getShortHeader("Action") : "Action"}</BodyLarge>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginate(sortedAdhocRequests, employee.Staff_ID, 'adhoc').map((request) => (
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
                              onRefreshRequests={fetchRequests}
                              isMobile={isMobile}
                            />
                          ))}
                        </tbody>
                      </table>

                      {/* Pagination for Adhoc Requests */}
                      <div className="flex justify-center items-center mt-4 space-x-4">
                        <button
                          className="bg-primary text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                          disabled={(pagination[employee.Staff_ID]?.adhoc || 1) === 1}
                          onClick={() => handlePageChange(employee.Staff_ID, (pagination[employee.Staff_ID]?.adhoc || 1) - 1, 'adhoc')}
                        >
                          Previous
                        </button>
                        <span className="text-primary font-semibold">
                          Page {(pagination[employee.Staff_ID]?.adhoc || 1)} of {getTotalPages(sortedAdhocRequests)}
                        </span>
                        <button
                          className="bg-primary text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                          disabled={paginate(sortedAdhocRequests, employee.Staff_ID, 'adhoc').length < requestsPerPage}
                          onClick={() => handlePageChange(employee.Staff_ID, (pagination[employee.Staff_ID]?.adhoc || 1) + 1, 'adhoc')}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* No Requests Message */}
                  {Object.keys(recurringRequests).length === 0 && adhocRequests.length === 0 && (
                    <div className="text-center text-primary mt-4">
                      Staff has no requests of '{filterStatus}' status
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

      {error && (
        <div className="flex items-center justify-center mt-6">
          <BodyLarge className="text-red-500">{error}</BodyLarge>
        </div>
      )}
    </div>
  );
};

export default ApproveTable;
