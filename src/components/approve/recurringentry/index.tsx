import React, { useEffect, useState } from 'react';
import { Body } from '@/components/TextStyles';
import ActionHandler from '@/components/approve/actionHandler';
import { Oval } from 'react-loader-spinner';
import axios from 'axios';

interface ApproveRecurringEntryProps {
  pendingRequests: Array<{
    requestId: number;
    approverId: number;
    dateRequested: string;
    requestBatch: string | null;
    dateOfRequest: string;
    duration: string;
  }>;
  nonPendingRequests: Array<{
    requestId: number;
    approverId: number;
    dateRequested: string;
    requestBatch: string | null;
    dateOfRequest: string;
    duration: string;
    status: string;
  }>;
  teamSize: number;
  onRefreshRequests: () => void;
  onRequestClick: (requestId: number) => void;
  isMobile?: boolean;
}

const ApproveRecurringEntry: React.FC<ApproveRecurringEntryProps> = ({
  pendingRequests,
  nonPendingRequests,
  teamSize,
  onRefreshRequests,
  onRequestClick,
  isMobile = false,
}) => {
  const [proportion, setProportion] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [exceedingRequests, setExceedingRequests] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchProportion = async () => {
      if (pendingRequests.length === 0) return;
      try {
        setIsLoading(true);
        const approverId = pendingRequests[0].approverId;
        const response = await axios.get(`http://127.0.0.1:8085/api/request/proportionOfTeam/${approverId}`);
        const proportions = response.data;

        const newExceedingRequests = new Set<number>();
        for (const request of pendingRequests) {
        const requestDate = new Date(request.dateRequested);
        requestDate.setHours(0, 0, 0, 0); // Set time to midnight
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set time to midnight
          const isFutureRequest = requestDate >= currentDate;

          const proportionForRequest = proportions[request.dateRequested]?.[request.duration] || 0;
          setProportion(proportionForRequest);

          if (isFutureRequest && proportionForRequest + 1 / teamSize > 0.5) {
            newExceedingRequests.add(request.requestId);
          }
        }
        setExceedingRequests(newExceedingRequests);
      } catch (err) {
        console.error('Error fetching team proportion:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProportion();
  }, [pendingRequests, teamSize]);

  const isDateInRangeForWithdraw = (dateRequested: string) => {
    const requestDate = new Date(dateRequested);
    const currentDate = new Date();

    const oneMonthBack = new Date(requestDate);
    oneMonthBack.setMonth(requestDate.getMonth() - 1);

    const threeMonthsForward = new Date(requestDate);
    threeMonthsForward.setMonth(requestDate.getMonth() + 3);

    return currentDate >= oneMonthBack && currentDate <= threeMonthsForward;
  };

  const renderRequestRow = (request: any, isPending: boolean, isFirstPending: boolean) => {
    const requestDate = new Date(request.dateRequested);
    const currentDate = new Date();
    const isFutureRequest = requestDate > currentDate;
    const isExceeding = exceedingRequests.has(request.requestId);
    const rowClass = isExceeding ? 'bg-red-100' : '';

    return (
      <tr
        key={request.requestId}
        className={`border-b hover:bg-gray-100 cursor-pointer ${rowClass}`}
      >
        <td
          className="px-4 py-2"
          onClick={() => onRequestClick(request.requestId)}
          title="Click to view request log"
        >
          <Body>{request.dateRequested}</Body>
        </td>
        <td
          className="px-4 py-2"
          onClick={() => onRequestClick(request.requestId)}
          title="Click to view request log"
        >
          <Body>{request.duration}</Body>
        </td>
        <td
          className="px-4 py-2"
          onClick={() => onRequestClick(request.requestId)}
          title="Click to view request log"
        >
          <Body>{request.dateOfRequest}</Body>
        </td>
        <td
          className={`px-4 py-2 ${getStatusClass(request.status)} font-semibold rounded-md`}
          onClick={() => onRequestClick(request.requestId)}
          title="Click to view request log"
        >
          <Body>{isMobile ? getStatusShortForm(request.status) : request.status}</Body>
        </td>
        {isPending && isLoading && isFirstPending && (
          <td className="px-4 py-2" rowSpan={pendingRequests.length}>
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
          </td>
        )}
        {isPending && !isLoading && isFirstPending && renderPendingActionButtons(isFutureRequest)}
        {!isPending && renderNonPendingActionButtons(request)}
      </tr>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderPendingActionButtons = (isFutureRequest: boolean) => (
    <td
      className="px-4 py-2 text-center"
      rowSpan={pendingRequests.length}
      title={exceedingRequests.size > 0 ? 'Proportion of staff working from home for days highlighted in red, will exceed 50% if accepted' : ''}
    >
      <button
        className={`bg-green-100 text-green-700 font-semibold py-1 px-4 rounded-md ${
          exceedingRequests.size ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-200'
        }`}
        onClick={handleApproveAll}
        disabled={exceedingRequests.size > 0}
      >
        <Body>Approve All</Body>
      </button>
      <button
        className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-4 rounded-md ml-2"
        onClick={handleRejectAll}
      >
        <Body>Reject All</Body>
      </button>
    </td>
  );

  const renderNonPendingActionButtons = (request: any) => {
    if (request.status.toLowerCase() === 'approved' && isDateInRangeForWithdraw(request.dateRequested)) {
      return (
        <td className="px-4 py-2 text-center">
          <button
            className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-4 rounded-md"
            onClick={() => handleWithdraw(request.requestId, request.approverId)}
          >
            <Body>Withdraw</Body>
          </button>
        </td>
      );
    } else if (['rejected', 'withdrawn by manager', 'withdraw rejected', 'withdrawn'].includes(request.status.toLowerCase())) {
      return <td className="px-4 py-2" />;
    } else if (request.status.toLowerCase() === 'withdraw pending') {
      return (
        <td className="px-4 py-2 text-center">
          <button
            className="bg-green-100 text-green-700 font-semibold py-1 px-4 rounded-md mr-2 hover:bg-green-200"
            onClick={() => handleApprove(request)}
          >
            <Body>Approve</Body>
          </button>
          <button
            className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-4 rounded-md"
            onClick={() => handleReject(request)}
          >
            <Body>Reject</Body>
          </button>
        </td>
      );
    }
    return null;
  };

  const handleApproveAll = () => {
    ActionHandler.handleApproveBatch({
      requestBatch: pendingRequests[0].requestBatch!,
      approverId: pendingRequests[0].approverId,
      duration: pendingRequests[0].duration,
      proportionAfterApproval: (proportion ?? 0) + pendingRequests.length / teamSize,
      onRefreshRequests,
    });
  };

  const handleRejectAll = () => {
    ActionHandler.handleRejectBatch({
      requestBatch: pendingRequests[0].requestBatch!,
      approverId: pendingRequests[0].approverId,
      onRefreshRequests,
    });
  };

  const handleApprove = (request: any) => {
    ActionHandler.handleApprove({
      requestId: request.requestId,
      approverId: request.approverId,
      dateRequested: request.dateRequested,
      requestBatch: request.requestBatch,
      duration: request.duration,
      proportionAfterApproval: proportion,
      onRefreshRequests,
      status: request.status,
    });
  };

  const handleReject = (request: any) => {
    ActionHandler.handleReject({
      requestId: request.requestId,
      approverId: request.approverId,
      dateRequested: request.dateRequested,
      requestBatch: request.requestBatch,
      duration: request.duration,
      onRefreshRequests,
      status: request.status,
    });
  };

  const handleWithdraw = (requestId: number, managerId: number) => {
    ActionHandler.handleWithdraw({
      requestId,
      managerId,
      onWithdraw: onRefreshRequests,
    });
  };

  const getStatusClass = (status: string) => {
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

  const getStatusShortForm = (status: string) => {
    const statusMap: { [key in 'approved' | 'pending' | 'rejected' | 'withdrawn' | 'withdraw pending' | 'withdraw rejected' | 'withdrawn by manager']: string } = {
      approved: 'Approved',
      pending: 'Pending',
      rejected: 'Rejected',
      withdrawn: 'Withdrawn',
      'withdraw pending': 'Withdraw Pening',
      'withdraw rejected': 'Withdraw Rejected',
      'withdrawn by manager': 'Withdrawn by Manager',
    };
    return isMobile ? statusMap[status.toLowerCase() as keyof typeof statusMap] || status : status;
  };

  return (
    <>
      {pendingRequests.map((request, index) =>
        renderRequestRow(request, true, index === 0)
      )}
      {nonPendingRequests.map((request) =>
        renderRequestRow(request, false, false)
      )}
    </>
  );
};

export default ApproveRecurringEntry;
