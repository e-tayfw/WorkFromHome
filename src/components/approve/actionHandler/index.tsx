import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useSelector } from 'react-redux';

interface ActionHandlerProps {
  requestId: number;
  requestorId: number;
  dateRequested: string;
  dateOfRequest: string;
  requestBatch: string | null;
  duration: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  onWithdraw: (requestId: number) => void;
  isDisabled: boolean;
  proportionAfterApproval: number | null;
}

const ActionHandler: React.FC<ActionHandlerProps> = ({
  requestId,
  requestorId,
  dateRequested,
  dateOfRequest,
  requestBatch,
  duration,
  status,
  createdAt,
  updatedAt,
  onWithdraw,
  isDisabled,
  proportionAfterApproval,
}) => {
  const employeeId = parseInt(useSelector((state: any) => state.auth.staffId), 10);

  // Function to format the current date with six-digit precision
  const getFormattedTimestamp = () => {
    const date = new Date();
    const formattedDate = date.toISOString().slice(0, -1); // Remove the "Z" at the end
    const sixDigitMillis = `${formattedDate}.${date.getMilliseconds().toString().padEnd(3, '0')}000Z`;
    return sixDigitMillis;
  };

  const handleApprove = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: `The proportion of staff working from home once accepted will be ${(
        proportionAfterApproval! * 100
      ).toFixed(2)}%`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#28a745',  // Green confirm button
      cancelButtonColor: '#dc3545',   // Red cancel button
    }).then((result) => {
      if (result.isConfirmed) {
        const currentDate = getFormattedTimestamp(); // Use the new timestamp format
        const payload = {
          Request_ID: requestId,
          Requestor_ID: requestorId,
          Approver_ID: employeeId,
          Status: 'Approved',
          Date_Requested: dateRequested,
          Request_Batch: requestBatch,
          Date_Of_Request: dateOfRequest,
          Duration: duration,
          created_at: currentDate,
          updated_at: currentDate,
        };
        console.log('Approval Payload:', payload);
        axios.post('http://127.0.0.1:8085/api/approveRequest', payload)
          .then(() => {
            toast.success('The request has been approved successfully!', {
              position: 'top-right',
            });
          })
          .catch(() => {
            toast.error('An error occurred while approving the request.', {
              position: 'top-right',
            });
          });
      }
    });
  };

  const handleReject = () => {
    Swal.fire({
      title: 'Please indicate a reason',
      input: 'text',
      inputPlaceholder: 'Enter your reason here...',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#28a745',  // Green confirm button
      cancelButtonColor: '#dc3545',   // Red cancel button
      inputValidator: (value) => {
        if (!value) {
          return 'You need to provide a reason!';
        }
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const currentDate = getFormattedTimestamp(); // Use the new timestamp format
        const payload = {
          Request_ID: requestId,
          Requestor_ID: requestorId,
          Approver_ID: employeeId,
          Status: 'Rejected',
          Date_Requested: dateRequested,
          Request_Batch: requestBatch,
          Date_Of_Request: dateOfRequest,
          Duration: duration,
          created_at: currentDate,
          updated_at: currentDate,
          reason: result.value,
        };

        axios.post('http://127.0.0.1:8085/api/rejectRequest', payload)
          .then(() => {
            toast.success('The request has been rejected successfully!', {
              position: 'top-right',
            });
          })
          .catch(() => {
            toast.error('An error occurred while rejecting the request.', {
              position: 'top-right',
            });
          });
      }
    });
  };

  const handleWithdraw = () => {
    onWithdraw(requestId);
  };

  return (
    <div>
      {/* Conditional button rendering based on status */}
      {status.toLowerCase() === 'approved' ? (
        <button
          className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-4 rounded-md transition duration-200 ease-in-out"
          onClick={handleWithdraw}
        >
          Withdraw
        </button>
      ) : status.toLowerCase() === 'withdraw pending' ? (
        <button
          className="bg-green-100 text-green-700 font-semibold py-1 px-4 rounded-md transition duration-200 ease-in-out mr-2 hover:bg-green-200"
          onClick={handleApprove}
        >
          Approve
        </button>
      ) : status.toLowerCase() === 'pending' ? (
        <>
          <button
            className={`bg-green-100 text-green-700 font-semibold py-1 px-4 rounded-md transition duration-200 ease-in-out mr-2 ${
              isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-200'
            }`}
            onClick={handleApprove}
            disabled={isDisabled}
          >
            Approve
          </button>
          <button
            className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-4 rounded-md transition duration-200 ease-in-out"
            onClick={handleReject}
          >
            Reject
          </button>
        </>
      ) : null}
    </div>
  );
};

export default ActionHandler;
