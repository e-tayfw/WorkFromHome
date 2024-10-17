import React, { useState, useEffect } from 'react';
import { Body } from '@/components/TextStyles';
import axios from 'axios';
import ActionHandler from '@/components/approve/actionHandler';
import { Oval } from 'react-loader-spinner';

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
  onRefreshRequests: () => void; // Add the refresh prop
}

const ApproveEntry: React.FC<ApproveEntryProps> = ({
  requestId,
  requestorId,
  approverId,
  status,
  dateRequested,
  requestBatch,
  dateOfRequest,
  duration,
  teamSize,
  onRefreshRequests, // Pass this prop
}) => {
  const [proportion, setProportion] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [requestStatus] = useState(status);

  useEffect(() => {
    const fetchProportion = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8085/api/request/proportionOfTeam/${approverId}`);
        const proportions = response.data;
        const proportionForDateAndDuration = proportions[dateRequested]?.[duration] || 0;
        setProportion(proportionForDateAndDuration);
      } catch (err) {
        console.error('Error fetching team proportion:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProportion();
  }, [dateRequested, duration, approverId]);

  const willExceedProportion = () => {
    if (proportion === null || teamSize === 0) return false;
    const proportionPerEmployee = 1 / teamSize;
    return proportion + proportionPerEmployee > 0.5;
  };

  const proportionAfterApproval = () => {
    if (proportion === null || teamSize === 0) return null;
    const proportionPerEmployee = 1 / teamSize;
    return proportion + proportionPerEmployee;
  };

  const getStatusClass = () => {
    switch (requestStatus?.toLowerCase()) {
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
      <td className={`px-4 py-2 ${getStatusClass()} font-semibold rounded-md`}>
        <Body>{requestStatus}</Body>
      </td>
      <td className="px-4 py-2">
        {isLoading ? (
          <div className="flex justify-center items-center">
            <Oval
              height={30}
              width={30}
              color="#072040"
              visible={true}
              ariaLabel="oval-loading"
              secondaryColor="#a2b4cc"
              strokeWidth={6}
              strokeWidthSecondary={6}
            />
          </div>
        ) : (
          <ActionHandler
            requestId={requestId}
            requestorId={requestorId}
            dateRequested={dateRequested}
            requestBatch={requestBatch}
            duration={duration}
            status={requestStatus}
            onWithdraw={() => {
              onRefreshRequests(); // Refresh all data after withdrawal
            }}
            isDisabled={willExceedProportion()}
            proportionAfterApproval={proportionAfterApproval()}
            onRefreshRequests={onRefreshRequests} // Pass the refresh function to ActionHandler
          />
        )}
      </td>
    </tr>
  );
};

export default ApproveEntry;
