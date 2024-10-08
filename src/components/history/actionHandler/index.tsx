import React from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

interface ActionHandlerProps {
  status: string | undefined;
  dateRequested: string;
  requestId: string;
  employeeId: string;
}

const ActionHandler: React.FC<ActionHandlerProps> = ({ status, dateRequested, requestId, employeeId }) => {
  const isWithinTwoWeeks = () => {
    const currentDate = new Date();
    const requestedDate = new Date(dateRequested);

    const twoWeeksBefore = new Date(requestedDate);
    twoWeeksBefore.setDate(requestedDate.getDate() - 14);

    const twoWeeksAfter = new Date(requestedDate);
    twoWeeksAfter.setDate(requestedDate.getDate() + 14);

    return currentDate >= twoWeeksBefore && currentDate <= twoWeeksAfter;
  };

  const handleWithdraw = () => {
    Swal.fire({
      title: 'Please indicate a reason',
      input: 'text',
      inputPlaceholder: 'Enter your reason here...',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#072040',
      cancelButtonColor: '#a2b4cc',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to provide a reason!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const reason = result.value;
        // Make API call to withdraw request
        axios.post('http://127.0.0.1:8085/api/request/withdraw', {
          Request_ID: requestId,
          Employee_ID: employeeId,
          Reason: reason,
        })
        .then(() => {
          toast.success('The request has been withdrawn successfully!', {
            position: 'top-right',
          });
        })
        .catch(() => {
          toast.error('An error occurred while withdrawing the request.', {
            position: 'top-right',
          });
        });
      }
    });
  };

  const getActionButton = () => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'withdraw rejected':
        if (isWithinTwoWeeks()) {
          return (
            <button
              onClick={handleWithdraw}
              className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-4 rounded-md transition duration-200 ease-in-out"
            >
              Withdraw
            </button>
          );
        }
        return null;
      case 'pending':
        return (
          <>
            <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-1 px-4 rounded-md transition duration-200 ease-in-out mr-2">
              Edit
            </button>
            <button
              onClick={handleWithdraw}
              className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-4 rounded-md transition duration-200 ease-in-out"
            >
              Withdraw
            </button>
          </>
        );
      case 'withdrawn':
      case 'rejected':
      case 'withdraw pending':
        return null;
      default:
        return null;
    }
  };

  return <>{getActionButton()}</>;
};

export default ActionHandler;
