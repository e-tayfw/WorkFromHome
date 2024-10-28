import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RecurringTable from '@/components/approve/recurring';
import ApproveRecurringEntry from '@/components/approve/recurringentry';

jest.mock('@/components/approve/recurringentry', () => jest.fn(() => <div>ApproveRecurringEntry Component</div>));
jest.mock('@/components/TextStyles', () => ({
  BodyLarge: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('RecurringTable Component', () => {
  const defaultProps = {
    employeeRequests: {},
    employee: { Staff_ID: 1 },
    pagination: {},
    handlePageChange: jest.fn(),
    fetchRequests: jest.fn(),
    handleRequestClick: jest.fn(),
    isMobile: false,
    getShortHeader: jest.fn((header: string) => header),
    teamSize: 5,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when there are no requests', () => {
    render(<RecurringTable {...defaultProps} />);
    expect(screen.queryByText('Recurring Requests')).toBeNull();
  });

  it('should render the table headers correctly', () => {
    render(
      <RecurringTable
        {...defaultProps}
        employeeRequests={{ batch1: [] }}
      />
    );
    expect(screen.getByText('Recurring Requests')).toBeInTheDocument();
    expect(screen.getByText('Date Requested')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Date Of Request')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('should use getShortHeader when isMobile is true', () => {
    render(
      <RecurringTable
        {...defaultProps}
        employeeRequests={{ batch1: [] }}
        isMobile={true}
      />
    );
    expect(defaultProps.getShortHeader).toHaveBeenCalledWith('Date Requested');
    expect(defaultProps.getShortHeader).toHaveBeenCalledWith('Duration');
    expect(defaultProps.getShortHeader).toHaveBeenCalledWith('Date Of Request');
    expect(defaultProps.getShortHeader).toHaveBeenCalledWith('Status');
    expect(defaultProps.getShortHeader).toHaveBeenCalledWith('Action');
  });

  it('should render batches correctly', () => {
    const employeeRequests = {
      batch1: [{ status: 'Pending' }],
      batch2: [{ status: 'Approved' }],
    };
    render(
      <RecurringTable
        {...defaultProps}
        employeeRequests={employeeRequests}
      />
    );
    expect(screen.getByText('Batch: batch1')).toBeInTheDocument();
    expect(screen.getByText('Batch: batch2')).toBeInTheDocument();
    expect(ApproveRecurringEntry).toHaveBeenCalledTimes(2);
  });

  it('should handle pagination correctly', () => {
    const employeeRequests = {
      batch1: [{ status: 'Pending' }],
      batch2: [{ status: 'Approved' }],
      batch3: [{ status: 'Rejected' }],
    };
    render(
      <RecurringTable
        {...defaultProps}
        employeeRequests={employeeRequests}
        pagination={{ 1: { recurring: 1 } }}
      />
    );
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(defaultProps.handlePageChange).toHaveBeenCalledWith(1, 2, 'recurring');
  });

  it('should disable Previous button on first page', () => {
    render(
      <RecurringTable
        {...defaultProps}
        employeeRequests={{ batch1: [] }}
        pagination={{ 1: { recurring: 1 } }}
      />
    );
    const previousButton = screen.getByText('Previous');
    expect(previousButton).toBeDisabled();
  });it('should disable Next button on last page', () => {
    const employeeRequests = {
      batch1: [],
      batch2: [],
    };
  
    // First render with initial pagination
    const { rerender } = render(
      <RecurringTable
        {...defaultProps}
        employeeRequests={employeeRequests}
        pagination={{ 1: { recurring: 1 } }}
      />
    );
  
    // Click the "Next" button
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);
  
    // Re-render the component with updated pagination
    rerender(
      <RecurringTable
        {...defaultProps}
        employeeRequests={employeeRequests}
        pagination={{ 1: { recurring: 2 } }}
      />
    );
  
    // Verify the page number and that "Next" button is disabled
    expect(screen.getByText('Page 2 of 1')).toBeInTheDocument();
    expect(screen.getByTestId('next-button')).toBeDisabled();
  });

  it('should call fetchRequests when onRefreshRequests is called', () => {
    (ApproveRecurringEntry as jest.Mock).mockImplementation(({ onRefreshRequests }) => {
      onRefreshRequests();
      return <div>ApproveRecurringEntry Component</div>;
    });

    render(
      <RecurringTable
        {...defaultProps}
        employeeRequests={{ batch1: [] }}
      />
    );

    expect(defaultProps.fetchRequests).toHaveBeenCalled();
  });

  it('should call handleRequestClick when onRequestClick is called', () => {
    const requestId = 123;
    (ApproveRecurringEntry as jest.Mock).mockImplementation(({ onRequestClick }) => {
      onRequestClick(requestId);
      return <div>ApproveRecurringEntry Component</div>;
    });

    render(
      <RecurringTable
        {...defaultProps}
        employeeRequests={{ batch1: [] }}
      />
    );

    expect(defaultProps.handleRequestClick).toHaveBeenCalledWith(requestId);
  });
});