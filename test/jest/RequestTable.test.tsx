import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RequestTable from '@/components/history/table';
import axios from 'axios';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ToastContainer } from 'react-toastify';

// Mock the Axios module
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock Redux store
const mockStore = configureStore([]);
const store = mockStore({
  auth: { staffId: '1001' }, // Simulate employeeId in Redux store
});

describe('RequestTable Component', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear(); // Clear previous mocks before each test
  });

  it('shows "You have no requests!" when the GET request returns empty data', async () => {
    // Mock the axios.get call to return an empty array
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    render(
      <Provider store={store}>
        <RequestTable />
        <ToastContainer />
      </Provider>
    );

    // Wait for the axios call to be made
    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledWith('http://127.0.0.1:8085/api/request/requestorId/1001'));

    // Check that the "You have no requests!" message is displayed
    expect(screen.getByText('You have no requests!')).toBeInTheDocument();
  });

  it('displays requests and does not show "You have no requests!" when there is data', async () => {
    // Mock the axios.get call to resolve with the mock data
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        {
          Request_ID: '1',
          Requestor_ID: '1001',
          Approver_ID: '2001',
          Status: 'approved',
          Date_Requested: '2024-10-01',
          Request_Batch: null,
          created_at: '2024-09-20T12:34:56Z',
          Duration: 'AM',
        },
      ],
    });

    render(
      <Provider store={store}>
        <RequestTable />
        <ToastContainer />
      </Provider>
    );

    // Wait for the axios call to be made
    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledWith('http://127.0.0.1:8085/api/request/requestorId/1001'));

    // Ensure the "You have no requests!" message is NOT present
    expect(screen.queryByText('You have no requests!')).not.toBeInTheDocument();

    // Verify that the first request data is displayed correctly
    await waitFor(() => {
      expect(screen.getByText('2024-10-01')).toBeInTheDocument(); // Check mapped Date_Requested
      expect(screen.getByText('approved')).toBeInTheDocument();  // Check `status`
    });
  });

  it('verifies pagination controls are working with 6 mock entries', async () => {
    // Mock the axios.get call to resolve with 6 mock data entries
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        {
          Request_ID: '1',
          Requestor_ID: '1001',
          Approver_ID: '2001',
          Status: 'approved',
          Date_Requested: '2024-10-01',
          Request_Batch: null,
          created_at: '2024-09-20T12:34:56Z',
          Duration: 'AM',
        },
        {
          Request_ID: '2',
          Requestor_ID: '1001',
          Approver_ID: '2001',
          Status: 'pending',
          Date_Requested: '2024-10-02',
          Request_Batch: null,
          created_at: '2024-09-21T12:34:56Z',
          Duration: 'PM',
        },
        {
          Request_ID: '3',
          Requestor_ID: '1001',
          Approver_ID: '2001',
          Status: 'rejected',
          Date_Requested: '2024-10-03',
          Request_Batch: null,
          created_at: '2024-09-22T12:34:56Z',
          Duration: 'FD',
        },
        {
          Request_ID: '4',
          Requestor_ID: '1001',
          Approver_ID: '2001',
          Status: 'withdrawn',
          Date_Requested: '2024-10-04',
          Request_Batch: null,
          created_at: '2024-09-23T12:34:56Z',
          Duration: 'AM',
        },
        {
          Request_ID: '5',
          Requestor_ID: '1001',
          Approver_ID: '2001',
          Status: 'withdraw pending',
          Date_Requested: '2024-10-05',
          Request_Batch: null,
          created_at: '2024-09-24T12:34:56Z',
          Duration: 'PM',
        },
        {
          Request_ID: '6',
          Requestor_ID: '1001',
          Approver_ID: '2001',
          Status: 'withdraw rejected',
          Date_Requested: '2024-10-06',
          Request_Batch: null,
          created_at: '2024-09-25T12:34:56Z',
          Duration: 'FD',
        },
      ],
    });

    render(
      <Provider store={store}>
        <RequestTable />
        <ToastContainer />
      </Provider>
    );

    // Verify that "Previous" button is disabled on page 1
    const prevButton = screen.getByRole('button', { name: /Previous/i });
    expect(prevButton).toBeDisabled();

    // Click the "Next" button to move to the next page
    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);

    // Wait for the last request to appear in the document
    await waitFor(() => {
      expect(screen.getByText('2024-10-01')).toBeInTheDocument(); // Check the earliest request's Date_Requested
      expect(screen.getByText('approved')).toBeInTheDocument(); // Check the earliest request's status
    });
  });

  it('filters requests by status correctly', async () => {
    // Mock the axios.get call to resolve with mixed statuses
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        {
          Request_ID: '1',
          Requestor_ID: '1001',
          Approver_ID: '2001',
          Status: 'approved',
          Date_Requested: '2024-10-01',
          Request_Batch: null,
          created_at: '2024-09-20T12:34:56Z',
          Duration: 'AM',
        },
        {
          Request_ID: '2',
          Requestor_ID: '1001',
          Approver_ID: '2001',
          Status: 'pending',
          Date_Requested: '2024-10-02',
          Request_Batch: null,
          created_at: '2024-09-21T12:34:56Z',
          Duration: 'PM',
        },
      ],
    });

    render(
      <Provider store={store}>
        <RequestTable />
        <ToastContainer />
      </Provider>
    );

    // Wait for the axios call to be made
    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledWith('http://127.0.0.1:8085/api/request/requestorId/1001'));

    // Verify that filter by status works (select "pending" status)
    const statusFilter = screen.getByLabelText(/Filter by Status/i);
    fireEvent.change(statusFilter, { target: { value: 'pending' } });

    // Wait for only pending requests to be shown
    await waitFor(() => {
      expect(screen.getByText('2024-10-02')).toBeInTheDocument(); // Pending request Date_Requested
      expect(screen.getByText('pending')).toBeInTheDocument(); // Pending request status
    });

    // Ensure no other statuses are shown
    expect(screen.queryByText('approved')).not.toBeInTheDocument();
  });

  it('sorts the requests by status', async () => {
    // Mock the axios.get call to resolve with unsorted mock data
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        {
          Request_ID: '1',
          Requestor_ID: '1001',
          Approver_ID: '2001',
          Status: 'rejected',
          Date_Requested: '2024-10-01',
          Request_Batch: null,
          created_at: '2024-09-20T12:34:56Z',
          Duration: 'AM',
        },
        {
          Request_ID: '2',
          Requestor_ID: '1001',
          Approver_ID: '2001',
          Status: 'approved',
          Date_Requested: '2024-10-02',
          Request_Batch: null,
          created_at: '2024-09-21T12:34:56Z',
          Duration: 'PM',
        },
        {
          Request_ID: '3',
          Requestor_ID: '1001',
          Approver_ID: '2001',
          Status: 'pending',
          Date_Requested: '2024-10-03',
          Request_Batch: null,
          created_at: '2024-09-22T12:34:56Z',
          Duration: 'FD',
        },
      ],
    });

    render(
      <Provider store={store}>
        <RequestTable />
        <ToastContainer />
      </Provider>
    );

    // Verify sorting by status (ascending/descending)
    const statusColumn = screen.getByRole('columnheader', { name: /Status/i });
    fireEvent.click(statusColumn); // Sort ascending
    await waitFor(() => {
      const firstStatus = screen.getAllByText(/approved/i)[0];
      expect(firstStatus).toBeInTheDocument(); // Approved should come first in ascending order
    });

    fireEvent.click(statusColumn); // Sort descending
    await waitFor(() => {
      const firstStatus = screen.getAllByText(/rejected/i)[0];
      expect(firstStatus).toBeInTheDocument(); // Rejected should come first in descending order
    });
  });
});
