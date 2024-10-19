import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import axios from 'axios';

interface ApproveHandlerProps {
  requestId: number;
  approverId: number;
  dateRequested: string;
  requestBatch: string | null;
  duration: string;
  proportionAfterApproval: number | null;
  onRefreshRequests: () => void;
}

interface RejectHandlerProps {
  requestId: number;
  approverId: number;
  dateRequested: string;
  requestBatch: string | null;
  duration: string;
  onRefreshRequests: () => void;
}

interface WithdrawHandlerProps {
  requestId: number;
  onWithdraw: () => void;
}

const ActionHandler = {
  handleApprove: ({
    requestId,
    approverId,
    dateRequested,
    requestBatch,
    duration,
    proportionAfterApproval,
    onRefreshRequests,
  }: ApproveHandlerProps) => {
    const approvalConfirmationText =
      proportionAfterApproval
        ? `The proportion of staff working from home once accepted will be ${(proportionAfterApproval * 100).toFixed(1)}%`
        : 'Do you want to approve this request?';

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
          Approver_ID: approverId,
          Status: 'Approved',
          Date_Requested: dateRequested,
          Request_Batch: requestBatch,
          Duration: duration,
          Reason: result.value || null,
        };

        axios
          .post('http://127.0.0.1:8085/api/approveRequest', payload)
          .then((response) => {
            toast.success(response.data.message || 'The request has been approved successfully!', {
              position: 'top-right',
            });
            onRefreshRequests();
          })
          .catch((error) => {
            toast.error(error.response?.data?.message || 'An error occurred while approving the request.', {
              position: 'top-right',
            });
          });
      }
    });
  },

  handleReject: ({
    requestId,
    approverId,
    dateRequested,
    requestBatch,
    duration,
    onRefreshRequests,
  }: RejectHandlerProps) => {
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
          Approver_ID: approverId,
          Status: 'Rejected',
          Date_Requested: dateRequested,
          Request_Batch: requestBatch,
          Duration: duration,
          Reason: result.value,
        };

        axios
          .post('http://127.0.0.1:8085/api/rejectRequest', payload)
          .then((response) => {
            toast.success(response.data.message || 'The request has been rejected successfully!', {
              position: 'top-right',
            });
            onRefreshRequests();
          })
          .catch((error) => {
            toast.error(error.response?.data?.message || 'An error occurred while rejecting the request.', {
              position: 'top-right',
            });
          });
      }
    });
  },

  handleWithdraw: ({ requestId, onWithdraw }: WithdrawHandlerProps) => {
    Swal.fire({
      title: 'Are you sure you want to withdraw this request?',
      showCancelButton: true,
      confirmButtonText: 'Yes, withdraw it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#072040',
      cancelButtonColor: '#a2b4cc',
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post('http://127.0.0.1:8085/api/withdrawRequest', { Request_ID: requestId })
          .then((response) => {
            toast.success(response.data.message || 'The request has been withdrawn successfully!', {
              position: 'top-right',
            });
            onWithdraw();
          })
          .catch((error) => {
            toast.error(error.response?.data?.message || 'An error occurred while withdrawing the request.', {
              position: 'top-right',
            });
          });
      }
    });
  },
};

export default ActionHandler;
