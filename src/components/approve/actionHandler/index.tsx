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
  onRefreshRequests: () => void; // Add the refresh function prop
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
  onRefreshRequests,
}) => {
  const employeeId = parseInt(useSelector((state: any) => state.auth.staffId), 10);

  // Handle Approve for both regular and 'withdraw pending'
  const handleApprove = () => {
    const approvalConfirmationText =
      status.toLowerCase() === 'pending'
        ? `The proportion of staff working from home once accepted will be ${(proportionAfterApproval! * 100).toFixed(1)}%`
        : 'Do you want to approve this request?'; // Generic message for 'withdraw pending'

    Swal.fire({
      title: 'Are you sure?',
      text: approvalConfirmationText,
      input: 'text',
      inputPlaceholder: 'Enter your comments here (optional)...',
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
          Status: status.toLowerCase() === 'withdraw pending' ? 'Withdrawn' : 'Approved', // Set status for withdraw pending
          Date_Requested: dateRequested,
          Request_Batch: requestBatch,
          Duration: duration,
          Reason: result.value || null, // Add optional comments as Reason
        };

        axios.post('http://127.0.0.1:8085/api/approveRequest', payload)
          .then((response) => {
            // Show success message from the response
            toast.success(response.data.message || 'The request has been approved successfully!', {
              position: 'top-right',
            });
            onRefreshRequests(); // Call the refresh function after successful approval
          })
          .catch((error) => {
            // Show error message from the response or a default message
            toast.error(error.response?.data?.message || 'An error occurred while approving the request.', {
              position: 'top-right',
            });
          });
      }
    });
  };

  // Handle Reject for both regular and 'withdraw pending'
  const handleReject = () => {
    const rejectionTitle =
      status.toLowerCase() === 'withdraw pending' ? 'Reject Withdraw Request' : 'Please indicate a reason';

    Swal.fire({
      title: rejectionTitle,
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
          Status: status.toLowerCase() === 'withdraw pending' ? 'Withdraw Rejected' : 'Rejected', // Set status for withdraw pending
          Request_Batch: requestBatch,
          Reason: result.value,
        };

        axios.post('http://127.0.0.1:8085/api/rejectRequest', payload)
          .then((response) => {
            // Show success message from the response
            toast.success(response.data.message || 'The request has been rejected successfully!', {
              position: 'top-right',
            });
            onRefreshRequests(); // Call the refresh function after successful rejection
          })
          .catch((error) => {
            // Show error message from the response or a default message
            toast.error(error.response?.data?.message || 'An error occurred while rejecting the request.', {
              position: 'top-right',
            });
          });
      }
    });
  };

  // Handle Withdraw action
  const handleWithdraw = () => {
    onWithdraw(requestId);
    axios.post('http://127.0.0.1:8085/api/withdrawRequest', { Request_ID: requestId })
      .then((response) => {
        // Show success message from the response
        toast.success(response.data.message || 'The request has been withdrawn successfully!', {
          position: 'top-right',
        });
        onRefreshRequests(); // Refresh the data after withdraw
      })
      .catch((error) => {
        // Show error message from the response or a default message
        toast.error(error.response?.data?.message || 'An error occurred while withdrawing the request.', {
          position: 'top-right',
        });
      });
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
