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
  onRefreshRequests: () => void;
}

const ActionHandler: React.FC<ActionHandlerProps> = ({ status, dateRequested, requestId, employeeId, onRefreshRequests }) => {
  const isWithinTwoWeeks = () => {
    const requestedDate = new Date(dateRequested);
    requestedDate.setHours(0, 0, 0, 0); // Set requestDate to midnight
  
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set currentDate to midnight
  
    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
  
    const twoWeeksBefore = new Date(requestedDate.getTime() - twoWeeksInMs);
    const twoWeeksAfter = new Date(requestedDate.getTime() + twoWeeksInMs);
  
    return currentDate >= twoWeeksBefore && currentDate <= twoWeeksAfter;
  };

  const handleWithdraw = () => {
    Swal.fire({
      title: 'Please indicate a reason',
      input: 'text',
      inputPlaceholder: 'Enter your reason here...',
      inputAttributes: {
        maxlength: '255',
      },
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
      didOpen: () => {
        const inputField = Swal.getInput();
        if (inputField) { // Check if inputField is not null
          const characterCount = document.createElement('div');
          characterCount.style.marginTop = '10px';
          characterCount.style.fontSize = '12px';
          characterCount.style.color = '#555';
          characterCount.style.textAlign = 'center';
          characterCount.style.fontWeight = 'bold'; // Make the text bold
          characterCount.innerText = '0 / 255 characters';
    
          // Append character counter below the input box and center it
          inputField.parentNode?.appendChild(characterCount);
    
          inputField.addEventListener('input', () => {
            const currentLength = inputField.value.length;
            characterCount.innerText = `${currentLength} / 255 characters`;
    
            // Highlight when limit is reached
            characterCount.style.color = currentLength === 255 ? 'red' : '#555';
          });
        }
      },
      willClose: () => {
        const inputField = Swal.getInput();
        if (inputField) {
          inputField.removeEventListener('input', () => {}); // Remove the event listener on close
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const reason = result.value;
        
        const payload = {
          Request_ID: requestId,
          Employee_ID: employeeId,
          Reason: reason,
        };
    
        axios
          .post('http://127.0.0.1:8085/api/request/withdraw', payload)
          .then((response) => {
            toast.success(response.data.message || 'The request has been withdrawn successfully!', {
              position: 'top-right',
            });
            onRefreshRequests();
          })
          .catch((error) => {
            toast.error(error.response?.data?.message || 'An error occurred while withdrawing the request.', {
              position: 'top-right',
            });
          });
      }
    });    
  };

  const getActionButton = () => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'withdraw rejected': // Show the button for Withdraw Rejected status
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
            <button
              onClick={handleWithdraw}
              className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-4 rounded-md transition duration-200 ease-in-out"
            >
              Withdraw
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return <>{getActionButton()}</>;
};

export default ActionHandler;
