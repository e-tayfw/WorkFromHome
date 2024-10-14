import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Filter } from "@/components/schedule/Filter";
import { getDepartmentList } from "@/pages/api/departmentApi";

// Mock the API call
jest.mock("@/pages/api/departmentApi", () => ({
  getDepartmentList: jest.fn(),
}));

describe("Filter Component - Department Mode", () => {
  test("displays loading spinner while fetching departments", async () => {
    (getDepartmentList as jest.Mock).mockResolvedValueOnce({ HR_department_schedule: {} });

    render(<Filter onSelect={jest.fn()} />);

    // Ensure the loading message is displayed
    expect(
      screen.getByText(/loading the departments available/i)
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.queryByText(/loading the departments available/i)
      ).not.toBeInTheDocument()
    );
  });

  test("displays departments in the select dropdown after loading", async () => {
    const mockDepartmentData = {
      HR_department_schedule: {
        Finance: {},
        HR: {},
      },
    };
    (getDepartmentList as jest.Mock).mockResolvedValueOnce(mockDepartmentData);

    render(<Filter onSelect={jest.fn()} />);

    expect(await screen.findByText(/Select Department:/i)).toBeInTheDocument();
    expect(await screen.findByRole("option", { name: "-- Select a department --" })).toBeInTheDocument();
    expect(await screen.findByRole("option", { name: "Finance" })).toBeInTheDocument();
    expect(await screen.findByRole("option", { name: "HR" })).toBeInTheDocument();
  });

  test("calls onSelect when a department is selected", async () => {
    const mockOnSelect = jest.fn();
    const mockDepartmentData = {
      HR_department_schedule: {
        Finance: { someSchedule: 1 },
      },
    };
    (getDepartmentList as jest.Mock).mockResolvedValueOnce(mockDepartmentData);

    render(<Filter onSelect={mockOnSelect} />);

    expect(await screen.findByRole("combobox")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Finance" },
    });

    expect(mockOnSelect).toHaveBeenCalledWith(
      mockDepartmentData["HR_department_schedule"]["Finance"]
    );
  });
});
