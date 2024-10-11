import React from 'react';
import { Body } from '@/components/TextStyles'; // Use your TextStyles here
import ActionHandler from '@/components/history/actionHandler'; // Import the ActionHandler

interface RequestEntryProps {
  requestId: string;
  requestorId: string;
  approverId: string;
  status: string;
  dateRequested: string;
  requestBatch: string | null;
  dateOfRequest: string;
  duration: string;
  fetchRequests: () => void; // Include fetchRequests prop
}

const RequestEntry: React.FC<RequestEntryProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestorId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  approverId,
  status,
  dateRequested,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestBatch,
  dateOfRequest,
  duration,
  fetchRequests, // Destructure the fetchRequests prop
}) => {
  const statusColor = () => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-teal-100 text-teal-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'withdrawn':
        return 'bg-gray-200 text-gray-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'withdraw pending':
      case 'withdraw rejected':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <tr className="border-b">
      <td className="px-4 py-2">
        <Body className="text-text">{dateRequested}</Body>
      </td>
      <td className="px-4 py-2">
        <Body className="text-text">{duration}</Body>
      </td>
      <td className="px-4 py-2">
        <Body className="text-text">{dateOfRequest}</Body>
      </td>
      <td className={`px-4 py-2 ${statusColor()} font-semibold rounded-md`}>
        <Body>{status}</Body>
      </td>
      <td className="px-4 py-2">
        {/* Pass necessary props to ActionHandler */}
        <ActionHandler 
          requestId={requestId}
          employeeId={requestorId}
          status={status}
          dateRequested={dateRequested}
          onRefreshRequests={fetchRequests} // Pass fetchRequests to ActionHandler
        />
      </td>
    </tr>
  );
};

export default RequestEntry;
