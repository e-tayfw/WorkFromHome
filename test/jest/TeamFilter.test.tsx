import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Filter } from "@/components/schedule/Filter";
import { getTeamList } from "@/pages/api/teamApi";

// Mock the API call
jest.mock("@/pages/api/teamApi", () => ({
  getTeamList: jest.fn(),
}));

describe("Filter Component - Team Mode", () => {
  test("displays loading while fetching teams", async () => {
    (getTeamList as jest.Mock).mockResolvedValueOnce({ HR_team_schedule: {} });

    render(<Filter onSelect={jest.fn()} filterType="team" />);

    // Ensure the loading message is displayed
    expect(
      screen.getByText(/loading the teams available/i)
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.queryByText(/loading the teams available/i)
      ).not.toBeInTheDocument()
    );
  });

  test("displays teams in the select dropdown after loading", async () => {
    const mockTeamData = {
      HR_team_schedule: {
        "Team A": {},
        "Team B": {},
      },
    };
    (getTeamList as jest.Mock).mockResolvedValueOnce(mockTeamData);

    render(<Filter onSelect={jest.fn()} filterType="team" />);

    // Ensure the team select is rendered
    await waitFor(() => {
      expect(
        screen.getByText(/Select Manager's Team/i)
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: "-- Select a team --" })
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: "Team A" })
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: "Team B" })
      ).toBeInTheDocument();
    });
  });

  test("calls onSelect when a team is selected", async () => {
    const mockOnSelect = jest.fn();
    const mockTeamData = {
      HR_team_schedule: {
        "Team A": { someSchedule: 1 },
      },
    };
    (getTeamList as jest.Mock).mockResolvedValueOnce(mockTeamData);

    render(<Filter onSelect={mockOnSelect} filterType="team" />);

    // Wait for the combobox (select element) to be rendered
    expect(await screen.findByRole("combobox")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Team A" },
    });

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith(
        mockTeamData["HR_team_schedule"]["Team A"]
      );
    });

    expect(mockOnSelect).toHaveBeenCalledWith(
      mockTeamData["HR_team_schedule"]["Team A"]
    );
  });
});
