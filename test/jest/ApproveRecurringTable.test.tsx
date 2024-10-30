// RecurringTable.test.tsx

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RecurringTable from "@/components/approve/recurring";

// Mock the ApproveRecurringEntry component since it's used within RecurringTable
jest.mock("@/components/approve/recurringentry", () => {
  const MockApproveRecurringEntry = () => (
    <tr>
      <td colSpan={5}>ApproveRecurringEntry Component</td>
    </tr>
  );
  MockApproveRecurringEntry.displayName = "MockApproveRecurringEntry";
  return MockApproveRecurringEntry;
});

describe("RecurringTable Component", () => {
  const defaultProps = {
    employeeRequests: {},
    employee: { Staff_ID: 1 },
    pagination: {},
    handlePageChange: jest.fn(),
    fetchRequests: jest.fn(),
    handleRequestClick: jest.fn(),
    isMobile: false,
    teamSize: 5,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders nothing when there are no requests", () => {
    render(<RecurringTable {...defaultProps} />);
    expect(screen.queryByText("Recurring Requests")).not.toBeInTheDocument();
  });

  test("renders batches and requests correctly", () => {
    const employeeRequests = {
      Batch1: [
        {
          requestId: 1,
          requestorId: 101,
          approverId: 201,
          status: "Pending",
          dateRequested: "2023-10-01",
          requestBatch: "Batch1",
          dateOfRequest: "2023-09-20",
          duration: "Full Day",
        },
        {
          requestId: 2,
          requestorId: 102,
          approverId: 202,
          status: "Approved",
          dateRequested: "2023-10-02",
          requestBatch: "Batch1",
          dateOfRequest: "2023-09-21",
          duration: "Half Day",
        },
      ],
      Batch2: [
        {
          requestId: 3,
          requestorId: 103,
          approverId: 203,
          status: "Pending",
          dateRequested: "2023-10-03",
          requestBatch: "Batch2",
          dateOfRequest: "2023-09-22",
          duration: "Full Day",
        },
      ],
    };

    const props = {
      ...defaultProps,
      employeeRequests,
      pagination: { 1: { recurring: 1 } },
    };

    render(<RecurringTable {...props} />);

    // Check that 'Recurring Requests' title is displayed
    expect(screen.getByText("Recurring Requests")).toBeInTheDocument();

    // Check that Batch1 and Batch2 are displayed
    expect(screen.getByText("Batch: Batch1")).toBeInTheDocument();
    expect(screen.getByText("Batch: Batch2")).toBeInTheDocument();

    // Check that the ApproveRecurringEntry component is rendered twice
    expect(screen.getAllByText("ApproveRecurringEntry Component").length).toBe(
      2
    );
  });

  test("paginates batches correctly and calls handlePageChange on Next", () => {
    const employeeRequests = {
      Batch1: [
        {
          requestId: 1,
          requestorId: 101,
          approverId: 201,
          status: "Pending",
          dateRequested: "2023-10-01",
          requestBatch: "Batch1",
          dateOfRequest: "2023-09-20",
          duration: "Full Day",
        },
      ],
      Batch2: [
        {
          requestId: 2,
          requestorId: 102,
          approverId: 202,
          status: "Approved",
          dateRequested: "2023-10-02",
          requestBatch: "Batch2",
          dateOfRequest: "2023-09-21",
          duration: "Half Day",
        },
      ],
      Batch3: [
        {
          requestId: 3,
          requestorId: 103,
          approverId: 203,
          status: "Pending",
          dateRequested: "2023-10-03",
          requestBatch: "Batch3",
          dateOfRequest: "2023-09-22",
          duration: "Full Day",
        },
      ],
    };

    const props = {
      ...defaultProps,
      employeeRequests,
      pagination: { 1: { recurring: 1 } },
    };

    render(<RecurringTable {...props} />);

    // Batches per page is 2, so Batch1 and Batch2 should be displayed
    expect(screen.getByText("Batch: Batch1")).toBeInTheDocument();
    expect(screen.getByText("Batch: Batch2")).toBeInTheDocument();
    expect(screen.queryByText("Batch: Batch3")).not.toBeInTheDocument();

    // Click on Next button
    fireEvent.click(screen.getByTestId("next-button"));

    // handlePageChange should be called with correct arguments
    expect(props.handlePageChange).toHaveBeenCalledWith(1, 2, "recurring");
  });

  test("disables Previous button on first page and Next button on last page", () => {
    const employeeRequests = {
      Batch1: [
        {
          requestId: 1,
          requestorId: 101,
          approverId: 201,
          status: "Pending",
          dateRequested: "2023-10-01",
          requestBatch: "Batch1",
          dateOfRequest: "2023-09-20",
          duration: "Full Day",
        },
      ],
      Batch2: [
        {
          requestId: 2,
          requestorId: 102,
          approverId: 202,
          status: "Approved",
          dateRequested: "2023-10-02",
          requestBatch: "Batch2",
          dateOfRequest: "2023-09-21",
          duration: "Half Day",
        },
      ],
    };

    const props = {
      ...defaultProps,
      employeeRequests,
      pagination: { 1: { recurring: 1 } },
    };

    render(<RecurringTable {...props} />);

    // Previous button should be disabled on first page
    expect(screen.getByText("Previous")).toBeDisabled();

    // Next button should be disabled because there are only 2 batches and batchesPerPage is 2
    expect(screen.getByText("Next")).toBeDisabled();
  });

  test("calls handlePageChange on Previous button click", () => {
    const employeeRequests = {
      Batch1: [
        {
          requestId: 1,
          requestorId: 101,
          approverId: 201,
          status: "Pending",
          dateRequested: "2023-10-01",
          requestBatch: "Batch1",
          dateOfRequest: "2023-09-20",
          duration: "Full Day",
        },
      ],
      Batch2: [
        {
          requestId: 2,
          requestorId: 102,
          approverId: 202,
          status: "Approved",
          dateRequested: "2023-10-02",
          requestBatch: "Batch2",
          dateOfRequest: "2023-09-21",
          duration: "Half Day",
        },
      ],
      Batch3: [
        {
          requestId: 3,
          requestorId: 103,
          approverId: 203,
          status: "Pending",
          dateRequested: "2023-10-03",
          requestBatch: "Batch3",
          dateOfRequest: "2023-09-22",
          duration: "Full Day",
        },
      ],
    };

    const props = {
      ...defaultProps,
      employeeRequests,
      pagination: { 1: { recurring: 2 } }, // Set current page to 2
    };

    render(<RecurringTable {...props} />);

    // Previous button should be enabled
    expect(screen.getByText("Previous")).toBeEnabled();

    // Click on Previous button
    fireEvent.click(screen.getByText("Previous"));

    // handlePageChange should be called with correct arguments
    expect(props.handlePageChange).toHaveBeenCalledWith(1, 1, "recurring");
  });

  test("displays correct page number and total pages", () => {
    const employeeRequests = {
      Batch1: [
        {
          requestId: 1,
          requestorId: 101,
          approverId: 201,
          status: "Pending",
          dateRequested: "2023-10-01",
          requestBatch: "Batch1",
          dateOfRequest: "2023-09-20",
          duration: "Full Day",
        },
      ],
      Batch2: [
        {
          requestId: 2,
          requestorId: 102,
          approverId: 202,
          status: "Approved",
          dateRequested: "2023-10-02",
          requestBatch: "Batch2",
          dateOfRequest: "2023-09-21",
          duration: "Half Day",
        },
      ],
      Batch3: [
        {
          requestId: 3,
          requestorId: 103,
          approverId: 203,
          status: "Pending",
          dateRequested: "2023-10-03",
          requestBatch: "Batch3",
          dateOfRequest: "2023-09-22",
          duration: "Full Day",
        },
      ],
      Batch4: [
        {
          requestId: 4,
          requestorId: 104,
          approverId: 204,
          status: "Rejected",
          dateRequested: "2023-10-04",
          requestBatch: "Batch4",
          dateOfRequest: "2023-09-23",
          duration: "Full Day",
        },
      ],
    };

    const props = {
      ...defaultProps,
      employeeRequests,
      pagination: { 1: { recurring: 2 } }, // Current page is 2
    };

    render(<RecurringTable {...props} />);

    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
  });
});
