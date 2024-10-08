import React from 'react';
import { Body } from '@/components/TextStyles'; // Use your TextStyles here
import ActionHandler from '@/components/history/actionHandler'; // Import the ActionHandler

interface RequestEntryProps {
  requestId: string;
  requestorId: string;
  approverId: string;
  status: string | undefined;
  dateRequested: string;
  requestBatch: string;
  dateOfRequest: string;
  duration: string;
}

const RequestEntry: React.FC<RequestEntryProps> = ({
  requestId,
  requestorId,
  approverId,
  status = 'unknown',
  dateRequested,
  requestBatch,
  dateOfRequest,
  duration,
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
        <ActionHandler status={status} dateRequested={dateRequested} />
      </td>
    </tr>
  );
};

export default RequestEntry;
