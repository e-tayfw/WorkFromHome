import React from 'react';
import { render, screen } from '@testing-library/react';
import RequestEntry from '@/components/history/entry';
import '@testing-library/jest-dom';

// Mock the current date for testing boundary conditions
const mockCurrentDate = (mockDate: string) => {
  jest.useFakeTimers({ now: new Date() });
  jest.setSystemTime(new Date(mockDate));
};

describe('RequestEntry Component', () => {
  const mockFetchRequests = jest.fn(); // Mock implementation for fetchRequests
  const mockRequestClick = jest.fn(); // Mock implementation for handleRequestClick

  afterEach(() => {
    jest.useRealTimers();
  });

  // Test case for Approved status with Withdraw button within the two-week range (positive case)
  it('renders Withdraw button when current date is within two weeks of dateRequested', () => {
    mockCurrentDate('2024-09-28'); // Within two weeks after dateRequested '2024-09-25'

    render(
      <RequestEntry
        requestId="1"
        requestorId="171014"
        approverId="170166"
        status="Approved"
        dateRequested="2024-09-25"
        requestBatch={null}
        handleRequestClick={mockRequestClick}
        dateOfRequest="2024-09-18"
        duration="FD"
        fetchRequests={mockFetchRequests}  // Added mock fetchRequests prop
      />
    );

    // Check that the Withdraw button is displayed within the allowed range
    expect(screen.getByText('Withdraw')).toBeInTheDocument();
  });

  // Test case for Approved status with Withdraw button on the boundary of the two-week range
  it('renders Withdraw button exactly two weeks before dateRequested', () => {
    mockCurrentDate('2024-09-11'); // Exactly two weeks before dateRequested '2024-09-25'

    render(
      <RequestEntry
        requestId="2"
        requestorId="171014"
        approverId="170166"
        status="Approved"
        dateRequested="2024-09-25"
        requestBatch={null}
        handleRequestClick={mockRequestClick}
        dateOfRequest="2024-09-18"
        duration="FD"
        fetchRequests={mockFetchRequests} // Added mock fetchRequests prop
      />
    );

    // Check that the Withdraw button is displayed at the boundary
    expect(screen.getByText('Withdraw')).toBeInTheDocument();
  });

  it('renders Withdraw button exactly two weeks after dateRequested', () => {
    mockCurrentDate('2024-10-09'); // Exactly two weeks after dateRequested '2024-09-25'

    render(
      <RequestEntry
        requestId="3"
        requestorId="171014"
        approverId="170166"
        status="Approved"
        dateRequested="2024-09-25"
        handleRequestClick={mockRequestClick}
        requestBatch={null}
        dateOfRequest="2024-09-18"
        duration="FD"
        fetchRequests={mockFetchRequests} // Added mock fetchRequests prop
      />
    );

    // Check that the Withdraw button is displayed at the boundary
    expect(screen.getByText('Withdraw')).toBeInTheDocument();
  });

  // Test case for Approved status with no Withdraw button outside the two-week range (negative case)
  it('does not render Withdraw button when current date is just outside the two-week range', () => {
    mockCurrentDate('2024-10-10'); // Just outside the two-week range after dateRequested '2024-09-25'

    render(
      <RequestEntry
        requestId="4"
        requestorId="171014"
        approverId="170166"
        status="Approved"
        dateRequested="2024-09-25"
        requestBatch={null}
        handleRequestClick={mockRequestClick}
        dateOfRequest="2024-09-18"
        duration="FD"
        fetchRequests={mockFetchRequests} // Added mock fetchRequests prop
      />
    );

    // Check that the Withdraw button is not displayed outside the allowed range
    expect(screen.queryByText('Withdraw')).not.toBeInTheDocument();
  });

  // Additional test case for a date much earlier than the two-week range
  it('does not render Withdraw button when current date is well before two weeks from dateRequested', () => {
    mockCurrentDate('2024-09-01'); // More than two weeks before dateRequested '2024-09-25'

    render(
      <RequestEntry
        requestId="5"
        requestorId="171014"
        approverId="170166"
        status="Approved"
        dateRequested="2024-09-25"
        handleRequestClick={mockRequestClick}
        requestBatch={null}
        dateOfRequest="2024-09-18"
        duration="FD"
        fetchRequests={mockFetchRequests} // Added mock fetchRequests prop
      />
    );

    // Check that the Withdraw button is not displayed
    expect(screen.queryByText('Withdraw')).not.toBeInTheDocument();
  });

  // Additional test case for a date well beyond the two-week range
  it('does not render Withdraw button when current date is well after two weeks from dateRequested', () => {
    mockCurrentDate('2024-10-20'); // Well after two weeks beyond the dateRequested '2024-09-25'

    render(
      <RequestEntry
        requestId="6"
        requestorId="171014"
        approverId="170166"
        status="Approved"
        handleRequestClick={mockRequestClick}
        dateRequested="2024-09-25"
        requestBatch={null}
        dateOfRequest="2024-09-18"
        duration="FD"
        fetchRequests={mockFetchRequests} // Added mock fetchRequests prop
      />
    );

    // Check that the Withdraw button is not displayed
    expect(screen.queryByText('Withdraw')).not.toBeInTheDocument();
  });

  // Test case for Withdrawn status with no action buttons
  it('renders Withdrawn request without action buttons', () => {
    render(
      <RequestEntry
        requestId="8"
        requestorId="171014"
        approverId="170166"
        status="Withdrawn"
        dateRequested="2024-09-27"
        handleRequestClick={mockRequestClick}
        requestBatch={null}
        dateOfRequest="2024-09-18"
        duration="PM"
        fetchRequests={mockFetchRequests} // Added mock fetchRequests prop
      />
    );

    // Check that no action buttons are displayed for Withdrawn status
    expect(screen.queryByText('Withdraw')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  // Test case for Rejected status with no action buttons
  it('renders Rejected request without action buttons', () => {
    render(
      <RequestEntry
        requestId="9"
        requestorId="171014"
        approverId="170166"
        status="Rejected"
        dateRequested="2024-09-28"
        requestBatch={null}
        dateOfRequest="2024-09-18"
        handleRequestClick={mockRequestClick}
        duration="FD"
        fetchRequests={mockFetchRequests} // Added mock fetchRequests prop
      />
    );

    // Check that no action buttons are displayed for Rejected status
    expect(screen.queryByText('Withdraw')).not.toBeInTheDocument();
  });

  // Test case for Withdraw Pending status with no action buttons
  it('renders Withdraw Pending request without action buttons', () => {
    render(
      <RequestEntry
        requestId="10"
        requestorId="171014"
        approverId="170166"
        status="Withdraw Pending"
        dateRequested="2024-09-29"
        requestBatch={null}
        handleRequestClick={mockRequestClick}
        dateOfRequest="2024-09-18"
        duration="FD"
        fetchRequests={mockFetchRequests} // Added mock fetchRequests prop
      />
    );

    // Check that no action buttons are displayed for Withdraw Pending status
    expect(screen.queryByText('Withdraw')).not.toBeInTheDocument();
  });

});
