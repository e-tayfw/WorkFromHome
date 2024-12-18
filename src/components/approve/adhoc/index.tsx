// AdhocTable.tsx
import React from "react";
import ApproveEntry from "@/components/approve/adhocentry";
import { Body } from "@/components/TextStyles";

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
  handlePageChange: (
    staffId: number,
    newPage: number,
    type: "recurring" | "adhoc"
  ) => void;
  requestSort: (key: keyof Request) => void;
  getSortIcon: (key: keyof Request) => JSX.Element;
  fetchRequests: () => void;
  handleRequestClick: (requestId: number) => void;
  isMobile: boolean;
  getShortHeader: (fullHeader: string) => string;
  teamSize: number;
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
  getShortHeader,
  teamSize,
}) => {
  const paginate = (requests: Request[], staffId: number) => {
    const currentPage = pagination[staffId]?.adhoc || 1;
    const startIndex = (currentPage - 1) * requestsPerPage;
    const endIndex = startIndex + requestsPerPage;
    return {
      paginated: requests.slice(startIndex, endIndex),
      endIndex,
      startIndex,
    };
  };

  const getTotalPages = (requests: Request[]) => {
    return requests.length > 0
      ? Math.ceil(requests.length / requestsPerPage)
      : 1;
  };

  const totalRequests = employeeAdhocRequests.length; // Total number of requests

  return (
    <>
      {totalRequests > 0 && (
        <div className="mt-4">
          <hr className="my-4 border-t border-gray-300" />
          <h3 className="text-lg font-semibold text-primary">Adhoc Requests</h3>
          <div className="flex flex-col w-full">
            <div className="overflow-x-auto max-w-full">
            <table className="lg:table-fixed w-full border-collapse mt-2">

                <thead>
                  <tr className="bg-secondary text-text">
                    <th
                      className="w-1/5 px-4 py-2 text-left cursor-pointer"
                      onClick={() => requestSort("dateRequested")}
                    >
                      <Body className="text-primary">Date Requested{getSortIcon('dateRequested')}</Body>
                    </th>
                    <th
                      className="w-1/5 px-4 py-2 text-left cursor-pointer"
                      onClick={() => requestSort("duration")}
                    >
                      <Body className="text-primary">
                        Duration
                        {getSortIcon("duration")}
                      </Body>
                    </th>
                    <th
                      className="w-1/5 px-4 py-2 text-left cursor-pointer"
                      onClick={() => requestSort("dateOfRequest")}
                    >
                      <Body className="text-primary">
                        Date of Request
                        {getSortIcon("dateOfRequest")}
                      </Body>
                    </th>
                    <th
                      className="w-1/5 px-4 py-2 text-left cursor-pointer"
                      onClick={() => requestSort("status")}
                    >
                      <Body className="text-primary">
                        {isMobile ? getShortHeader("Status") : "Status"}{" "}
                        {getSortIcon("status")}
                      </Body>
                    </th>
                    <th className="w-1/5 px-4 py-2 text-left">
                      <Body className="text-primary">Action </Body>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(
                    employeeAdhocRequests,
                    employee.Staff_ID
                  ).paginated.map((request) => (
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
                      isMobile={isMobile}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-center items-center mt-4 space-x-4">
            <button
              className="bg-primary text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={(pagination[employee.Staff_ID]?.adhoc || 1) === 1}
              onClick={() =>
                handlePageChange(
                  employee.Staff_ID,
                  (pagination[employee.Staff_ID]?.adhoc || 1) - 1,
                  "adhoc"
                )
              }
            >
              Previous
            </button>
            <span className="text-primary font-semibold">
              Page {pagination[employee.Staff_ID]?.adhoc || 1} of{" "}
              {getTotalPages(employeeAdhocRequests)}
            </span>
            <button
              className="bg-primary text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={
                paginate(employeeAdhocRequests, employee.Staff_ID).endIndex >=
                totalRequests
              }
              onClick={() =>
                handlePageChange(
                  employee.Staff_ID,
                  (pagination[employee.Staff_ID]?.adhoc || 1) + 1,
                  "adhoc"
                )
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

export default AdhocTable;
