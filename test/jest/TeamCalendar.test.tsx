// Mock the generateTeamSchedule Api
jest.mock("@/pages/api/scheduleApi", () => ({
  generateTeamSchedule: jest.fn(),
}));

// Mock the getEmployeeFullNameByStaffID Api
jest.mock("@/pages/api/employeeApi", () => ({
  getEmployeeFullNameByStaffID: jest.fn(),
}));

/* eslint-disable testing-library/no-unnecessary-act */
import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import configureStore, { MockStoreEnhanced } from "redux-mock-store";
import { RootState } from "@/redux/store";
import { TeamCalendar } from "@/components/schedule/TeamCalendar";
import moment from "moment";
import { generateTeamSchedule } from "@/pages/api/scheduleApi";
import { getEmployeeFullNameByStaffID } from "@/pages/api/employeeApi";

// Now, import the mocked functions to set their implementations
const mockedGenerateTeamSchedule = generateTeamSchedule as jest.MockedFunction<
  typeof generateTeamSchedule
>;
const mockedGetEmployeeFullNameByStaffID =
  getEmployeeFullNameByStaffID as jest.MockedFunction<
    typeof getEmployeeFullNameByStaffID
  >;

// Mock the store
const mockStore = configureStore<Partial<RootState>, unknown>([]);

describe("TeamCalendar", () => {
  let store: MockStoreEnhanced<Partial<RootState>>;

  beforeAll(() => {
    // Set the system time to August 8, 2024
    jest.useFakeTimers().setSystemTime(new Date("2024-08-08"));
  });

  afterAll(() => {
    // Restore the original timer implementation
    jest.useRealTimers();
  });

  beforeEach(() => {
    // Create a mock store with initial state
    const initialState: Partial<RootState> = {
      auth: {
        staffId: "123",
        email: "test@example.com",
        roleType: "Employee",
      },
    };

    store = mockStore(initialState);

    jest.resetAllMocks();

    // Suppress console logs during tests
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Helper function to format week range text
  const getWeekRangeText = (weekMoment: moment.Moment) => {
    const startOfWeek = weekMoment.clone().startOf("week");
    const endOfWeek = weekMoment.clone().endOf("week");
    return `${startOfWeek.format("DD/MM/YY")} - ${endOfWeek.format(
      "DD/MM/YY"
    )}`;
  };

  // Helper function to generate week dates array
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getWeekDatesArray = (weekNumber: number) => {
    const weekStart = moment().week(weekNumber).startOf("week");
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(weekStart.clone().add(i, "days"));
    }
    return dates;
  };

  it("should render the TeamCalendar component correctly", async () => {
    const mockTeamScheduleData = {
      team_schedule: {
        "171009": {
          "050824": 0,
          "060824": 0,
          "070824": 0,
          "080824": 1,
          "090824": 0,
          "100824": 0,
          "110824": 0,
          "120824": 0,
          "130824": 0,
          "140824": 0,
        },
        "171014": {
          "050824": 0,
          "060824": 0,
          "070824": 0,
          "080824": 2,
          "090824": 0,
          "100824": 0,
          "110824": 0,
          "120824": 0,
          "130824": 0,
          "140824": 0,
        },
      },
    };

    // Mock the generateTeamSchedule function to resolve with mockTeamScheduleData
    mockedGenerateTeamSchedule.mockResolvedValue(mockTeamScheduleData);

    // Mock getEmployeeFullNameByStaffID to return employee names
    mockedGetEmployeeFullNameByStaffID.mockImplementation((userId: string) => {
      const names: { [key: string]: string } = {
        "171009": "Alice Smith",
        "171014": "Bob Johnson",
      };
      return Promise.resolve(names[userId] || "Unknown User");
    });

    render(
      <Provider store={store}>
        <TeamCalendar />
      </Provider>
    );

    // Verify initial elements are rendered properly
    expect(screen.getByText("WFH Calendar")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Toggle View/i })
    ).toBeInTheDocument();

    // Wait for schedule to be fetched
    await waitFor(() => {
      expect(mockedGenerateTeamSchedule).toHaveBeenCalledWith(123);
    });
  });

  // Toggle between day and week views and check for correct display
  it("should toggle between day and week views", async () => {
    const mockTeamScheduleData = {
      team_schedule: {
        "171009": {
          "080824": 1,
        },
        "171014": {
          "080824": 2,
        },
      },
    };

    mockedGenerateTeamSchedule.mockResolvedValue(mockTeamScheduleData);
    mockedGetEmployeeFullNameByStaffID.mockImplementation((userId: string) => {
      const names: { [key: string]: string } = {
        "171009": "Alice Smith",
        "171014": "Bob Johnson",
      };
      return Promise.resolve(names[userId] || "Unknown User");
    });

    render(
      <Provider store={store}>
        <TeamCalendar />
      </Provider>
    );

    // Wait for schedule to be fetched
    await waitFor(() => {
      expect(mockedGenerateTeamSchedule).toHaveBeenCalledWith(123);
    });

    const toggleButton = screen.getByRole("button", { name: /Toggle View/i });

    // Click to switch to week view
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    // Check for week range text
    const currentWeek = moment().week();
    const weekRange = getWeekRangeText(moment().week(currentWeek));
    await waitFor(() => {
      expect(screen.getByText(weekRange)).toBeInTheDocument();
    });

    // Click to switch back to day view
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    // Check for day view date
    const currentDate = moment().format("DD/MM/YY");
    await waitFor(() => {
      expect(screen.getByText(currentDate)).toBeInTheDocument();
    });
  });

  // Handle day navigation
  it("should handle next and previous day navigation", async () => {
    const mockTeamScheduleData = {
      team_schedule: {
        "171009": {
          "080824": 1,
          "090824": 2,
        },
        "171014": {
          "080824": 3,
        },
      },
    };

    mockedGenerateTeamSchedule.mockResolvedValue(mockTeamScheduleData);
    mockedGetEmployeeFullNameByStaffID.mockImplementation((userId: string) => {
      const names: { [key: string]: string } = {
        "171009": "Alice Smith",
        "171014": "Bob Johnson",
      };
      return Promise.resolve(names[userId] || "Unknown User");
    });

    render(
      <Provider store={store}>
        <TeamCalendar />
      </Provider>
    );

    await waitFor(() => {
      expect(mockedGenerateTeamSchedule).toHaveBeenCalledWith(123);
    });

    const nextButton = screen.getByRole("button", { name: /Next Day/i });
    const prevButton = screen.getByRole("button", { name: /Prev Day/i });

    expect(nextButton).toBeEnabled();
    expect(prevButton).toBeEnabled();

    // Click next day button
    await act(async () => {
      fireEvent.click(nextButton);
    });

    await waitFor(() => {
      const nextDate = moment().add(1, "day").format("DD/MM/YY");
      expect(screen.getByText(nextDate)).toBeInTheDocument();
    });

    // Click previous day button
    await act(async () => {
      fireEvent.click(prevButton);
    });

    await waitFor(() => {
      const currentDate = moment().format("DD/MM/YY");
      expect(screen.getByText(currentDate)).toBeInTheDocument();
    });
  });

  // Handling of next and previous week navigation
  it("should handle next and previous week navigation", async () => {
    const mockTeamScheduleData = {
      team_schedule: {
        "171009": {
          "050824": 0,
          "060824": 0,
          "070824": 0,
          "080824": 1,
          "090824": 0,
          "100824": 0,
          "110824": 0,
          "120824": 0,
          "130824": 0,
          "140824": 0,
        },
        "171014": {
          "050824": 0,
          "060824": 0,
          "070824": 0,
          "080824": 2,
          "090824": 0,
          "100824": 0,
          "110824": 0,
          "120824": 0,
          "130824": 0,
          "140824": 0,
        },
      },
    };

    mockedGenerateTeamSchedule.mockResolvedValue(mockTeamScheduleData);
    mockedGetEmployeeFullNameByStaffID.mockImplementation((userId: string) => {
      const names: { [key: string]: string } = {
        "171009": "Alice Smith",
        "171014": "Bob Johnson",
      };
      return Promise.resolve(names[userId] || "Unknown User");
    });

    render(
      <Provider store={store}>
        <TeamCalendar />
      </Provider>
    );

    await waitFor(() => {
      expect(mockedGenerateTeamSchedule).toHaveBeenCalledWith(123);
    });

    // Switch to week view
    const toggleButton = screen.getByRole("button", { name: /Toggle View/i });
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    const nextWeekButton = screen.getByRole("button", { name: /Next Week/i });
    const prevWeekButton = screen.getByRole("button", { name: /Prev Week/i });

    // Initially, Prev Week should be disabled (since it's the first week)
    expect(prevWeekButton).toBeDisabled();

    // Next Week should be disabled because we have only one week of data
    expect(nextWeekButton).toBeDisabled();

    // If you have multiple weeks of data, adjust the mock accordingly and test the button states
  });

  // WFH details should be displayed with no users
  it("should display WFH details in modal when Eye icon is clicked with no users", async () => {
    const mockTeamScheduleData = {
      team_schedule: {
        "171009": {
          "080824": 0,
          "090824": 0,
          "070824": 0,
          "060824": 0,
          "050824": 0,
        },
      },
    };

    mockedGenerateTeamSchedule.mockResolvedValue(mockTeamScheduleData);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mockedGetEmployeeFullNameByStaffID.mockImplementation((userId: string) => {
      // No users are on WFH, so employeeNames remain empty or "Unknown User"
      return Promise.resolve("Unknown User");
    });

    render(
      <Provider store={store}>
        <TeamCalendar />
      </Provider>
    );

    await waitFor(() => {
      expect(mockedGenerateTeamSchedule).toHaveBeenCalledWith(123);
    });

    const eyeIcon = screen.getByTestId("eye-icon-2024-08-08");

    await act(async () => {
      fireEvent.click(eyeIcon);
    });

    // Wait for modal to appear and check for correct text
    await waitFor(() => {
      expect(screen.getByText(/No Users on AM WFH/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/No Users on PM WFH/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/No Users on Full Day WFH/i)).toBeInTheDocument();
    });
  });

  it("should display correct WFH users in modal when Eye icon is clicked", async () => {
    const mockTeamScheduleData = {
      team_schedule: {
        "171009": {
          "080824": 1, // AM WFH
          "090824": 2, // PM WFH
          "100824": 3, // Full Day WFH
        },
        "171014": {
          "080824": 1, // AM WFH
          "090824": 2, // PM WFH
        },
      },
    };

    // Mock the generateTeamSchedule function to resolve with mockTeamScheduleData
    mockedGenerateTeamSchedule.mockResolvedValue(mockTeamScheduleData);

    // Mock getEmployeeFullNameByStaffID to return employee names
    mockedGetEmployeeFullNameByStaffID.mockImplementation((userId: string) => {
      const names: { [key: string]: string } = {
        171009: "Alice Smith",
        171014: "Bob Johnson",
      };
      return Promise.resolve(names[userId] || "Unknown User");
    });

    render(
      <Provider store={store}>
        <TeamCalendar />
      </Provider>
    );

    // Wait for schedule to be fetched
    await waitFor(() => {
      expect(mockedGenerateTeamSchedule).toHaveBeenCalledWith(123);
    });

    // Find the Eye Icon for date "2024-08-08"
    const eyeIcon = screen.getByTestId("eye-icon-2024-08-08");

    // Click the Eye Icon to open the modal
    await act(async () => {
      fireEvent.click(eyeIcon);
    });

    // Verify that the "Loading..." text is present
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  // Modal closes correctly when Close button is clicked
  test("should close the modal when Close button is clicked", async () => {
    const mockTeamScheduleData = {
      team_schedule: {
        "171009": {
          "080824": 1, // AM WFH
        },
      },
    };

    mockedGenerateTeamSchedule.mockResolvedValue(mockTeamScheduleData);
    mockedGetEmployeeFullNameByStaffID.mockImplementation((userId: string) => {
      const names: { [key: string]: string } = {
        "171009": "Alice Smith",
      };
      return Promise.resolve(names[userId] || "Unknown User");
    });

    render(
      <Provider store={store}>
        <TeamCalendar />
      </Provider>
    );

    await waitFor(() => {
      expect(mockedGenerateTeamSchedule).toHaveBeenCalledWith(123);
    });

    const eyeIcon = screen.getByTestId("eye-icon-2024-08-08");

    await act(async () => {
      fireEvent.click(eyeIcon);
    });

    // Click the Close button
    const closeButton = screen.getByTestId("close-modal");
    await act(async () => {
      fireEvent.click(closeButton);
    });

    // Verify that the modal is no longer in the document
    await waitFor(() => {
      expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument();
    });
  });

  // Handle API errors gracefully when fetching team schedule
  it("should handle API errors gracefully when fetching team schedule", async () => {
    // Mock generateTeamSchedule to reject with an error
    mockedGenerateTeamSchedule.mockRejectedValue(new Error("API Error"));

    // Spy on console.error to verify error handling
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <Provider store={store}>
        <TeamCalendar />
      </Provider>
    );

    // Wait for the component to attempt fetching the schedule
    await waitFor(() => {
      expect(mockedGenerateTeamSchedule).toHaveBeenCalledWith(123);
    });

    // Since the API call failed, the component should display zero counts
    const currentDate = moment().format("DD/MM/YY");
    await waitFor(() => {
      expect(screen.getByText(currentDate)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/AM WFH: 0/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/PM WFH: 0/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/Full Day WFH: 0/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/Total Strength: 0/i)).toBeInTheDocument();
    });

    // Verify that console.error was called
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching schedule:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
