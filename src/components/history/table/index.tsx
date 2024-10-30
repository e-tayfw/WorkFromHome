import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { H1, BodyLarge } from "@/components/TextStyles";
import RequestEntry from "@/components/history/entry";
import axios from "axios";
// import Swal from 'sweetalert2';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import { RootState } from "@/redux/store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

// Interface for request data
interface Request {
  requestId: string;
  requestorId: string;
  approverId: string;
  status: string;
  dateRequested: string;
  requestBatch: string | null;
  dateOfRequest: string;
  duration: string;
}

// Constants for pagination
const REQUESTS_PER_PAGE = 5;

export const RequestTable: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Request;
    direction: string;
  } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1); // For pagination

  // Retrieve employeeId (staffId) from Redux store
  const employeeId = useSelector((state: RootState) => state.auth.staffId);

  const fetchRequests = useCallback(async () => {
    Swal.fire({
      title: "Loading...",
      html: "Please wait while we fetch your requests",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      if (!employeeId) {
        throw new Error("No employee ID found in session.");
      }

      const response = await axios.get(
        `http://127.0.0.1:8085/api/request/requestorId/${employeeId}`
      );

      const mappedRequests = response.data.map((item: any) => ({
        requestId: item.Request_ID,
        requestorId: item.Requestor_ID,
        approverId: item.Approver_ID,
        status: item.Status,
        dateRequested: item.Date_Requested,
        requestBatch: item.Request_Batch,
        dateOfRequest: new Date(item.created_at).toISOString().split("T")[0],
        duration: item.Duration,
      }));

      setRequests(mappedRequests);
      setLoading(false);

      // Close SweetAlert after loading
      Swal.close();

      // Show success toast notification
      toast.success("Requests loaded successfully!");
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load requests");
      setLoading(false);

      // Close SweetAlert after error
      Swal.close();

      // Show error toast notification
      toast.error("Failed to load requests, please try again!");
    }
  }, [employeeId]);

  const handleRequestClick = async (requestId: number) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8085/api/requestLog/requestId/${requestId}`
      );
      const logs = response.data;

      const logContent = logs
        .map(
          (log: any) => `
          <div>
            <strong>Date:</strong> ${log.Date}<br />
            <strong>Status:</strong> ${log.New_State}<br />
            <strong>Remarks:</strong> ${log.Remarks || "No remarks"}<br />
            ${
              log.Employee_ID === 0
                ? "<em>Change made by system</em><br />"
                : ""
            }<br />
          </div>
        `
        )
        .join("");

      Swal.fire({
        title: `Request #${requestId} Logs`,
        html: `<div style="text-align: left;">${logContent}</div>`,
        icon: "info",
        showCloseButton: true,
        confirmButtonText: "Close",
        confirmButtonColor: "#072040",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to load request logs. Please try again later.",
        icon: "error",
        confirmButtonText: "Close",
        confirmButtonColor: "#072040",
      });
    }
  };

  // Fetch requests when the component mounts
  useEffect(() => {
    fetchRequests();
  }, [employeeId, fetchRequests]);

  // Reset current page to 1 whenever the filter changes
  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filterStatus changes
  }, [filterStatus]);

  // Sort requests
  const sortedRequests = useMemo(() => {
    const sortableRequests = [...requests];
    if (sortConfig !== null) {
      sortableRequests.sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let aValue: any = a[sortConfig.key];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let bValue: any = b[sortConfig.key];

        // Handle sorting for date fields
        if (
          sortConfig.key === "dateRequested" ||
          sortConfig.key === "dateOfRequest"
        ) {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableRequests;
  }, [requests, sortConfig]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    if (filterStatus === "all") {
      return sortedRequests;
    }
    return sortedRequests.filter(
      (request) => request.status.toLowerCase() === filterStatus.toLowerCase()
    );
  }, [filterStatus, sortedRequests]);

  // Pagination logic
  const startIndex = (currentPage - 1) * REQUESTS_PER_PAGE;
  const currentRequests = filteredRequests.slice(
    startIndex,
    startIndex + REQUESTS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredRequests.length / REQUESTS_PER_PAGE);

  // Function to handle sorting
  const requestSort = (key: keyof Request) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Function to get the appropriate icon based on sort state
  const getSortIcon = (key: keyof Request) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} />;
    }
    if (sortConfig.direction === "ascending") {
      return <FontAwesomeIcon icon={faSortUp} />;
    }
    return <FontAwesomeIcon icon={faSortDown} />;
  };

  // Show empty state when no requests are available
  if (!loading && requests.length === 0) {
    return (
      <div className="flex">
        <H1 className="font-bold text-center">You have no requests!</H1>
      </div>
    );
  }

  return (
    <div className="container mx-[16px] lg:mx-auto p-4">
      <ToastContainer />
      <H1 className="mb-6 text-primary">My Requests</H1>

      {/* Filter Dropdown */}
      <div className="mb-6 flex items-center space-x-4">
        <label
          htmlFor="statusFilter"
          className="text-lg font-semibold text-primary"
        >
          Filter by Status:
        </label>
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
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700" />
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-col w-full">
        <div className="overflow-auto max-w-full">
          <table className="table-auto border-collapse w-full max-w-[900px] mx-auto">
            <thead>
              <tr className="bg-secondary text-text">
                <th
                  className="px-4 py-2 text-left cursor-pointer"
                  onClick={() => requestSort("dateRequested")}
                >
                  <BodyLarge className="text-primary">
                    Date {getSortIcon("dateRequested")}
                  </BodyLarge>
                </th>
                <th
                  className="px-4 py-2 text-left cursor-pointer"
                  onClick={() => requestSort("requestBatch")}
                >
                  <BodyLarge className="text-primary">
                    Request Batch {getSortIcon("requestBatch")}
                  </BodyLarge>
                </th>
                <th
                  className="px-4 py-2 text-left cursor-pointer"
                  onClick={() => requestSort("duration")}
                >
                  <BodyLarge className="text-primary">
                    Arrangement {getSortIcon("duration")}
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
                  data-testid="status-column"
                  onClick={() => requestSort("status")}
                >
                  <BodyLarge className="text-primary">
                    Status {getSortIcon("status")}
                  </BodyLarge>
                </th>
                <th className="px-4 py-2 text-left">
                  <BodyLarge className="text-primary">Action</BodyLarge>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentRequests.map((request, index) => (
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
                  fetchRequests={fetchRequests}
                  handleRequestClick={handleRequestClick}
                />
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}

          {/* Display loading spinner if data is loading */}
          {loading && (
            <div className="flex items-center justify-center mt-6">
              <BodyLarge className="text-primary">Loading...</BodyLarge>
            </div>
          )}

          {/* Error message display */}
          {error && (
            <div className="flex items-center justify-center mt-6">
              <BodyLarge className="text-red-500">{error}</BodyLarge>
            </div>
          )}
        </div>
        <div className="flex justify-center items-center w-full mt-6 space-x-4">
          <button
            className="bg-primary text-white py-2 px-4 rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
            data-testid="prev-button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span className="text-primary font-semibold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="bg-primary text-white py-2 px-4 rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={currentPage === totalPages || totalPages === 0}
            data-testid="next-button"
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestTable;
