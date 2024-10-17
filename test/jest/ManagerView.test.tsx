// ManagerView.test.tsx

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ManagerView } from "@/components/schedule/ManagerView"; // Adjust the import path as necessary
import { useSelector } from "react-redux";
// Import the mocked API functions
import {
  generateTeamSchedule,
  generateManagerTeamSchedule,
} from "@/pages/api/scheduleApi";


// Mock the SpinnerIcon component
jest.mock("@/components/Svgs/spinner", () => ({
  SpinnerIcon: () => <div data-testid="spinner">Loading Spinner</div>,
}));

// Mock the API functions
jest.mock("@/pages/api/scheduleApi", () => ({
  generateTeamSchedule: jest.fn(),
  generateManagerTeamSchedule: jest.fn(),
}));

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
}));


describe("ManagerView Component", () => {
  const mockUseSelector = useSelector as unknown as jest.Mock;

  // Define mock data
  const mockOwnTeamSchedule = {
    "2024-10-15": 2,
    "2024-10-16": 1,
  };

  const mockInChargeTeamSchedule = {
    "Team X": {
      "2024-10-17": 3,
      "2024-10-18": 0,
    },
    "Team Y": {
      "2024-10-19": 1,
      "2024-10-20": 2,
    },
  };

  // Helper function to render the component with mocked useSelector
  const renderComponent = (state: any, onSelect = jest.fn()) => {
    mockUseSelector.mockImplementation((selectorFn: any) => selectorFn(state));
    render(<ManagerView onSelect={onSelect} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state initially and fetches own team schedule", async () => {
    // Mock useSelector to return staffId and role
    const state = {
      auth: {
        staffId: 1,
        role: "3", // Assuming '3' is Manager
      },
    };

    // Mock API response for own team schedule
    (generateTeamSchedule as jest.Mock).mockResolvedValue({
      team_schedule: mockOwnTeamSchedule,
    });

    const mockOnSelect = jest.fn();

    renderComponent(state, mockOnSelect);

    // Check that the loading state is displayed
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    // Wait for the API call to resolve and component to update
    await waitFor(() => expect(generateTeamSchedule).toHaveBeenCalledWith(1));
    await waitFor(() =>
      expect(mockOnSelect).toHaveBeenCalledWith(mockOwnTeamSchedule)
    );

    // Verify that the button displays "View Team In Charge" after loading
    expect(screen.getByText("View Team In Charge")).toBeInTheDocument();

    // Verify that "Currently Viewing: Own Team" is displayed
    expect(screen.getByText("Currently Viewing: Own Team")).toBeInTheDocument();

    // Ensure the loading spinner is no longer in the document
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });

  test("toggles to view in-charge teams and fetches managed team schedules", async () => {
    const state = {
      auth: {
        staffId: 2,
        role: "3",
      },
    };

    // Mock API responses
    (generateTeamSchedule as jest.Mock).mockResolvedValue({
      team_schedule: mockOwnTeamSchedule,
    });
    (generateManagerTeamSchedule as jest.Mock).mockResolvedValue({
      team_schedule: mockInChargeTeamSchedule,
    });

    const mockOnSelect = jest.fn();

    renderComponent(state, mockOnSelect);

    // Wait for initial fetch
    await waitFor(() => {
      expect(generateTeamSchedule).toHaveBeenCalledWith(2);
    });

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith(mockOwnTeamSchedule);
    });

    // Verify initial state
    expect(screen.getByText("View Team In Charge")).toBeInTheDocument();
    expect(screen.getByText("Currently Viewing: Own Team")).toBeInTheDocument();

    // Click the toggle button to view in-charge teams
    fireEvent.click(screen.getByText("View Team In Charge"));

    // Verify loading state during toggle
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    // Wait for managed team schedule fetch
    await waitFor(() => {
      expect(generateManagerTeamSchedule).toHaveBeenCalledWith(2);
    });

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith(mockInChargeTeamSchedule);
    });

    // Verify that the button now displays "View Own Team"
    expect(screen.getByText("View Own Team")).toBeInTheDocument();

    // Verify that "Currently Viewing: Team In Charge Of" is displayed
    expect(
      screen.getByText("Currently Viewing: Team In Charge Of")
    ).toBeInTheDocument();

    // Ensure the loading spinner is no longer in the document
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });

  test("toggles back to view own team from in-charge teams", async () => {
    const state = {
      auth: {
        staffId: 3,
        role: "3",
      },
    };

    // Mock API responses
    (generateTeamSchedule as jest.Mock).mockResolvedValue({
      team_schedule: mockOwnTeamSchedule,
    });
    (generateManagerTeamSchedule as jest.Mock).mockResolvedValue({
      team_schedule: mockInChargeTeamSchedule,
    });

    const mockOnSelect = jest.fn();

    renderComponent(state, mockOnSelect);

    // Wait for initial fetch
    await waitFor(() => expect(generateTeamSchedule).toHaveBeenCalledWith(3));
    await waitFor(() =>
      expect(mockOnSelect).toHaveBeenCalledWith(mockOwnTeamSchedule)
    );

    // Click the toggle button to view in-charge teams
    fireEvent.click(screen.getByText("View Team In Charge"));

    // Wait for managed team schedule fetch
    await waitFor(() => {
      expect(generateManagerTeamSchedule).toHaveBeenCalledWith(3);
    });

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith(mockInChargeTeamSchedule);
    });

    // Verify current state
    expect(screen.getByText("View Own Team")).toBeInTheDocument();
    expect(
      screen.getByText("Currently Viewing: Team In Charge Of")
    ).toBeInTheDocument();

    // Click the toggle button to switch back to own team
    fireEvent.click(screen.getByText("View Own Team"));

    // Verify loading state during toggle
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    // Wait for own team schedule fetch
    await waitFor(() => {
      expect(generateTeamSchedule).toHaveBeenCalledTimes(2); // Initial and after toggling back
    });

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith(mockOwnTeamSchedule);
    });
    // Verify that the button now displays "View Team In Charge"
    expect(screen.getByText("View Team In Charge")).toBeInTheDocument();

    // Verify that "Currently Viewing: Own Team" is displayed
    expect(screen.getByText("Currently Viewing: Own Team")).toBeInTheDocument();

    // Ensure the loading spinner is no longer in the document
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });

  test("handles errors during fetching own team schedule", async () => {
    const state = {
      auth: {
        staffId: 4,
        role: "3",
      },
    };

    // Mock API response to reject
    (generateTeamSchedule as jest.Mock).mockRejectedValue(
      new Error("Failed to fetch own team schedule")
    );

    const mockOnSelect = jest.fn();

    // Mock console.error to suppress error logs in test output
    console.error = jest.fn();

    renderComponent(state, mockOnSelect);

    // Wait for initial fetch to fail
    await waitFor(() => {
      expect(generateTeamSchedule).toHaveBeenCalledWith(4);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching own team schedule:",
        expect.any(Error)
      );
    });

    // Verify that "View Team In Charge" button is still present
    expect(screen.getByText("View Team In Charge")).toBeInTheDocument();

    // Verify that "Currently Viewing: Own Team" is displayed even if fetch failed
    expect(screen.getByText("Currently Viewing: Own Team")).toBeInTheDocument();

    // Ensure the loading spinner is no longer in the document
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    // Ensure onSelect was not called due to fetch failure
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  test("handles errors during fetching managed team schedules", async () => {
    const state = {
      auth: {
        staffId: 5,
        role: "3",
      },
    };

    // Mock API responses
    (generateTeamSchedule as jest.Mock).mockResolvedValue({
      team_schedule: mockOwnTeamSchedule,
    });
    (generateManagerTeamSchedule as jest.Mock).mockRejectedValue(
      new Error("Failed to fetch managed team schedules")
    );

    const mockOnSelect = jest.fn();

    // Mock console.error to suppress error logs in test output
    console.error = jest.fn();

    renderComponent(state, mockOnSelect);

    // Wait for initial fetch
    await waitFor(() => {
      expect(generateTeamSchedule).toHaveBeenCalledWith(5);
    });

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith(mockOwnTeamSchedule);
    });

    // Click the toggle button to view in-charge teams
    fireEvent.click(screen.getByText("View Team In Charge"));

    // Wait for managed team schedule fetch to fail
    await waitFor(async () => {
      expect(generateManagerTeamSchedule).toHaveBeenCalledWith(5);
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          "Error fetching in-charge team schedules:",
          expect.any(Error)
        );
      });
    });

    // Verify that the button now displays "View Own Team"
    expect(screen.getByText("View Own Team")).toBeInTheDocument();

    // Verify that "Currently Viewing: Team In Charge Of" is still displayed even if fetch failed
    expect(
      screen.getByText("Currently Viewing: Team In Charge Of")
    ).toBeInTheDocument();

    // Ensure the loading spinner is no longer in the document
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    // Ensure onSelect was not called again due to fetch failure
    expect(mockOnSelect).toHaveBeenCalledTimes(1); // Only initial call
  });

  test("button is disabled while loading", async () => {
    const state = {
      auth: {
        staffId: 6,
        role: "3",
      },
    };

    // Mock API responses with delayed resolution
    (generateTeamSchedule as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ team_schedule: mockOwnTeamSchedule }), 100)
        )
    );
    (generateManagerTeamSchedule as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ team_schedule: mockInChargeTeamSchedule }),
            100
          )
        )
    );

    const mockOnSelect = jest.fn();

    renderComponent(state, mockOnSelect);

    expect(screen.getByText(/Loading Spinner/i)).toBeInTheDocument();

    // Verify that the button is disabled during initial loading
    // Get the button without specifying the name
    const toggleButton = screen.getByRole("button");

    expect(toggleButton).toBeDisabled();
    expect(toggleButton).toHaveTextContent("Loading... Loading Spinner");

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(toggleButton).toBeEnabled();
    });

    await waitFor(() => {
      expect(toggleButton).toHaveTextContent("View Team In Charge");
    });

    // Click the toggle button to view in-charge teams
    fireEvent.click(toggleButton);

    // Verify that the button is disabled during loading
    expect(toggleButton).toBeDisabled();

    // Wait for managed team schedule fetch to complete
    await waitFor(() => {
      expect(toggleButton).toBeEnabled();
    });
  });

  test("onSelect is called with correct data after fetching own team schedule", async () => {
    const state = {
      auth: {
        staffId: 7,
        role: "3",
      },
    };

    // Mock API response for own team schedule
    (generateTeamSchedule as jest.Mock).mockResolvedValue({
      team_schedule: mockOwnTeamSchedule,
    });

    const mockOnSelect = jest.fn();

    renderComponent(state, mockOnSelect);

    // Wait for initial fetch
    await waitFor(() => {
      expect(generateTeamSchedule).toHaveBeenCalledWith(7);
    });

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith(mockOwnTeamSchedule);
    });
  });

  test("onSelect is called with correct data after fetching managed team schedules", async () => {
    const state = {
      auth: {
        staffId: 8,
        role: "3",
      },
    };

    // Mock API responses
    (generateTeamSchedule as jest.Mock).mockResolvedValue({
      team_schedule: mockOwnTeamSchedule,
    });
    (generateManagerTeamSchedule as jest.Mock).mockResolvedValue({
      team_schedule: mockInChargeTeamSchedule,
    });

    const mockOnSelect = jest.fn();

    renderComponent(state, mockOnSelect);

    // Wait for initial fetch
    await waitFor(() => {
      expect(generateTeamSchedule).toHaveBeenCalledWith(8);
    });

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith(mockOwnTeamSchedule);
    });

    // Click the toggle button to view in-charge teams
    fireEvent.click(screen.getByText("View Team In Charge"));

    // Wait for managed team schedule fetch
    await waitFor(() => {
      expect(generateManagerTeamSchedule).toHaveBeenCalledWith(8);
    });

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith(mockInChargeTeamSchedule);
    });
  });

  test("handles multiple toggle actions correctly", async () => {
    const state = {
      auth: {
        staffId: 9,
        role: "3",
      },
    };

    // Mock API responses
    (generateTeamSchedule as jest.Mock).mockResolvedValue({
      team_schedule: mockOwnTeamSchedule,
    });
    (generateManagerTeamSchedule as jest.Mock).mockResolvedValue({
      team_schedule: mockInChargeTeamSchedule,
    });

    const mockOnSelect = jest.fn();

    renderComponent(state, mockOnSelect);

    // Wait for initial fetch
    await waitFor(() => {
      expect(generateTeamSchedule).toHaveBeenCalledWith(9);
    });

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith(mockOwnTeamSchedule);
    });

    // Click the toggle button to view in-charge teams
    fireEvent.click(screen.getByText("View Team In Charge"));

    // Wait for managed team schedule fetch
    await waitFor(() => {
      expect(generateManagerTeamSchedule).toHaveBeenCalledWith(9);
    });

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith(mockInChargeTeamSchedule);
    });

    // Click the toggle button to view own team again
    fireEvent.click(screen.getByText("View Own Team"));

    // Wait for own team schedule fetch
    await waitFor(() => {
      expect(generateTeamSchedule).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith(mockOwnTeamSchedule);
    });

    // Click the toggle button again to view in-charge teams
    fireEvent.click(screen.getByText("View Team In Charge"));

    // Wait for managed team schedule fetch again
    await waitFor(() => {
      expect(generateManagerTeamSchedule).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith(mockInChargeTeamSchedule);
    });
  });

  test("does not toggle if already in the desired state", async () => {
    const state = {
      auth: {
        staffId: 10,
        role: "3",
      },
    };

    // Mock API responses
    (generateTeamSchedule as jest.Mock).mockResolvedValue({
      team_schedule: mockOwnTeamSchedule,
    });
    (generateManagerTeamSchedule as jest.Mock).mockResolvedValue({
      team_schedule: mockInChargeTeamSchedule,
    });

    const mockOnSelect = jest.fn();

    renderComponent(state, mockOnSelect);

    // Wait for initial fetch
    await waitFor(() => {
      expect(generateTeamSchedule).toHaveBeenCalledWith(10);
    });

    await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith(mockOwnTeamSchedule);
    });

    // Attempt to click "View Team In Charge" when already viewing own team
    fireEvent.click(screen.getByText("View Team In Charge"));

    // Wait for managed team schedule fetch
    await waitFor(() => {
      expect(generateManagerTeamSchedule).toHaveBeenCalledWith(10);
    });

    await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith(mockInChargeTeamSchedule);
    });

    // Attempt to click "View Team In Charge" again (already in in-charge view)
    fireEvent.click(screen.getByText("View Own Team"));

    // Wait for own team schedule fetch
    await waitFor(() => {
      expect(generateTeamSchedule).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith(mockOwnTeamSchedule);
    });

    // Attempt to click "View Own Team" again (already in own team view)
    fireEvent.click(screen.getByText("View Team In Charge"));

    // Wait for managed team schedule fetch again
    await waitFor(() => {
        expect(generateManagerTeamSchedule).toHaveBeenCalledTimes(2);
      });
  
      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith(mockInChargeTeamSchedule);
    });
  });
});
