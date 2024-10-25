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
  onRequestClick: (requestId: number) => void;
  isFirstPendingInBatch?: boolean;
  isLastPendingInBatch?: boolean;
  rowSpanCount?: number;
  isMobile?: boolean;

}

const ApproveEntry: React.FC<ApproveEntryProps> = ({
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
  isFirstPendingInBatch = false,
  isLastPendingInBatch = false,
  rowSpanCount = 1,
  isMobile = false,
}) => {
  const [proportion, setProportion] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [exceedProportionInBatch, setExceedProportionInBatch] = useState<boolean>(false);

  // List of statuses that don't require loading spinner or action buttons
  const excludedStatuses = ['rejected', 'withdrawn', 'withdrawn by manager', 'withdraw rejected'];

  useEffect(() => {
    // Reset the flag when the component loads, especially for new batches
    console.log('Component loaded or batch started. Resetting exceedProportionInBatch to false.');
    setExceedProportionInBatch(false);
  
    if (status.toLowerCase() === 'pending') {
      const fetchProportion = async () => {
        try {
          console.log(`Fetching proportion for approverId: ${approverId}`);
          const response = await axios.get(`http://127.0.0.1:8085/api/request/proportionOfTeam/${approverId}`);
          const proportions = response.data;
  
          // Logging the response
          console.log('Fetched proportions:', proportions);
  
          const proportionForDateAndDuration = proportions[dateRequested]?.[duration] || 0;
          console.log(`Proportion for date: ${dateRequested} and duration: ${duration} is:`, proportionForDateAndDuration);
          setProportion(proportionForDateAndDuration);
  
          // If this is the first pending request in the batch, start checking all pending requests in the batch
          if (isFirstPendingInBatch) {
            console.log('Checking if any request in the batch will exceed the allowed proportion.');
            let exceedFlag = false;
  
            // Loop over all the requests between the first and last pending requests in the batch
            for (let request of Object.keys(proportions)) {
              const proportionForRequest = proportions[request]?.[duration] || 0;
              setProportion(proportionForRequest); // Set the proportion for this request
  
              // Check if this request exceeds the proportion
              if (willExceedProportion()) {
                console.log(`Request ${request} exceeds the proportion limit.`);
                exceedFlag = true;
                break;
              }
  
              // Stop checking if we reach the last pending request in the batch
              if (isLastPendingInBatch) {
                console.log('Reached the last pending request in the batch. Stopping the check.');
                break;
              }
            }
  
            // Set the flag if any request in the batch exceeded the limit
            setExceedProportionInBatch(exceedFlag);
            console.log('ExceedProportionInBatch set to:', exceedFlag);
          }
        } catch (err) {
          console.error('Error fetching team proportion:', err);
        } finally {
          setIsLoading(false);
          console.log('Loading state set to false.');
        }
      };
  
      fetchProportion();
    } else {
      console.log('Request status is not pending. Setting loading to false.');
      setIsLoading(false);
    }
  
    // Cleanup and reset flag when the component unmounts or after the batch is processed
    return () => {
      console.log('Component unmounted or batch processed. Resetting exceedProportionInBatch to false.');
      setExceedProportionInBatch(false);
    };
  }, [dateRequested, duration, approverId, status, isFirstPendingInBatch, isLastPendingInBatch, teamSize]);
    

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
      case 'withdrawn by manager':
        return 'bg-purple-100 text-purple-700';
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

  const handleRowClick = () => {
    onRequestClick(requestId);
  };

  const isDateInRangeForWithdraw = () => {
    const requestDate = new Date(dateRequested);
    const currentDate = new Date();
  
    // Calculate the date one month back from requestDate
    const oneMonthBack = new Date(requestDate);
    oneMonthBack.setMonth(requestDate.getMonth() - 1);
  
    // Calculate the date three months forward from requestDate
    const threeMonthsForward = new Date(requestDate);
    threeMonthsForward.setMonth(requestDate.getMonth() + 3);
  
    // Check if the current date is within the range
    return currentDate >= oneMonthBack && currentDate <= threeMonthsForward;
  };

  const renderActionButtons = () => {
    const isApproved = status.toLowerCase() === 'approved';
    const isPending = status.toLowerCase() === 'pending';

    // Do not render action buttons for non-first pending rows in a batch
    if (!isFirstPendingInBatch && requestBatch && isPending) {
      return null;
    }

    const withdrawButton = isApproved && isDateInRangeForWithdraw() && (
      <button
        className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-4 rounded-md transition duration-200 ease-in-out"
        onClick={() => handleWithdraw(requestId)}
      >
        {getActionShortForm("Withdraw")}
      </button>
    );

    if (isPending && !requestBatch) {
      return (
        <>
          <button
            className={`bg-green-100 text-green-700 font-semibold py-1 px-4 rounded-md transition duration-200 ease-in-out mr-2 ${
              willExceedProportion() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-200'
            }`}
            onClick={handleApprove}
            disabled={willExceedProportion()}
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

    return withdrawButton || null;
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
    <tr className="border-b hover:bg-gray-100 cursor-pointer">
      <td className="px-4 py-2" onClick={handleRowClick}>
        <Body className="text-text">{dateRequested}</Body>
      </td>
      <td className="px-4 py-2" onClick={handleRowClick}>
        <Body className="text-text">{duration}</Body>
      </td>
      <td className="px-4 py-2" onClick={handleRowClick}>
        <Body className="text-text">{dateOfRequest}</Body>
      </td>
      <td className={`px-4 py-2 ${getStatusClass()} font-semibold rounded-md`} onClick={handleRowClick}>
        <Body>{getStatusShortForm(status)}</Body>
      </td>

      {(isFirstPendingInBatch || (status !== 'Pending') || (requestBatch === null)) &&
      !excludedStatuses.includes(status.toLowerCase()) ? (
        <td className="px-4 py-2" rowSpan={isFirstPendingInBatch ? rowSpanCount : undefined}>
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
      ) : null}
    </tr>
  );
};

export default ApproveEntry;
