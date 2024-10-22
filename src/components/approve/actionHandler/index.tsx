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

interface ApproveBatchHandlerProps {
  requestBatch: string;
  approverId: number;
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

interface RejectBatchHandlerProps {
  requestBatch: string;
  approverId: number;
  onRefreshRequests: () => void;
}

interface WithdrawHandlerProps {
  requestId: number;
  managerId: number;
  onWithdraw: () => void;
}

const ActionHandler = {
  // Handle individual approval
  handleApprove: ({
    requestId,
    approverId,
    dateRequested,
    duration,
    proportionAfterApproval,
    onRefreshRequests,
  }: ApproveHandlerProps) => {
    // Prevent approval if proportion exceeds the limit
    if (proportionAfterApproval && proportionAfterApproval > 0.5) {
      toast.error("Approval cannot proceed. More than half the team is already working from home.", {
        position: 'top-right',
      });
      return;
    }

    const approvalConfirmationText =
      proportionAfterApproval
        ? `The proportion of staff working from home once accepted will be ${(proportionAfterApproval * 100).toFixed(1)}%.`
        : 'Do you want to approve this request?';

    Swal.fire({
      title: 'Are you sure?',
      text: approvalConfirmationText,
      input: 'text',
      inputPlaceholder: 'Enter your comments here (optional)...',
      showCancelButton: true,
      confirmButtonText: 'Approve',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#072040',
      cancelButtonColor: '#a2b4cc',
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          Request_ID: requestId, // Use Request_ID for individual approval
          Approver_ID: approverId,
          Status: 'Approved',
          Date_Requested: dateRequested,
          Duration: duration,
          Reason: result.value || null, // Optional reason
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

  // Handle batch approval
  handleApproveBatch: ({
    requestBatch,
    approverId,
    duration,
    proportionAfterApproval,
    onRefreshRequests,
  }: ApproveBatchHandlerProps) => {
    // Prevent approval if proportion exceeds the limit
    if (proportionAfterApproval && proportionAfterApproval > 0.5) {
      toast.error("Approval cannot proceed. More than half the team is already working from home.", {
        position: 'top-right',
      });
      return;
    }
  
    const approvalConfirmationText = 'Do you want to approve all requests in this batch?';
  
    Swal.fire({
      title: 'Are you sure?',
      text: approvalConfirmationText,
      input: 'text',
      inputPlaceholder: 'Enter your comments here (optional)...',
      showCancelButton: true,
      confirmButtonText: 'Approve All',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#072040',
      cancelButtonColor: '#a2b4cc',
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          Request_Batch: requestBatch, // Use Request_Batch for batch approval
          Approver_ID: approverId,
          Status: 'Approved',
          Duration: duration,
          Reason: result.value || null, // Optional reason
        };
  
        axios
          .post('http://127.0.0.1:8085/api/approveRecurringRequest', payload)
          .then((response) => {
            toast.success(response.data.message || 'The batch has been approved successfully!', {
              position: 'top-right',
            });
            onRefreshRequests();
          })
          .catch((error) => {
            toast.error(error.response?.data?.message || 'An error occurred while approving the batch.', {
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
      confirmButtonText: requestBatch ? 'Reject All' : 'Confirm',
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

  handleRejectBatch: ({
    requestBatch,
    approverId,
    onRefreshRequests,
  }: RejectBatchHandlerProps) => {
    Swal.fire({
      title: 'Are you sure you want to reject all requests in this batch?',
      input: 'text',
      inputPlaceholder: 'Enter your reason for rejecting...',
      showCancelButton: true,
      confirmButtonText: 'Reject All',
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
          Request_Batch: requestBatch,
          Approver_ID: approverId,
          Status: 'Rejected',
          Reason: result.value,
        };

        axios
          .post('http://127.0.0.1:8085/api/rejectRecurringRequest', payload)
          .then((response) => {
            toast.success(response.data.message || 'The batch request has been rejected successfully!', {
              position: 'top-right',
            });
            onRefreshRequests();
          })
          .catch((error) => {
            toast.error(error.response?.data?.message || 'An error occurred while rejecting the batch request.', {
              position: 'top-right',
            });
          });
      }
    });
  },

  handleWithdraw: ({ requestId, managerId, onWithdraw }: WithdrawHandlerProps) => {
    Swal.fire({
      title: 'Are you sure you want to withdraw this request?',
      input: 'text',
      inputPlaceholder: 'Enter your reason for withdrawal...',
      showCancelButton: true,
      confirmButtonText: 'Yes, withdraw it',
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
          Manager_ID: managerId,
          Request_ID: requestId,
          Reason: result.value,
        };

        axios
          .post('http://127.0.0.1:8085/api/request/managerWithdraw', payload)
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
