import React, { useState, useEffect } from 'react';
import { Body } from '@/components/TextStyles';
import axios from 'axios';
import ActionHandler from '@/components/approve/actionHandler';
import { Oval } from 'react-loader-spinner';

interface AdhocApproveEntryProps {
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
  onRequestClick: (requestId: number) => void;
  isMobile?: boolean;
}

const AdhocApproveEntry: React.FC<AdhocApproveEntryProps> = ({
  requestId,
  approverId,
  status,
  dateRequested,
  dateOfRequest,
  requestBatch,
  duration,
  teamSize,
  onRefreshRequests,
  onRequestClick,
  isMobile = false,
}) => {
  const [proportion, setProportion] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const excludedStatuses = ['rejected', 'withdrawn', 'withdrawn by manager', 'withdraw rejected'];

  useEffect(() => {
    if (status.toLowerCase() === 'pending' || status.toLowerCase() === 'withdraw pending') {
      const fetchProportion = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:8085/api/request/proportionOfTeam/${approverId}`);
          const proportions = response.data;
          setProportion(proportions[dateRequested]?.[duration] || 0);
        } catch (err) {
          console.error('Error fetching team proportion:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProportion();
    } else {
      setIsLoading(false);
    }
  }, [dateRequested, duration, approverId, status, teamSize]);

  const willExceedProportion = () => {
    return (proportion ?? 0) + 1 / teamSize > 0.5;
  };

  const proportionAfterApproval = () => {
    return (proportion ?? 0) + 1 / teamSize;
  };

  const isDateInRangeForWithdraw = () => {
    const requestDate = new Date(dateRequested);
    const currentDate = new Date();
  
    const oneMonthBack = new Date(requestDate);
    oneMonthBack.setMonth(requestDate.getMonth() - 1);
  
    const threeMonthsForward = new Date(requestDate);
    threeMonthsForward.setMonth(requestDate.getMonth() + 3);
  
    return currentDate >= oneMonthBack && currentDate <= threeMonthsForward;
  };

  const getStatusClass = () => {
    switch (status.toLowerCase()) {
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
      case 'withdrawn by manager':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusShortForm = () => {
    const statusMap: { [key in 'approved' | 'pending' | 'rejected' | 'withdrawn' | 'withdraw pending' | 'withdraw rejected' | 'withdrawn by manager']: string } = {
      approved: 'App.',
      pending: 'Pen.',
      rejected: 'Rej.',
      withdrawn: 'Wdn.',
      'withdraw pending': 'W Pen',
      'withdraw rejected': 'W Rej',
      'withdrawn by manager': 'WbM',
    };
    return isMobile ? statusMap[status.toLowerCase() as keyof typeof statusMap] || status : status;
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
      status,
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
      status,
    });
  };

  const handleWithdraw = () => {
    ActionHandler.handleWithdraw({
      requestId,
      managerId: approverId,
      onWithdraw: onRefreshRequests,
    });
  };

  const handleRowClick = () => {
    onRequestClick(requestId);
  };

  const renderActionButtons = () => {
    const requestDate = new Date(dateRequested);
    requestDate.setHours(0, 0, 0, 0); // Set requestDate to midnight
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set currentDate to midnight
    const isFutureRequest = requestDate >= currentDate;
  
    if (status.toLowerCase() === 'approved' && isDateInRangeForWithdraw()) {
      return (
        <button
          className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-4 rounded-md"
          onClick={handleWithdraw}
        >
          Withdraw
        </button>
      );
    } else if (status.toLowerCase() === 'pending' || status.toLowerCase() === 'withdraw pending') {
      return (
        <>
          <button
            className={`bg-green-100 text-green-700 font-semibold py-1 px-4 rounded-md ${
              isFutureRequest && status.toLowerCase() === 'pending' && willExceedProportion() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-200'
            }`}
            onClick={handleApprove}
            disabled={isFutureRequest && status.toLowerCase() === 'pending' && willExceedProportion()}
            title={
              isFutureRequest && status.toLowerCase() === 'pending' && willExceedProportion()
                ? 'Proportion of staff working from home will exceed 50% if accepted'
                : ''
            }
          >
            Approve
          </button>
          <button
            className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-4 rounded-md ml-2"
            onClick={handleReject}
          >
            Reject
          </button>
        </>
      );
    }
    return null; 
  };

  return (
    <tr className="border-b hover:bg-gray-100 cursor-pointer" title="Click to view request log">
  <td className="px-4 py-2" onClick={handleRowClick}>
    <Body>{dateRequested}</Body>
  </td>
  <td className="px-4 py-2" onClick={handleRowClick} title="Click to view request log">
    <Body>{duration}</Body>
  </td>
  <td className="px-4 py-2" onClick={handleRowClick} title="Click to view request log">
    <Body>{dateOfRequest}</Body>
  </td>
  <td
    className={`px-4 py-2 ${getStatusClass()} font-semibold rounded-md`}
    onClick={handleRowClick}
    title="Click to view request log"
  >
    <Body>{getStatusShortForm()}</Body>
  </td>
  {!excludedStatuses.includes(status.toLowerCase()) && (
    <td className="px-4 py-2" title="Click to view request log">
      {isLoading ? (
        <div className="flex justify-center">
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

export default AdhocApproveEntry;
