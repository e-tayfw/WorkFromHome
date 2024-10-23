// AdhocTable.tsx
import React from 'react';
import ApproveEntry from '@/components/approve/entry';
import { BodyLarge } from '@/components/TextStyles';

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

interface AdhocTableProps {
  employeeAdhocRequests: Request[];
  employee: any;
  pagination: any;
  requestsPerPage: number;
  handlePageChange: (staffId: number, newPage: number, type: 'recurring' | 'adhoc') => void;
  requestSort: (key: keyof Request) => void;
  getSortIcon: (key: keyof Request) => JSX.Element;
  fetchRequests: () => void;
  handleRequestClick: (requestId: number) => void;
  isMobile: boolean;
  getShortHeader: (fullHeader: string) => string;
}

const AdhocTable: React.FC<AdhocTableProps> = ({
  employeeAdhocRequests,
  employee,
  pagination,
  requestsPerPage,
  handlePageChange,
  requestSort,
  getSortIcon,
  fetchRequests,
  handleRequestClick,
  isMobile,
  getShortHeader
}) => {
  const paginate = (requests: Request[], staffId: number) => {
    const currentPage = pagination[staffId]?.adhoc || 1;
    const startIndex = (currentPage - 1) * requestsPerPage;
    const endIndex = startIndex + requestsPerPage;
    return requests.slice(startIndex, endIndex);
  };

  const getTotalPages = (requests: Request[]) => {
    return requests.length > 0 ? Math.ceil(requests.length / requestsPerPage) : 1;
  };

  return (
    <>
      {employeeAdhocRequests.length > 0 && (
        <div className="mt-4">
          <hr className="my-4 border-t border-gray-300" />
          <h3 className="text-lg font-semibold text-primary">Adhoc Requests</h3>
          <table className="table-fixed w-full border-collapse mt-2">
            <thead>
              <tr className="bg-secondary text-text">
                <th className="w-1/5 px-4 py-2 text-left cursor-pointer" onClick={() => requestSort('dateRequested')}>
                  <BodyLarge className="text-primary">{isMobile ? getShortHeader('Date Requested') : 'Date Requested'} {getSortIcon('dateRequested')}</BodyLarge>
                </th>
                <th className="w-1/5 px-4 py-2 text-left cursor-pointer" onClick={() => requestSort('duration')}>
                  <BodyLarge className="text-primary">{isMobile ? getShortHeader('Duration') : 'Duration'} {getSortIcon('duration')}</BodyLarge>
                </th>
                <th className="w-1/5 px-4 py-2 text-left cursor-pointer" onClick={() => requestSort('dateOfRequest')}>
                  <BodyLarge className="text-primary">{isMobile ? getShortHeader('Date Of Request') : 'Date Of Request'} {getSortIcon('dateOfRequest')}</BodyLarge>
                </th>
                <th className="w-1/5 px-4 py-2 text-left cursor-pointer" onClick={() => requestSort('status')}>
                  <BodyLarge className="text-primary">{isMobile ? getShortHeader('Status') : 'Status'} {getSortIcon('status')}</BodyLarge>
                </th>
                <th className="w-1/5 px-4 py-2 text-left">
                  <BodyLarge className="text-primary">{isMobile ? getShortHeader('Action') : 'Action'}</BodyLarge>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginate(employeeAdhocRequests, employee.Staff_ID).map((request) => (
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
                  teamSize={employeeAdhocRequests.length}
                  onRefreshRequests={fetchRequests}
                  onRequestClick={handleRequestClick}
                  isMobile={isMobile}
                />
              ))}
            </tbody>
          </table>

          <div className="flex justify-center items-center mt-4 space-x-4">
            <button
              className="bg-primary text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={(pagination[employee.Staff_ID]?.adhoc || 1) === 1}
              onClick={() => handlePageChange(employee.Staff_ID, (pagination[employee.Staff_ID]?.adhoc || 1) - 1, 'adhoc')}
            >
              Previous
            </button>
            <span className="text-primary font-semibold">
              Page {(pagination[employee.Staff_ID]?.adhoc || 1)} of {getTotalPages(employeeAdhocRequests)}
            </span>
            <button
              className="bg-primary text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={paginate(employeeAdhocRequests, employee.Staff_ID).length < requestsPerPage}
              onClick={() => handlePageChange(employee.Staff_ID, (pagination[employee.Staff_ID]?.adhoc || 1) + 1, 'adhoc')}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdhocTable;
