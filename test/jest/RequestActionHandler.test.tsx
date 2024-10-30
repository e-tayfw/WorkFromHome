import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import ActionHandler from '@/components/history/actionHandler';

// Mock external dependencies
jest.mock('axios');
jest.mock('sweetalert2', () => ({
  fire: jest.fn(() =>
    Promise.resolve({
      isConfirmed: true, // Simulate the user confirming the dialog
      value: 'Test reason', // Simulate the reason input
    })
  ),
}));
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ActionHandler Withdrawal Functionality', () => {
  const mockOnRefreshRequests = jest.fn();

  const defaultProps = {
    status: 'approved',
    dateRequested: '2024-09-28', // Request date
    requestId: '12345',
    employeeId: '54321',
    onRefreshRequests: mockOnRefreshRequests,
  };

  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
    jest.useFakeTimers(); // Mock timers
  });

  afterEach(() => {
    jest.useRealTimers(); // Restore real timers after each test
  });

  it('should trigger SweetAlert2 and send POST request on "Confirm"', async () => {
    // Mock Axios post request to resolve successfully
    (axios.post as jest.Mock).mockResolvedValue({
      data: { message: 'Request withdrawn successfully!' },
    });

    // Mock current date to be within two weeks after the request date (2024-09-28)
    jest.setSystemTime(new Date('2024-10-05')); // This is within two weeks after the request date

    // Render the component
    render(<ActionHandler {...defaultProps} />);

    // Click the "Withdraw" button using getByRole
    fireEvent.click(screen.getByRole('button', { name: /withdraw/i }));

    // Ensure SweetAlert is shown
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());

    // Ensure the "Confirm" button in SweetAlert was clicked and POST request sent
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "https://54.251.20.155.nip.io/api/request/withdraw",
        {
          Request_ID: "12345",
          Employee_ID: "54321",
          Reason: "Test reason", // Mocked reason value from SweetAlert
        }
      );
    });

    // Ensure success toast is displayed
    expect(toast.success).toHaveBeenCalledWith('Request withdrawn successfully!', {
      position: 'top-right',
    });

    // Ensure onRefreshRequests is called to refresh the data
    expect(mockOnRefreshRequests).toHaveBeenCalled();
  });

  it('should not send POST request when SweetAlert is cancelled', async () => {
    // Update the SweetAlert mock to simulate cancel action
    (Swal.fire as jest.Mock).mockResolvedValue({
      isConfirmed: false, // Simulate clicking "Cancel"
    });

    // Mock current date to be within two weeks after the request date (2024-09-28)
    jest.setSystemTime(new Date('2024-10-05')); // This is within two weeks after the request date

    // Render the component
    render(<ActionHandler {...defaultProps} />);

    // Click the "Withdraw" button using getByRole
    fireEvent.click(screen.getByRole('button', { name: /withdraw/i }));

    // Ensure SweetAlert is shown
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());

    // Check that no POST request is made if the user cancels
    expect(axios.post).not.toHaveBeenCalled();

    // Ensure no toast is shown
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();

    // Ensure refresh is not triggered
    expect(mockOnRefreshRequests).not.toHaveBeenCalled();
  });
});
