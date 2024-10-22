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
  onRefreshRequests: () => void;
  isFirstPendingInBatch?: boolean; // Prop to identify the first pending request in batch
  rowSpanCount?: number; // Number of rows to span for pending requests in the batch
  isMobile?: boolean; // Add this prop to handle mobile rendering
}

const ApproveEntry: React.FC<ApproveEntryProps> = ({
  requestId,
  requestorName,
  approverId,
  status,
  dateRequested,
  requestBatch,
  dateOfRequest,
  duration,
  teamSize,
  onRefreshRequests,
  isFirstPendingInBatch = false, // Default to false
  rowSpanCount = 1, // Default row span count for adhoc requests
  isMobile = false, // Default to non-mobile view
}) => {
  const [proportion, setProportion] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to check if today is within 1 month back and 3 months forward of dateRequested
  const isWithinWithdrawWindow = () => {
    const currentDate = new Date();
    const requestDate = new Date(dateRequested);

    const oneMonthBack = new Date(requestDate);
    oneMonthBack.setMonth(requestDate.getMonth() - 1);

    const threeMonthsForward = new Date(requestDate);
    threeMonthsForward.setMonth(requestDate.getMonth() + 3);

    return currentDate >= oneMonthBack && currentDate <= threeMonthsForward;
  };

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
    if (proportion === null || teamSize === 0) return 0;
    const proportionPerEmployee = 1 / teamSize;
    return proportion + proportionPerEmployee;
  };

  // Maintain colors based on the request status
  const getStatusClass = () => {
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

  const getStatusShortForm = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'approved': 'App.',
      'pending': 'Pen.',
      'rejected': 'Rej.',
      'withdrawn': 'Wdn.',
      'withdrawn by manager': 'WbM',
    };
    return isMobile ? statusMap[status.toLowerCase()] || status : status;
  };

  const getActionShortForm = (action: string) => {
    const actionMap: { [key: string]: string } = {
      'Approve': 'App',
      'Reject': 'Rej',
      'Withdraw': 'WD',
      'Approve All': 'App all',
      'Reject All': 'Rej all'
    };
    return isMobile ? actionMap[action] || action : action;
  };

  const renderActionButtons = () => {
    const isApproved = status.toLowerCase() === 'approved';
    const isPending = status.toLowerCase() === 'pending';

    // Withdraw button logic for 'approved' requests, only shown if within withdraw window
    const withdrawButton = isApproved && isWithinWithdrawWindow() && (
      <button
        className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-4 rounded-md transition duration-200 ease-in-out"
        onClick={() => handleWithdraw(requestId)}
      >
        {getActionShortForm("Withdraw")}
      </button>
    );

    // Approve and Reject buttons for individual pending requests
    if (isPending && !requestBatch) {
      return (
        <>
          <button
            className="bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-1 px-4 rounded-md transition duration-200 ease-in-out mr-2"
            onClick={handleApprove}
          >
            {getActionShortForm("Approve")}
          </button>
          <button
            className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-4 rounded-md transition duration-200 ease-in-out"
            onClick={handleReject}
          >
            {getActionShortForm("Reject")}
          </button>
        </>
      );
    }

    // Approve All and Reject All buttons for batch requests (if isFirstPendingInBatch is true)
    if (isFirstPendingInBatch) {
      return (
        <>
          <button
            className={`bg-green-100 text-green-700 font-semibold py-1 px-4 rounded-md transition duration-200 ease-in-out mr-2 ${
              willExceedProportion() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-200'
            }`}
            onClick={handleApproveAll}
            disabled={willExceedProportion()}
          >
            {getActionShortForm("Approve All")}
          </button>
          <button
            className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-4 rounded-md transition duration-200 ease-in-out"
            onClick={handleRejectAll}
          >
            {getActionShortForm("Reject All")}
          </button>
        </>
      );
    }

    return withdrawButton || null; // Return the withdraw button if approved, else null
  };

  const handleApprove = () => {
    ActionHandler.handleApprove({
      requestId,
      approverId,
      dateRequested,
      requestBatch,
      duration,
      proportionAfterApproval: proportionAfterApproval(),
      onRefreshRequests,
    });
  };

  const handleReject = () => {
    ActionHandler.handleReject({
      requestId,
      approverId,
      dateRequested,
      requestBatch,
      duration,
      onRefreshRequests,
    });
  };

  const handleWithdraw = (requestId: number) => {
    ActionHandler.handleWithdraw({
      requestId,
      managerId: approverId,
      onWithdraw: onRefreshRequests,
    });
  };

  const handleApproveAll = () => {
    ActionHandler.handleApproveBatch({
      requestBatch: requestBatch!,
      approverId,
      duration, 
      proportionAfterApproval: proportionAfterApproval(),
      onRefreshRequests,
    });
  };

  const handleRejectAll = () => {
    ActionHandler.handleRejectBatch({
      requestBatch: requestBatch!,
      approverId,
      onRefreshRequests,
    });
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
        <Body>{getStatusShortForm(status)}</Body>
      </td>

      {/* Render Approve/Reject/Withdraw buttons in the same action column */}
      {isFirstPendingInBatch ? (
        <td className="px-4 py-2" rowSpan={rowSpanCount}>
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
            renderActionButtons()
          )}
        </td>
      ) : (
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
            renderActionButtons()
          )}
        </td>
      )}
    </tr>
  );
};

export default ApproveEntry;
