// HRFilter.test.tsx

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HRFilter } from "@/components/schedule/HRFilter";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { getDepartmentList } from "@/pages/api/departmentApi";
import { getTeamList } from "@/pages/api/teamApi";
import { generateTeamSchedule } from "@/pages/api/scheduleApi";

jest.mock("@/pages/api/departmentApi");
jest.mock("@/pages/api/teamApi");
jest.mock("@/pages/api/scheduleApi");

const mockStore = configureStore([]);

describe("HRFilter Component", () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();
  });

  test("should render loading spinners initially", () => {
    (getDepartmentList as jest.Mock).mockReturnValue(new Promise(() => {}));
    (getTeamList as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(
      <Provider store={mockStore({ auth: { staffId: 1 } })}>
        <HRFilter onSelect={jest.fn()} />
      </Provider>
    );

    expect(
      screen.getByText(/Loading the departments available/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Loading the teams available/i)
    ).toBeInTheDocument();
  });

  test("should fetch and display departments and teams", async () => {
    const mockDepartments = {
      HR_department_schedule: {
        "Department A": {},
        "Department B": {},
      },
    };
    const mockTeams = {
      HR_team_schedule: {
        "Team X": {},
        "Team Y": {},
      },
    };

    (getDepartmentList as jest.Mock).mockResolvedValue(mockDepartments);
    (getTeamList as jest.Mock).mockResolvedValue(mockTeams);

    render(
      <Provider store={mockStore({ auth: { staffId: 1 } })}>
        <HRFilter onSelect={jest.fn()} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Select Department:/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/Select Team:/i)).toBeInTheDocument();
    });

    // Check departments
    expect(screen.getByText("-- Select a department --")).toBeInTheDocument();
    expect(screen.getByText("Department A")).toBeInTheDocument();
    expect(screen.getByText("Department B")).toBeInTheDocument();

    // Check teams
    expect(screen.getByText("-- Select a team --")).toBeInTheDocument();
    expect(screen.getByText("Team X")).toBeInTheDocument();
    expect(screen.getByText("Team Y")).toBeInTheDocument();
  });

  test("should handle department selection and call onSelect with correct data", async () => {
    const mockDepartments = {
      HR_department_schedule: {
        "Department A": { "20220101": 1 },
        "Department B": { "20220102": 2 },
      },
    };
    const mockTeams = {
      HR_team_schedule: {
        "Team X": {},
        "Team Y": {},
      },
    };

    (getDepartmentList as jest.Mock).mockResolvedValue(mockDepartments);
    (getTeamList as jest.Mock).mockResolvedValue(mockTeams);

    const mockOnSelect = jest.fn();

    render(
      <Provider store={mockStore({ auth: { staffId: 1 } })}>
        <HRFilter onSelect={mockOnSelect} />
      </Provider>
    );

    // Wait for departments and teams to load
    await waitFor(() => {
      expect(screen.getByText(/Select Department:/i)).toBeInTheDocument();
    });

    const departmentSelect = screen.getByTestId("department-select");

    fireEvent.change(departmentSelect, { target: { value: "Department A" } });

    expect(
      screen.getByText("Selected Department: Department A")
    ).toBeInTheDocument();
    expect(mockOnSelect).toHaveBeenCalledWith(
      mockDepartments.HR_department_schedule["Department A"]
    );
  });

  test("should handle team selection and call onSelect with correct data", async () => {
    const mockDepartments = {
      HR_department_schedule: {
        "Department A": {},
        "Department B": {},
      },
    };
    const mockTeams = {
      HR_team_schedule: {
        "Team X": { "20220103": 3 },
        "Team Y": { "20220104": 4 },
      },
    };

    (getDepartmentList as jest.Mock).mockResolvedValue(mockDepartments);
    (getTeamList as jest.Mock).mockResolvedValue(mockTeams);

    const mockOnSelect = jest.fn();

    render(
      <Provider store={mockStore({ auth: { staffId: 1 } })}>
        <HRFilter onSelect={mockOnSelect} />
      </Provider>
    );

    // Wait for departments and teams to load
    await waitFor(() => {
      expect(screen.getByText(/Select Team:/i)).toBeInTheDocument();
    });

    const teamSelect = screen.getByTestId("team-select");

    // Select a team
    fireEvent.change(teamSelect, {
      target: { value: "Team X" },
    });

    expect(screen.getByText("Selected Team: Team X")).toBeInTheDocument();
    expect(mockOnSelect).toHaveBeenCalledWith(
      mockTeams.HR_team_schedule["Team X"]
    );
  });

  test("should clear filters and reset to default schedule on clicking Clear Filters", async () => {
    const mockDepartments = {
      HR_department_schedule: {
        "Department A": {},
      },
    };
    const mockTeams = {
      HR_team_schedule: {
        "Team X": {},
      },
    };
    const mockDefaultSchedule = { "20220105": 5 };

    (getDepartmentList as jest.Mock).mockResolvedValue(mockDepartments);
    (getTeamList as jest.Mock).mockResolvedValue(mockTeams);
    (generateTeamSchedule as jest.Mock).mockResolvedValue({
      team_schedule: mockDefaultSchedule,
    });

    const mockOnSelect = jest.fn();

    render(
      <Provider store={mockStore({ auth: { staffId: 1 } })}>
        <HRFilter onSelect={mockOnSelect} />
      </Provider>
    );

    // Wait for departments and teams to load
    await waitFor(() => {
      expect(screen.getByText(/Select Department:/i)).toBeInTheDocument();
    });

    const departmentSelect = screen.getByTestId("department-select");

    fireEvent.change(departmentSelect, { target: { value: "Department A" } });

    // Click Clear Filters
    fireEvent.click(screen.getByText("Clear Filters"));

    // Wait for default schedule to load
    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith(mockDefaultSchedule);
    });

    // Check that selections are cleared
    expect(screen.queryByText("Selected Department:")).not.toBeInTheDocument();
    expect(
      screen.getByText("Currently Viewing Your Own Team")
    ).toBeInTheDocument();
  });

  test("should prioritize team selection over department selection", async () => {
    const mockDepartments = {
      HR_department_schedule: {
        "Department A": { "20220101": 1 },
      },
    };
    const mockTeams = {
      HR_team_schedule: {
        "Team X": { "20220102": 2 },
      },
    };

    (getDepartmentList as jest.Mock).mockResolvedValue(mockDepartments);
    (getTeamList as jest.Mock).mockResolvedValue(mockTeams);

    const mockOnSelect = jest.fn();

    render(
      <Provider store={mockStore({ auth: { staffId: 1 } })}>
        <HRFilter onSelect={mockOnSelect} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Select Department:/i)).toBeInTheDocument();
    });

    const departmentSelect = screen.getByTestId("department-select");

    fireEvent.change(departmentSelect, { target: { value: "Department A" } });

    const teamSelect = screen.getByTestId("team-select");

    // Select a team
    fireEvent.change(teamSelect, {
      target: { value: "Team X" },
    });

    expect(screen.getByText("Selected Team: Team X")).toBeInTheDocument();
    expect(screen.queryByText("Selected Department:")).not.toBeInTheDocument();
    expect(mockOnSelect).toHaveBeenCalledWith(
      mockTeams.HR_team_schedule["Team X"]
    );
  });

  test("should handle errors during data fetching", async () => {
    (getDepartmentList as jest.Mock).mockRejectedValue(
      new Error("Failed to fetch departments")
    );
    (getTeamList as jest.Mock).mockRejectedValue(
      new Error("Failed to fetch teams")
    );

    console.error = jest.fn(); // Mock console.error to suppress error output in test

    render(
      <Provider store={mockStore({ auth: { staffId: 1 } })}>
        <HRFilter onSelect={jest.fn()} />
      </Provider>
    );

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching department list:",
        expect.any(Error)
      );
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching team list:",
        expect.any(Error)
      );
    });

    // Optionally, check for error messages in the UI if implemented
  });

  test('should display "Currently Viewing Your Own Team" when no selection is made', async () => {
    const mockDepartments = {
      HR_department_schedule: {},
    };
    const mockTeams = {
      HR_team_schedule: {},
    };

    (getDepartmentList as jest.Mock).mockResolvedValue(mockDepartments);
    (getTeamList as jest.Mock).mockResolvedValue(mockTeams);

    render(
      <Provider store={mockStore({ auth: { staffId: 1 } })}>
        <HRFilter onSelect={jest.fn()} />
      </Provider>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Currently Viewing Your Own Team")
      ).toBeInTheDocument();
    });
  });

  test('should disable "Clear Filters" button when loading default schedule', async () => {
    const mockDepartments = {
      HR_department_schedule: {},
    };
    const mockTeams = {
      HR_team_schedule: {},
    };
    const mockDefaultSchedule = { "20220105": 5 };

    (getDepartmentList as jest.Mock).mockResolvedValue(mockDepartments);
    (getTeamList as jest.Mock).mockResolvedValue(mockTeams);
    (generateTeamSchedule as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ team_schedule: mockDefaultSchedule }), 100)
        )
    );

    render(
      <Provider store={mockStore({ auth: { staffId: 1 } })}>
        <HRFilter onSelect={jest.fn()} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Clear Filters")).toBeInTheDocument();
    });

    // Click 'Clear Filters' and check if the button is disabled
    fireEvent.click(screen.getByText("Clear Filters"));

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Loading.../i })).toBeDisabled();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText("Clear Filters")).toBeEnabled();
    });
  });

  test("should not call onSelect if no team or department is selected", async () => {
    const mockDepartments = {
      HR_department_schedule: {},
    };
    const mockTeams = {
      HR_team_schedule: {},
    };

    (getDepartmentList as jest.Mock).mockResolvedValue(mockDepartments);
    (getTeamList as jest.Mock).mockResolvedValue(mockTeams);

    const mockOnSelect = jest.fn();

    render(
      <Provider store={mockStore({ auth: { staffId: 1 } })}>
        <HRFilter onSelect={mockOnSelect} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Select Department:/i)).toBeInTheDocument();
    });

    // No selection made, onSelect should not be called
    expect(mockOnSelect).not.toHaveBeenCalled();
  });
});
