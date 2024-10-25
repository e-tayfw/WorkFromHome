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

interface RecurringTableProps {
  employeeRequests: any;
  employee: any;
  pagination: any;
  handlePageChange: (staffId: number, newPage: number, type: 'recurring' | 'adhoc') => void;
  fetchRequests: () => void;
  handleRequestClick: (requestId: number) => void;
  isMobile: boolean;
  getShortHeader: (fullHeader: string) => string;
  teamSize: number;
}

const RecurringTable: React.FC<RecurringTableProps> = ({
  employeeRequests,
  employee,
  pagination,
  handlePageChange,
  fetchRequests,
  handleRequestClick,
  isMobile,
  getShortHeader,
  teamSize,
}) => {
  const batchesPerPage = 2; // Maximum number of batch requests per page

  const paginateBatches = (batches: string[], staffId: number) => {
    const currentPage = pagination[staffId]?.recurring || 1;
    const startIndex = (currentPage - 1) * batchesPerPage;
    const endIndex = startIndex + batchesPerPage;
    return { paginated: batches.slice(startIndex, endIndex), endIndex, startIndex };
  };

  const getTotalPages = (batches: string[]) => {
    return batches.length > 0 ? Math.ceil(batches.length / batchesPerPage) : 1;
  };

  const groupedRequests = employeeRequests;
  const totalBatches = Object.keys(groupedRequests).length; // Total number of batches

  return (
    <>
      {totalBatches > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-primary">Recurring Requests</h3>
          <table className="table-fixed w-full border-collapse mt-2">
            <thead>
              <tr className="bg-secondary text-text">
                <th className="w-1/5 px-4 py-2 text-left">
                  <BodyLarge className="text-primary">
                    {isMobile ? getShortHeader('Date Requested') : 'Date Requested'}
                  </BodyLarge>
                </th>
                <th className="w-1/5 px-4 py-2 text-left">
                  <BodyLarge className="text-primary">
                    {isMobile ? getShortHeader('Duration') : 'Duration'}
                  </BodyLarge>
                </th>
                <th className="w-1/5 px-4 py-2 text-left">
                  <BodyLarge className="text-primary">
                    {isMobile ? getShortHeader('Date Of Request') : 'Date Of Request'}
                  </BodyLarge>
                </th>
                <th className="w-1/5 px-4 py-2 text-left">
                  <BodyLarge className="text-primary">{isMobile ? getShortHeader('Status') : 'Status'}</BodyLarge>
                </th>
                <th className="w-1/5 px-4 py-2 text-left">
                  <BodyLarge className="text-primary">{isMobile ? getShortHeader('Action') : 'Action'}</BodyLarge>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginateBatches(Object.keys(groupedRequests), employee.Staff_ID).paginated.map((batchNumber) => {
                const requestsInBatch = groupedRequests[batchNumber];
                const pendingRequestsInBatch = requestsInBatch.filter(
                  (request: { status: string }) => request.status.toLowerCase() === 'pending'
                );
                const lastPendingIndex = pendingRequestsInBatch.length - 1; // Get the index of the last pending request

                return (
                  <React.Fragment key={`batch-${batchNumber}`}>
                    <tr>
                      <td colSpan={5} className="bg-gray-200 text-center font-semibold py-2">
                        Batch: {batchNumber}
                      </td>
                    </tr>

                    {requestsInBatch.map((request: Request, index: number) => {
                      const isPending = request.status.toLowerCase() === 'pending';
                      let isFirstPendingInBatch = false;
                      let isLastPendingInBatch = false;

                      // Set isFirstPendingInBatch to true for the first pending request in the batch
                      if (isPending && index === 0) {
                        isFirstPendingInBatch = true;
                      }

                      // Set isLastPendingInBatch to true for the last pending request in the batch
                      if (isPending && index === lastPendingIndex) {
                        isLastPendingInBatch = true;
                      }

                      const rowSpanCount = pendingRequestsInBatch.length;

                      return (
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
                          teamSize={teamSize}
                          onRefreshRequests={fetchRequests}
                          onRequestClick={handleRequestClick}
                          isFirstPendingInBatch={isFirstPendingInBatch}
                          isLastPendingInBatch={isLastPendingInBatch}
                          rowSpanCount={isFirstPendingInBatch ? rowSpanCount : undefined} // Set row span for first pending request
                          isMobile={isMobile}
                        />
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-center items-center mt-4 space-x-4">
            <button
              className="bg-primary text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={(pagination[employee.Staff_ID]?.recurring || 1) === 1}
              onClick={() =>
                handlePageChange(employee.Staff_ID, (pagination[employee.Staff_ID]?.recurring || 1) - 1, 'recurring')
              }
            >
              Previous
            </button>
            <span className="text-primary font-semibold">
              Page {(pagination[employee.Staff_ID]?.recurring || 1)} of {getTotalPages(Object.keys(groupedRequests))}
            </span>
            <button
              className="bg-primary text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={
                paginateBatches(Object.keys(groupedRequests), employee.Staff_ID).endIndex >= totalBatches
              }
              onClick={() =>
                handlePageChange(employee.Staff_ID, (pagination[employee.Staff_ID]?.recurring || 1) + 1, 'recurring')
              }
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RecurringTable;
