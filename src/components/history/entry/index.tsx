import React from 'react';
import { Body } from '@/components/TextStyles'; // Use your TextStyles here

interface RequestEntryProps {
  requestId: string;
  requestorId: string;
  approverId: string;
  status: string | undefined; // Allow status to be possibly undefined
  dateRequested: string; // Updated to use dateRequested for the withdraw check
  requestBatch: string;
  dateOfRequest: string;
  duration: string;
}

const RequestEntry: React.FC<RequestEntryProps> = ({
  requestId,
  requestorId,
  approverId,
  status = 'unknown', // Default to 'unknown' if status is undefined
  dateRequested,
  requestBatch,
  dateOfRequest,
  duration,
}) => {
  // Define status-specific styles for WFH requests
  const statusColor = () => {
    switch (status?.toLowerCase()) { // Use optional chaining to avoid errors
      case 'approved':
        return 'bg-teal-100 text-teal-700'; // Softer teal for approved
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'; // Subtle yellow for pending
      case 'withdrawn':
        return 'bg-gray-200 text-gray-700'; // Muted gray for withdrawn
      case 'rejected':
        return 'bg-red-100 text-red-700'; // Light red for rejected
      case 'withdraw pending':
      case 'withdraw rejected':
        return 'bg-orange-100 text-orange-700'; // Softer orange for withdrawal statuses
      default:
        return 'bg-gray-100 text-gray-600'; // Default to soft gray for other statuses
    }
  };

  // Helper function to check if current day is within 2 weeks before/after dateRequested
  const isWithinTwoWeeks = () => {
    const currentDate = new Date();
    const requestedDate = new Date(dateRequested);

    // Calculate two weeks before and after the requested date
    const twoWeeksBefore = new Date(requestedDate);
    twoWeeksBefore.setDate(requestedDate.getDate() - 14);

    const twoWeeksAfter = new Date(requestedDate);
    twoWeeksAfter.setDate(requestedDate.getDate() + 14);

    // Check if the current date is between two weeks before and two weeks after
    return currentDate >= twoWeeksBefore && currentDate <= twoWeeksAfter;
  };

  // Determine the button action based on the status
  const getActionButton = () => {
    switch (status?.toLowerCase()) {
      case 'approved':
        // Show the Withdraw button only if the current day is within the two-week range of dateRequested
        if (isWithinTwoWeeks()) {
          return (
            <button className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-4 rounded-md transition duration-200 ease-in-out">
              Withdraw
            </button>
          );
        }
        return null; // Do not show the button outside the two-week range
      case 'pending':
        return (
          <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-1 px-4 rounded-md transition duration-200 ease-in-out">
            Edit
          </button>
        );
      case 'withdrawn':
      case 'rejected':
      case 'withdraw pending':
      case 'withdraw rejected':
        return null; // No button for these statuses
      default:
        return null;
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
      {/* Apply conditional styling based on the status */}
      <td className={`px-4 py-2 ${statusColor()} font-semibold rounded-md`}>
        <Body>{status}</Body>
      </td>
      <td className="px-4 py-2">
        {/* Render the action button based on status */}
        {getActionButton()}
      </td>
    </tr>
  );
};

export default RequestEntry;
