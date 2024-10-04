import React, { useState, useEffect } from 'react';
import { Body } from '@/components/TextStyles';
import axios from 'axios';
import ActionHandler from '@/components/approve/actionHandler'; // Import ActionHandler

interface ApproveEntryProps {
  requestId: number;
  requestorName: string;
  requestorId: number;
  approverId: number;
  status: string;
  dateRequested: string;
  requestBatch: string | null;
  dateOfRequest: string;
  duration: string;
  teamSize: number;
  onApprove: (requestId: number) => void;
  onReject: (requestId: number) => void;
  onWithdraw: (requestId: number) => void;
}

const ApproveEntry: React.FC<ApproveEntryProps> = ({
  requestId,
  requestorName,
  requestorId,
  approverId,
  status,
  dateRequested,
  requestBatch,
  dateOfRequest,
  duration,
  teamSize,
  onApprove,
  onReject,
  onWithdraw,
}) => {
  const [proportion, setProportion] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch proportion for the specific duration and date
  useEffect(() => {
    const fetchProportion = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8085/api/request/proportionOfTeam/${approverId}`);
        const proportions = response.data;
        const proportionForDateAndDuration = proportions[dateRequested]?.[duration] || 0;
        setProportion(proportionForDateAndDuration); // Only set the proportion for that duration
      } catch (err) {
        console.error('Error fetching team proportion:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProportion(); // Fetch proportion regardless of whether the date is in the past or future
  }, [dateRequested, duration, approverId]);

  const willExceedProportion = () => {
    if (proportion === null || teamSize === 0) return false;
    const proportionPerEmployee = 1 / teamSize;
    return proportion + proportionPerEmployee > 0.5;
  };

  // Calculate proportion after approval for the specific duration
  const proportionAfterApproval = () => {
    if (proportion === null || teamSize === 0) return null;
    const proportionPerEmployee = 1 / teamSize;
    return proportion + proportionPerEmployee;
  };

  // Determine background color based on status
  const getStatusClass = () => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-teal-100 text-teal-700'; // Custom color for approved
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'; // Custom color for pending
      case 'withdrawn':
        return 'bg-gray-200 text-gray-700'; // Custom color for withdrawn
      case 'rejected':
        return 'bg-red-100 text-red-700'; // Custom color for rejected
      case 'withdraw pending':
      case 'withdraw rejected':
        return 'bg-orange-100 text-orange-700'; // Custom color for withdraw pending or rejected
      default:
        return 'bg-gray-100 text-gray-600'; // Default color
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
      {/* Apply the dynamic background color based on the status */}
      <td className={`px-4 py-2 ${getStatusClass()} font-semibold rounded-md`}>
        <Body>{status}</Body>
      </td>
      <td className="px-4 py-2">
        {isLoading ? (
          <Body className="text-text">Loading...</Body>
        ) : (
          <ActionHandler
            requestId={requestId}
            requestorId={requestorId}
            dateRequested={dateRequested}
            dateOfRequest={dateOfRequest}
            requestBatch={requestBatch}
            duration={duration}
            status={status}
            createdAt={new Date().toISOString()}
            updatedAt={new Date().toISOString()}
            onWithdraw={onWithdraw}
            isDisabled={willExceedProportion()}
            proportionAfterApproval={proportionAfterApproval()} // Always pass the specific proportion for that duration
          />
        )}
      </td>
    </tr>
  );
};

export default ApproveEntry;
