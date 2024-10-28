import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import StatusFilter from '@/components/approve/filter';
import StaffSearch from '@/components/approve/search';
import RecurringTable from '@/components/approve/recurring';
import AdhocTable from '@/components/approve/adhoc';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [pagination, setPagination] = useState<{ [staffId: number]: { recurring: number; adhoc: number } }>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Fetch and display logs in a modal using SweetAlert
  const handleRequestClick = async (requestId: number) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8085/api/requestLog/requestId/${requestId}`);
      const logs = response.data;
  
      const logContent = logs
        .map((log: any) => `
          <div>
            <strong>Date:</strong> ${log.Date}<br />
            <strong>Status:</strong> ${log.New_State}<br />
            <strong>Remarks:</strong> ${log.Remarks || 'No remarks'}<br />
            ${log.Employee_ID === 0 ? '<em>Change made by system</em><br />' : ''}<br />
          </div>
        `)
        .join('');
  
      Swal.fire({
        title: `Request #${requestId} Logs`,
        html: `<div style="text-align: left;">${logContent}</div>`,
        icon: 'info',
        showCloseButton: true,
        confirmButtonText: 'Close',
        confirmButtonColor: '#072040',
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to load request logs. Please try again later.',
        icon: 'error',
        confirmButtonText: 'Close',
        confirmButtonColor: '#072040',
      });
    }
  };

  // Team Size
  const teamSize = employees.length

  // Apply sorting and filter to adhoc requests
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

  const getEmployeeAdhocRequests = (employeeId: number) => {
    return sortedAdhocRequests.filter((request) => request.requestorId === employeeId);
  };

  // Group requests by batch, applying filterStatus
  const groupRequestsByBatch = (requests: Request[]) => {
    return requests.reduce(
      (acc: any, request: Request) => {
        const batch = request.requestBatch;

        // Apply the filter status here for recurring requests
        if (batch && (filterStatus === 'all' || request.status.toLowerCase() === filterStatus.toLowerCase())) {
          if (!acc.recurring[batch]) {
            acc.recurring[batch] = [];
          }
          acc.recurring[batch].push(request);
        } else if (!batch) {
          acc.adhoc.push(request);
        }

        return acc;
      },
      { recurring: {}, adhoc: [] }
    );
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

  const getShortHeader = (fullHeader: string) => {
    const shortForms: { [key: string]: string } = {
      'Date Requested': 'Date Req.',
      Duration: 'Dur.',
      'Date Of Request': 'DoR.',
      Status: 'Stat.',
      Action: 'Act.',
    };
    return shortForms[fullHeader] || fullHeader;
  };

  const useShortHeaders = () => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 960);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
  };

  const isMobile = useShortHeaders();

  // Sort employees alphabetically by name
  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      const nameA = `${a.Staff_FName} ${a.Staff_LName}`.toLowerCase();
      const nameB = `${b.Staff_FName} ${b.Staff_LName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [employees]);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full">
        <StatusFilter filterStatus={filterStatus} setFilterStatus={setFilterStatus} />
        <div className="h-16 w-px bg-gray-300 hidden md:block" />
        <StaffSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} employees={employees} />
      </div>

      {sortedEmployees
        .filter((employee) => `${employee.Staff_FName} ${employee.Staff_LName}`.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((employee) => {
          const employeeRequests = getEmployeeRequests(employee.Staff_ID);
          const employeeAdhocRequests = getEmployeeAdhocRequests(employee.Staff_ID);
          const groupedRequests = groupRequestsByBatch(employeeRequests);
          const isExpanded = expandedStaff.includes(employee.Staff_ID);

          const hasNoRecurringRequests = Object.keys(groupedRequests.recurring).length === 0;
          const hasNoAdhocRequests = employeeAdhocRequests.length === 0;

          return (
            <div key={employee.Staff_ID} className="mb-8">
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

              {isExpanded && (
                <>
                  {hasNoRecurringRequests ? (
                    <div className="mt-4 text-center">
                      <span className="text-gray-500">
                        Staff has no requests with `&apos;`{filterStatus}
                        `&apos;` status
                      </span>
                    </div>
                  ) : (
                    <RecurringTable
                      employeeRequests={groupedRequests.recurring}
                      employee={employee}
                      pagination={pagination}
                      handlePageChange={handlePageChange}
                      fetchRequests={fetchRequests}
                      handleRequestClick={handleRequestClick}
                      isMobile={isMobile}
                      getShortHeader={getShortHeader}
                      teamSize={teamSize}
                    />
                  )}

                  {hasNoAdhocRequests ? (
                    <div className="mt-4 text-center">
                      <span className="text-gray-500">
                        Staff has no requests with `&apos;`{filterStatus}
                        `&apos;` status
                      </span>
                    </div>
                  ) : (
                    <AdhocTable
                      employeeAdhocRequests={employeeAdhocRequests}
                      employee={employee}
                      pagination={pagination}
                      requestsPerPage={requestsPerPage}
                      handlePageChange={handlePageChange}
                      requestSort={requestSort}
                      getSortIcon={getSortIcon}
                      fetchRequests={fetchRequests}
                      handleRequestClick={handleRequestClick}
                      isMobile={isMobile}
                      getShortHeader={getShortHeader}
                      teamSize={teamSize}
                    />
                  )}
                </>
              )}
            </div>
          );
        })}

      {error && (
        <div className="flex items-center justify-center mt-6">
          <span className="text-red-500">{error}</span>
        </div>
      )}
    </div>
  );
};

export default ApproveTable;
