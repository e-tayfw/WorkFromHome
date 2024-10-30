// AdhocApproveEntry.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdhocApproveEntry from "@/components/approve/adhocentry";
import "@testing-library/jest-dom";
import axios from "axios";
import ActionHandler from "@/components/approve/actionHandler";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock ActionHandler
jest.mock("@/components/approve/actionHandler", () => ({
  handleApprove: jest.fn(),
  handleReject: jest.fn(),
  handleWithdraw: jest.fn(),
}));

describe("AdhocApproveEntry Component", () => {
  const defaultProps = {
    requestId: 1,
    requestorName: "John Doe",
    requestorId: 1,
    approverId: 2,
    status: "Pending",
    dateRequested: "2023-10-01",
    requestBatch: null,
    dateOfRequest: "2023-09-25",
    duration: "FD",
    teamSize: 5,
    onRefreshRequests: jest.fn(),
    onRequestClick: jest.fn(),
    isMobile: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without crashing and displays correct data", () => {
    render(<AdhocApproveEntry {...defaultProps} />);

    expect(screen.getByText("2023-10-01")).toBeInTheDocument();
    expect(screen.getByText("FD")).toBeInTheDocument();
    expect(screen.getByText("2023-09-25")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  test("fetches and sets proportion correctly", async () => {
    // Mock API response
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        "2023-10-01": {
          "FD": 0.4,
        },
      },
    });

    render(<AdhocApproveEntry {...defaultProps} />);

    expect(screen.getByLabelText("oval-loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://127.0.0.1:8085/api/request/proportionOfTeam/2"
      );
    });

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByLabelText("oval-loading")).not.toBeInTheDocument();
    });
  });

  test("renders action buttons when status is pending", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        "2023-10-01": {
          "FD": 0.4,
        },
      },
    });

    render(<AdhocApproveEntry {...defaultProps} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByLabelText("oval-loading")).not.toBeInTheDocument();
    });

    const approveButton = screen.getByText("Approve");
    const rejectButton = screen.getByText("Reject");

    expect(approveButton).toBeInTheDocument();
    expect(rejectButton).toBeInTheDocument();
  });


  test("does not render action buttons when status is approved", async () => {
    const props = {
      ...defaultProps,
      status: "Approved",
    };

    render(<AdhocApproveEntry {...props} />);

    // Since status is 'Approved', the component should not fetch proportion
    expect(mockedAxios.get).not.toHaveBeenCalled();

    // Action buttons should not be rendered
    expect(screen.queryByText("Approve")).not.toBeInTheDocument();
    expect(screen.queryByText("Reject")).not.toBeInTheDocument();
  });

  test("renders Withdraw button when status is approved and date is in range", async () => {
    const props = {
      ...defaultProps,
      status: "Approved",
      dateRequested: "2023-10-01",
    };

    // Mock the current date to be "2023-10-15"
    const mockCurrentDate = new Date("2023-10-15");

    // Use fake timers
    jest.useFakeTimers().setSystemTime(mockCurrentDate);

    render(<AdhocApproveEntry {...props} />);

    // Withdraw button should be rendered
    const withdrawButton = screen.getByText("Withdraw");
    expect(withdrawButton).toBeInTheDocument();

    // Click the withdraw button
    fireEvent.click(withdrawButton);

    expect(ActionHandler.handleWithdraw).toHaveBeenCalledWith({
      requestId: props.requestId,
      managerId: props.approverId,
      onWithdraw: props.onRefreshRequests,
    });

  });

  test("calls onRequestClick when row is clicked", () => {
    render(<AdhocApproveEntry {...defaultProps} />);

    // eslint-disable-next-line testing-library/no-node-access
    const row = screen.getByText("2023-10-01").parentElement;
    if (row) {
      fireEvent.click(row);
    }

    expect(defaultProps.onRequestClick).toHaveBeenCalledWith(
      defaultProps.requestId
    );
  });

  test("displays status short form when isMobile is true", () => {
    const props = {
      ...defaultProps,
      isMobile: true,
      status: "Approved",
    };

    render(<AdhocApproveEntry {...props} />);

    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

   
});
