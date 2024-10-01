import React from 'react';
import { render, screen } from '@testing-library/react';
import RequestEntry from '@/components/history/entry';
import '@testing-library/jest-dom';

describe('RequestEntry Component', () => {
  
  // Test case for Approved status with the Withdraw button
  it('renders Approved request with Withdraw button', () => {
    render(
      <RequestEntry
        requestId="1"
        requestorId="171014"
        approverId="170166"
        status="Approved"
        dateRequested="2024-09-25"
        requestBatch={null}
        dateOfRequest="2024-09-18"
        duration="FD"
      />
    );

    // Check that the status text is displayed
    expect(screen.getByText('Approved')).toBeInTheDocument();
    // Check that the Withdraw button is displayed
    expect(screen.getByText('Withdraw')).toBeInTheDocument();
  });

  // Test case for Pending status with the Edit button
  it('renders Pending request with Edit button', () => {
    render(
      <RequestEntry
        requestId="2"
        requestorId="171014"
        approverId="170166"
        status="Pending"
        dateRequested="2024-09-26"
        requestBatch={null}
        dateOfRequest="2024-09-18"
        duration="FD"
      />
    );

    // Check that the status text is displayed
    expect(screen.getByText('Pending')).toBeInTheDocument();
    // Check that the Edit button is displayed
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  // Test case for Withdrawn status with no action buttons
  it('renders Withdrawn request without action buttons', () => {
    render(
      <RequestEntry
        requestId="3"
        requestorId="171014"
        approverId="170166"
        status="Withdrawn"
        dateRequested="2024-09-27"
        requestBatch={null}
        dateOfRequest="2024-09-18"
        duration="PM"
      />
    );

    // Check that the status text is displayed
    expect(screen.getByText('Withdrawn')).toBeInTheDocument();
    // Ensure that no action buttons (Withdraw/Edit) are displayed for Withdrawn status
    expect(screen.queryByText('Withdraw')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  // Test case for Rejected status with no action buttons
  it('renders Rejected request without action buttons', () => {
    render(
      <RequestEntry
        requestId="4"
        requestorId="171014"
        approverId="170166"
        status="Rejected"
        dateRequested="2024-09-28"
        requestBatch={null}
        dateOfRequest="2024-09-18"
        duration="FD"
      />
    );

    // Check that the status text is displayed
    expect(screen.getByText('Rejected')).toBeInTheDocument();
    // Ensure that no action buttons (Withdraw/Edit) are displayed for Rejected status
    expect(screen.queryByText('Withdraw')).not.toBeInTheDocument();
  });

  // Test case for Withdraw Pending status with no action buttons
  it('renders Withdraw Pending request without action buttons', () => {
    render(
      <RequestEntry
        requestId="5"
        requestorId="171014"
        approverId="170166"
        status="Withdraw Pending"
        dateRequested="2024-09-29"
        requestBatch={null}
        dateOfRequest="2024-09-18"
        duration="FD"
      />
    );

    // Check that the status text is displayed
    expect(screen.getByText('Withdraw Pending')).toBeInTheDocument();
    // Ensure that no action buttons (Withdraw/Edit) are displayed for Withdraw Pending status
    expect(screen.queryByText('Withdraw')).not.toBeInTheDocument();
  });

  // Test case for Withdraw Rejected status with no action buttons
  it('renders Withdraw Rejected request without action buttons', () => {
    render(
      <RequestEntry
        requestId="6"
        requestorId="171014"
        approverId="170166"
        status="Withdraw Rejected"
        dateRequested="2024-09-30"
        requestBatch={null}
        dateOfRequest="2024-09-18"
        duration="FD"
      />
    );

    // Check that the status text is displayed
    expect(screen.getByText('Withdraw Rejected')).toBeInTheDocument();
    // Ensure that no action buttons (Withdraw/Edit) are displayed for Withdraw Rejected status
    expect(screen.queryByText('Withdraw')).not.toBeInTheDocument();
  });

  // Test case for unknown status to test the default case of statusColor
  it('renders default case in statusColor with unknown status', () => {
    render(
      <RequestEntry
        requestId="7"
        requestorId="171014"
        approverId="170166"
        status="Unknown Status"
        dateRequested="2024-10-01"
        requestBatch={null}
        dateOfRequest="2024-09-18"
        duration="FD"
      />
    );

    // Check that the status text is displayed
    expect(screen.getByText('Unknown Status')).toBeInTheDocument();
    // Ensure that no action buttons (Withdraw/Edit) are displayed for unknown status
    expect(screen.queryByText('Withdraw')).not.toBeInTheDocument();
  });
});
