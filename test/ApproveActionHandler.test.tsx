import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import ActionHandler from '@/components/approve/actionHandler';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

// Mock the Redux store
const mockStore = createStore(() => ({
  auth: { staffId: '12345' },
}));

// Mock React Toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock SweetAlert2
jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));

// Setup axios mock adapter
const mock = new MockAdapter(axios);

describe('ActionHandler Component', () => {
  const mockProps = {
    requestId: 1,
    requestorId: 123,
    dateRequested: '2024-10-13',
    requestBatch: 'Batch A',
    duration: 'AM',
    status: 'pending',
    onWithdraw: jest.fn(),
    isDisabled: false,
    proportionAfterApproval: 0.5,
    onRefreshRequests: jest.fn(),
  };

  beforeEach(() => {
    mock.reset(); // Reset the axios mock before each test
  });

  it('should display the Approve button and handle approval correctly', async () => {
    // Mock Swal.fire for approval scenario
    (Swal.fire as jest.Mock).mockResolvedValueOnce({ isConfirmed: true, value: 'Optional comments' });

    mock.onPost('http://127.0.0.1:8085/api/approveRequest').reply(200, {
      message: 'The request has been approved successfully!',
    });

    render(
      <Provider store={mockStore}>
        <ActionHandler {...mockProps} />
      </Provider>
    );

    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);

    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    await waitFor(() => expect(mock.history.post.length).toBe(1));
    await waitFor(() =>
      expect(mock.history.post[0].data).toContain('Optional comments')
    );

    expect(toast.success).toHaveBeenCalledWith('The request has been approved successfully!', {
      position: 'top-right',
    });
    expect(mockProps.onRefreshRequests).toHaveBeenCalled();
  });

  it('should display the Reject button and handle rejection with reason', async () => {
    // Mock Swal.fire for rejection scenario
    (Swal.fire as jest.Mock).mockResolvedValueOnce({ isConfirmed: true, value: 'Rejection reason' });

    mock.onPost('http://127.0.0.1:8085/api/rejectRequest').reply(200, {
      message: 'The request has been rejected successfully!',
    });

    render(
      <Provider store={mockStore}>
        <ActionHandler {...mockProps} status="withdraw pending" />
      </Provider>
    );

    const rejectButton = screen.getByText('Reject');
    fireEvent.click(rejectButton);

    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    await waitFor(() => expect(mock.history.post.length).toBe(1));
    await waitFor(() =>
      expect(mock.history.post[0].data).toContain('Rejection reason')
    );

    expect(toast.success).toHaveBeenCalledWith('The request has been rejected successfully!', {
      position: 'top-right',
    });
    expect(mockProps.onRefreshRequests).toHaveBeenCalled();
  });

  it('should handle the Withdraw action and call the onWithdraw prop', async () => {
    mock.onPost('http://127.0.0.1:8085/api/withdrawRequest').reply(200, {
      message: 'The request has been withdrawn successfully!',
    });

    render(
      <Provider store={mockStore}>
        <ActionHandler {...mockProps} status="approved" />
      </Provider>
    );

    const withdrawButton = screen.getByText('Withdraw');
    fireEvent.click(withdrawButton);

    await waitFor(() => expect(mock.history.post.length).toBe(1));
    expect(mock.history.post[0].data).toContain('Request_ID');
    expect(toast.success).toHaveBeenCalledWith('The request has been withdrawn successfully!', {
      position: 'top-right',
    });
    expect(mockProps.onWithdraw).toHaveBeenCalledWith(mockProps.requestId);
    expect(mockProps.onRefreshRequests).toHaveBeenCalled();
  });

  it('should disable the Approve button when isDisabled is true', () => {
    render(
      <Provider store={mockStore}>
        <ActionHandler {...mockProps} isDisabled={true} />
      </Provider>
    );

    const approveButton = screen.getByText('Approve');
    expect(approveButton).toBeDisabled();
  });
});
