// AdhocTable.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AdhocTable from "@/components/approve/adhoc";


// Mock the ApproveEntry component to avoid deep rendering
jest.mock("@/components/approve/adhocentry", () => {
  const MockApproveEntry = (props: any) => (
    <tr data-testid="approve-entry">
      <td>{props.dateRequested}</td>
      <td>{props.duration}</td>
      <td>{props.dateOfRequest}</td>
      <td>{props.status}</td>
      <td>{props.requestId}</td>
    </tr>
  );
  MockApproveEntry.displayName = "MockApproveEntry";
  return MockApproveEntry;
});

const mockEmployee = {
  Staff_ID: 1,
  Staff_FName: "John",
  Staff_LName: "Doe",
};

const mockRequests = [
  {
    requestId: 101,
    requestorId: 1,
    approverId: 2,
    status: "Pending",
    dateRequested: "2023-10-01",
    requestBatch: null,
    dateOfRequest: "2023-09-25",
    duration: "Full Day",
  },
  {
    requestId: 102,
    requestorId: 1,
    approverId: 2,
    status: "Approved",
    dateRequested: "2023-10-02",
    requestBatch: null,
    dateOfRequest: "2023-09-26",
    duration: "Half Day",
  },
  // Add more requests if needed
];

const mockPagination = {
  [mockEmployee.Staff_ID]: {
    adhoc: 1,
  },
};

// Mock functions
const mockHandlePageChange = jest.fn();
const mockRequestSort = jest.fn();
const mockGetSortIcon = jest
  .fn()
  .mockReturnValue(<span data-testid="sort-icon">^</span>);
const mockFetchRequests = jest.fn();
const mockHandleRequestClick = jest.fn();
const mockGetShortHeader = jest.fn((header) => header.slice(0, 4));

const defaultProps = {
  employeeAdhocRequests: mockRequests,
  employee: mockEmployee,
  pagination: mockPagination,
  requestsPerPage: 10,
  handlePageChange: mockHandlePageChange,
  requestSort: mockRequestSort,
  getSortIcon: mockGetSortIcon,
  fetchRequests: mockFetchRequests,
  handleRequestClick: mockHandleRequestClick,
  isMobile: false,
  getShortHeader: mockGetShortHeader,
  teamSize: 5,
};

describe("AdhocTable Component", () => {
  test("renders without crashing and displays the table when there are requests", () => {
    render(<AdhocTable {...defaultProps} />);
    expect(screen.getByText("Adhoc Requests")).toBeInTheDocument();
    expect(screen.getByText("Date Requested")).toBeInTheDocument();
    expect(screen.getByText("Duration")).toBeInTheDocument();
    expect(screen.getByText(/Date Of Request/i)).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  test("renders the correct number of ApproveEntry components", () => {
    render(<AdhocTable {...defaultProps} />);
    const entries = screen.getAllByTestId("approve-entry");
    expect(entries.length).toBe(mockRequests.length);
  });

  test("handles pagination correctly", () => {
    // Set requestsPerPage to 1 to test pagination
    const props = {
      ...defaultProps,
      requestsPerPage: 1,
    };
    render(<AdhocTable {...props} />);
    const entries = screen.getAllByTestId("approve-entry");
    expect(entries.length).toBe(1);
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();

    // Click "Next" button
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);
    expect(mockHandlePageChange).toHaveBeenCalledWith(
      mockEmployee.Staff_ID,
      2,
      "adhoc"
    );
  });

  test('disables the "Previous" button on the first page', () => {
    render(<AdhocTable {...defaultProps} />);
    const prevButton = screen.getByText("Previous");
    expect(prevButton).toBeDisabled();
  });

  test('disables the "Next" button when on the last page', () => {
    const props = {
      ...defaultProps,
      pagination: {
        [mockEmployee.Staff_ID]: {
          adhoc: 1,
        },
      },
      requestsPerPage: 2,
    };
    render(<AdhocTable {...props} />);
    const nextButton = screen.getByText("Next");
    expect(nextButton).toBeDisabled();
  });

  test("calls requestSort when table headers are clicked", () => {
    render(<AdhocTable {...defaultProps} />);
    const dateRequestedHeader = screen.getByText("Date Requested");
    fireEvent.click(dateRequestedHeader);
    expect(mockRequestSort).toHaveBeenCalledWith("dateRequested");
  });

});