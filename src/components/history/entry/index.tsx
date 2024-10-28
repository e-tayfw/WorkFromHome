import React from 'react';
import { Body } from '@/components/TextStyles'; // Use your TextStyles here
import ActionHandler from '@/components/history/actionHandler'; // Import the ActionHandler

interface RequestEntryProps {
  requestId: string;
  requestorId: string;
  approverId: string;
  status: string | undefined;
  dateRequested: string;
  requestBatch: string | null;
  dateOfRequest: string;
  duration: string;
  fetchRequests: () => void; // Include fetchRequests prop
  handleRequestClick: (requestId: number) => void;
}

const RequestEntry: React.FC<RequestEntryProps> = ({
  requestId,
  requestorId,
  approverId,
  status,
  dateRequested,
  handleRequestClick,
  requestBatch,
  dateOfRequest,
  duration,
  fetchRequests, // Destructure the fetchRequests prop
}) => {
  // Compute display status
  const displayStatus =
    status?.toLowerCase() === "withdraw rejected" ? "Approved" : status;

  const statusColor = () => {
    switch (displayStatus?.toLowerCase()) {
      case "approved":
        return "bg-teal-100 text-teal-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "withdrawn":
        return "bg-gray-200 text-gray-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "withdraw pending":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleRowClick = () => {
    handleRequestClick(Number(requestId));
  };

  return (
  <tr
    className="border-b hover:bg-gray-100 cursor-pointer" title="Click to view request log">
    <td className="px-4 py-2" onClick={handleRowClick}>
      <Body className="text-text">{dateRequested}</Body>
    </td>
    <td className="px-4 py-2" onClick={handleRowClick}>
      <Body className="text-text">{requestBatch || "AdHoc"}</Body>
    </td>
    <td className="px-4 py-2" onClick={handleRowClick}>
      <Body className="text-text">{duration}</Body>
    </td>
    <td className="px-4 py-2" onClick={handleRowClick}>
      <Body className="text-text">{dateOfRequest}</Body>
    </td>
    <td className={`px-4 py-2 ${statusColor()} font-semibold rounded-md`} onClick={handleRowClick}>
      <Body>{status}</Body>
    </td>
    <td className="px-4 py-2">
      <ActionHandler
        requestId={requestId}
        employeeId={requestorId}
        status={status}
        dateRequested={dateRequested}
        onRefreshRequests={fetchRequests}
      />
    </td>
  </tr>
  );
};

export default RequestEntry;
