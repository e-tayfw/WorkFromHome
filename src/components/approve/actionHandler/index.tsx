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
  requestBatch: string | null;
  duration: string;
  status: string;
  onWithdraw: (requestId: number) => void;
  isDisabled: boolean;
  proportionAfterApproval: number | null;
}

const ActionHandler: React.FC<ActionHandlerProps> = ({
  requestId,
  requestorId,
  dateRequested,
  requestBatch,
  duration,
  status,
  onWithdraw,
  isDisabled,
  proportionAfterApproval,
}) => {
  const employeeId = parseInt(useSelector((state: any) => state.auth.staffId), 10);

  const handleApprove = () => {
    if (status.toLowerCase() === 'withdraw pending') {
      // Modal for withdraw pending status (no proportion text)
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to approve this request?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#072040',
        cancelButtonColor: '#a2b4cc',
      }).then((result) => {
        if (result.isConfirmed) {
          const payload = {
            Request_ID: requestId,
            Approver_ID: employeeId,
            Status: 'Approved',
            Date_Requested: dateRequested,
            Request_Batch: requestBatch,
            Duration: duration,
          };

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
    } else {
      // Modal for pending status (show proportion text)
      Swal.fire({
        title: 'Are you sure?',
        text: `The proportion of staff working from home once accepted will be ${(
          proportionAfterApproval! * 100
        ).toFixed(1)}%`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#072040',
        cancelButtonColor: '#a2b4cc',
      }).then((result) => {
        if (result.isConfirmed) {
          const payload = {
            Request_ID: requestId,
            Approver_ID: employeeId,
            Status: 'Approved',
            Date_Requested: dateRequested,
            Request_Batch: requestBatch,
            Duration: duration,
          };

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
    }
  };

  const handleReject = () => {
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
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const payload = {
          Request_ID: requestId,
          Approver_ID: employeeId,
          Status: 'Rejected',
          Request_Batch: requestBatch,
          Reason: result.value,
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
        <>
          <button
            className="bg-green-100 text-green-700 font-semibold py-1 px-4 rounded-md transition duration-200 ease-in-out mr-2 hover:bg-green-200"
            onClick={handleApprove}
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
