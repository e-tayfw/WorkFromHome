import { Filter } from "@/components/schedule/Filter";
import { getDepartmentList } from "@/pages/api/departmentApi";
import { getTeamList } from "@/pages/api/teamApi";

jest.mock("@/pages/api/departmentApi", () => ({
  getDepartmentList: jest.fn(),
}));

jest.mock("@/pages/api/teamApi", () => ({
  getTeamList: jest.fn(),
}));
import { render, waitFor, screen } from "@testing-library/react";

describe("Filter Component - No Data", () => {
  test("displays appropriate message when no teams are found", async () => {
    (getTeamList as jest.Mock).mockResolvedValueOnce({ HR_team_schedule: {} });

    render(<Filter onSelect={jest.fn()} filterType="team" />);

    await waitFor(() => {
      expect(screen.getByText("-- Select a team --")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText("No teams available")).not.toBeInTheDocument();
    });
  });

  test("displays appropriate message when no departments are found", async () => {
    (getDepartmentList as jest.Mock).mockResolvedValueOnce({ HR_department_schedule: {} });

    render(<Filter onSelect={jest.fn()} filterType="department" />);

    await waitFor(() => {
        expect(screen.getByText("-- Select a department --")).toBeInTheDocument();
      });
  
      await waitFor(() => {
        expect(screen.queryByText("No departments available")).not.toBeInTheDocument();
    });
  });
});
