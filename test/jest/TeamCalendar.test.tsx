// TeamCalendar.test.tsx

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TeamCalendar } from "@/components/schedule/TeamCalendar"; // Adjust the import path as necessary
import { useSelector } from "react-redux";
import moment from "moment";

interface Schedule {
  [date: string]: number;
}

interface ScheduleData {
  [userId: string]: Schedule;
}

// Mock Redux's useSelector
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

// Mock the API calls
jest.mock("@/pages/api/employeeApi", () => ({
  getEmployeeFullNameByStaffID: jest.fn(),
}));

describe("TeamCalendar", () => {
  beforeAll(() => {
    jest.useFakeTimers({ now: new Date("2023-01-01") });
    jest.setSystemTime(new Date("2023-01-01"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test("renders without crashing", () => {
    // Mock useSelector to return a staffId
    (useSelector as unknown as jest.Mock).mockReturnValue("123");

    // Sample selectedSchedule prop
    const sampleSelectedSchedule: Record<string, Record<string, number>> = {
      "1": { "010123": 1, "020123": 2 },
      "2": { "010123": 3, "020123": 0 },
    };

    render(<TeamCalendar selectedSchedule={sampleSelectedSchedule} />);

    // Check that the component renders expected elements
    expect(screen.getByText("WFH Calendar")).toBeInTheDocument();
    expect(screen.getByText("Toggle View")).toBeInTheDocument();
  });

  test("toggles between day and week view", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("123");
    const sampleSelectedSchedule: ScheduleData = {
      "1": { "010123": 1 },
    };

    render(<TeamCalendar selectedSchedule={sampleSelectedSchedule} />);

    // Initially, should be in day view
    expect(screen.getByText("Prev Day")).toBeInTheDocument();

    // Click on Toggle View
    fireEvent.click(screen.getByText("Toggle View"));

    // Now, should be in week view
    expect(screen.getByText("Prev Week")).toBeInTheDocument();

    // Click again to toggle back
    fireEvent.click(screen.getByText("Toggle View"));

    // Should be back in day view
    expect(screen.getByText("Prev Day")).toBeInTheDocument();
  });

  test("handles next day navigation", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("123");

    const sampleSelectedSchedule: Record<string, Record<string, number>> = {
      "1": {
        "010123": 1,
        "020123": 2,
        "030123": 3,
        "040123": 0,
        "050123": 0,
        "060123": 0,
        "070123": 0,
        "080123": 1,
      },
    };
    render(<TeamCalendar selectedSchedule={sampleSelectedSchedule} />);

    const initialDate = moment().format("DD/MM/YY");
    expect(screen.getByText(initialDate)).toBeInTheDocument();

    // Click Next Day
    fireEvent.click(screen.getByText("Next Day"));
    const nextDate = moment().add(1, "days").format("DD/MM/YY");
    expect(screen.getByText(nextDate)).toBeInTheDocument();
  });

  test("handles previous day navigation", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("123");
    const sampleSelectedSchedule: Record<string, Record<string, number>> = {
      "1": {
        "251222": 1,
        "261222": 0,
        "271222": 0,
        "281222": 0,
        "291222": 0,
        "301222": 0,
        "311222": 0,
        "010123": 1,
      },
    };
    render(<TeamCalendar selectedSchedule={sampleSelectedSchedule} />);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const initialDate = moment().format("DD/MM/YY");
    // Click Prev Day twice
    fireEvent.click(screen.getByText("Prev Day"));
    const prevDate = moment().subtract(1, "days").format("DD/MM/YY");
    expect(screen.getByText(prevDate)).toBeInTheDocument();
  });

  test("handles next week navigation", async () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("123");
    const sampleSelectedSchedule = {
      "1": { "010123": 1, "080123": 1, "150123": 1 }, // Include valid dates for navigation
    };

    render(<TeamCalendar selectedSchedule={sampleSelectedSchedule} />);

    // Toggle to week view
    fireEvent.click(screen.getByText("Toggle View"));

    const currentWeekNumber = moment().week();
    const weekStart = moment()
      .week(currentWeekNumber)
      .startOf("week")
      .format("DD/MM/YY");
    const weekEnd = moment()
      .week(currentWeekNumber)
      .endOf("week")
      .format("DD/MM/YY");

    // Wait for the current week's date range to appear
    expect(await screen.findByText(`${weekStart} - ${weekEnd}`)).toBeInTheDocument();

    // Navigate to next week
    fireEvent.click(screen.getByText("Next Week"));

    const nextWeekNumber = currentWeekNumber + 1;
    const nextWeekStart = moment()
      .week(nextWeekNumber)
      .startOf("week")
      .format("DD/MM/YY");
    const nextWeekEnd = moment()
      .week(nextWeekNumber)
      .endOf("week")
      .format("DD/MM/YY");
    console.log(nextWeekStart, nextWeekEnd);
    // Wait for the next week's date range to appear
    expect(
      await screen.findByText(`${nextWeekStart} - ${nextWeekEnd}`)
    ).toBeInTheDocument();
  });

  test("handles previous week navigation", async () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("123");
    const sampleSelectedSchedule = {
      "1": { "251222": 1, "010123": 1, "080123": 1, "150123": 1 }, // Include valid dates for navigation
    };

    render(<TeamCalendar selectedSchedule={sampleSelectedSchedule} />);

    // Toggle to week view
    fireEvent.click(screen.getByText("Toggle View"));

    const currentWeekNumber = moment().week();
    const weekStart = moment()
      .week(currentWeekNumber)
      .startOf("week")
      .format("DD/MM/YY");
    const weekEnd = moment()
      .week(currentWeekNumber)
      .endOf("week")
      .format("DD/MM/YY");

    // Wait for the current week's date range to appear
    expect(await screen.findByText(`${weekStart} - ${weekEnd}`)).toBeInTheDocument();

    // Navigate to previous week
    fireEvent.click(screen.getByText("Prev Week"));

    const prevWeekNumber = currentWeekNumber - 1;
    const prevWeekStart = moment()
      .week(prevWeekNumber)
      .startOf("week")
      .format("DD/MM/YY");
    const prevWeekEnd = moment()
      .week(prevWeekNumber)
      .endOf("week")
      .format("DD/MM/YY");

    // Wait for the previous week's date range to appear
    expect(
      await screen.findByText(`${prevWeekStart} - ${prevWeekEnd}`)
    ).toBeInTheDocument();
  });

  test("disables next button appropriately", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("123");

    const today = moment().format("DDMMYY");
    const tomorrow = moment().add(1, "days").format("DDMMYY");
    const yesterday = moment().subtract(1, "days").format("DDMMYY");

    const sampleSelectedSchedule = {
      "1": {
        [yesterday]: 0,
        [today]: 1,
        [tomorrow]: 2,
      },
    };

    render(<TeamCalendar selectedSchedule={sampleSelectedSchedule} />);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const prevDayButton = screen.getByText("Prev Day");
    const nextDayButton = screen.getByText("Next Day");
    fireEvent.click(nextDayButton);

    // Next Day should be enabled
    expect(nextDayButton).toBeDisabled();
  });

  test("disables prev button appropriately", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("123");

    const today = moment().format("DDMMYY");
    const tomorrow = moment().add(1, "days").format("DDMMYY");
    const yesterday = moment().subtract(1, "days").format("DDMMYY");

    const sampleSelectedSchedule = {
      "1": {
        [yesterday]: 0,
        [today]: 1,
        [tomorrow]: 2,
      },
    };

    render(<TeamCalendar selectedSchedule={sampleSelectedSchedule} />);

    const prevDayButton = screen.getByText("Prev Day");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const nextDayButton = screen.getByText("Next Day");

    fireEvent.click(prevDayButton);

    expect(prevDayButton).toBeDisabled();
  });

  test("opens and closes the modal correctly", async () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("123");

    const today = moment().format("DDMMYY");
    const sampleSelectedSchedule = {
      "1": { [today]: 1 },
    };

    render(<TeamCalendar selectedSchedule={sampleSelectedSchedule} />);

    const eyeIcon = screen.getByTestId(
      `eye-icon-${moment().format("YYYY-MM-DD")}`
    );

    // Click on the eye icon
    fireEvent.click(eyeIcon);

    // The modal should open
    expect(await screen.findByText(/WFH Schedule/i)).toBeInTheDocument();

    // Click on the close button
    const closeButton = screen.getByTestId("close-modal");
    fireEvent.click(closeButton);

    // The modal should close
    await waitFor(() => {
      expect(screen.queryByText(/WFH Schedule/i)).not.toBeInTheDocument();
    });
    expect(screen.queryByText(/John Doe/i)).not.toBeInTheDocument();
  });

  test("fetches and displays correct data in modal", async () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("123");

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getEmployeeFullNameByStaffID } = require("@/pages/api/employeeApi");
    getEmployeeFullNameByStaffID.mockResolvedValue("John Doe");

    const today = moment().format("DDMMYY");
    const sampleSelectedSchedule = {
      "1": { [today]: 3 }, // Full day WFH
    };

    render(<TeamCalendar selectedSchedule={sampleSelectedSchedule} />);

    const eyeIcon = screen.getByTestId(
      `eye-icon-${moment().format("YYYY-MM-DD")}`
    );
    fireEvent.click(eyeIcon);

    // Wait for modal to open and data to load
    expect(await screen.findByText(/Staff on Full Day WFH: John Doe/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Staff on Full Day WFH: John Doe/)
    ).toBeInTheDocument();
  });

  // test("search within modal works", async () => {
  //   (useSelector as unknown as jest.Mock).mockReturnValue("123");

  //   // eslint-disable-next-line @typescript-eslint/no-var-requires
  //   const { getEmployeeFullNameByStaffID } = require("@/pages/api/employeeApi");
  //   getEmployeeFullNameByStaffID.mockImplementation((staffId: string) => {
  //     const names: { [key: string]: string } = {
  //       "1": "John Doe",
  //       "2": "Jane Smith",
  //     };
  //     return Promise.resolve(names[staffId] || "Unknown User");
  //   });

  //   const today = moment().format("DDMMYY");
  //   const sampleSelectedSchedule = {
  //     "1": { [today]: 3 },
  //     "2": { [today]: 3 },
  //   };

  //   render(<TeamCalendar selectedSchedule={sampleSelectedSchedule} />);

  //   const eyeIcon = screen.getByTestId(
  //     `eye-icon-${moment().format("YYYY-MM-DD")}`
  //   );
  //   fireEvent.click(eyeIcon);

  //   // Wait for names to be displayed
  //   await screen.findByText(/John Doe, Jane Smith/i);

  //   // Type in the search input
  //   const searchInput = screen.getByPlaceholderText("Search by name");
  //   fireEvent.change(searchInput, { target: { value: "Jane" } });

  //   // Check that only Jane Smith is displayed
  //   expect(screen.queryByText(/John Doe/i)).not.toBeInTheDocument();
  //   expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
  // });

  test("renders correct data for day view", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("123");

    const today = moment().format("DDMMYY");
    const sampleSelectedSchedule = {
      "1": { [today]: 1 },
      "2": { [today]: 2 },
      "3": { [today]: 3 },
      "4": { [today]: 0 },
    };

    render(<TeamCalendar selectedSchedule={sampleSelectedSchedule} />);

    expect(screen.getByText(`AM WFH: 1`)).toBeInTheDocument();
    expect(screen.getByText(`PM WFH: 1`)).toBeInTheDocument();
    expect(screen.getByText(`Full Day WFH: 1`)).toBeInTheDocument();
    expect(screen.getByText(`Total Strength: 1`)).toBeInTheDocument();
  });

  test("renders correct data for week view", () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("123");

    const sampleSelectedSchedule = {
      "1": { "010123": 1 },
      "2": { "020123": 2 },
      "3": { "030123": 3 },
      "4": { "040123": 0 },
    };

    render(<TeamCalendar selectedSchedule={sampleSelectedSchedule} />);

    // Toggle to week view
    fireEvent.click(screen.getByText("Toggle View"));

    // Check that the days are rendered with correct data
    const amWfhElements = screen.getAllByText(/AM WFH: \d+/);
    const pmWfhElements = screen.getAllByText(/PM WFH: \d+/);
    const fullDayWfhElements = screen.getAllByText(/Full Day WFH: \d+/);
    const totalStrengthElements = screen.getAllByText(/Total Strength: \d+/);

    expect(amWfhElements.length).toBeGreaterThan(0);
    expect(pmWfhElements.length).toBeGreaterThan(0);
    expect(fullDayWfhElements.length).toBeGreaterThan(0);
    expect(totalStrengthElements.length).toBeGreaterThan(0);
  });

  test("displays message when there are no users on WFH", async () => {
    (useSelector as unknown as jest.Mock).mockReturnValue("123");

    const today = moment().format("DDMMYY");
    const sampleSelectedSchedule = {
      "1": { [today]: 0 }, // No WFH
    };

    render(<TeamCalendar selectedSchedule={sampleSelectedSchedule} />);

    const eyeIcon = screen.getByTestId(
      `eye-icon-${moment().format("YYYY-MM-DD")}`
    );
    fireEvent.click(eyeIcon);

    // Wait for modal to open
    expect(await screen.findByText(/WFH Schedule/i)).toBeInTheDocument();

    // Check that the messages indicate no users on WFH
    expect(
      screen.getByText("Staff on AM WFH: No Users on AM WFH")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Staff on PM WFH: No Users on PM WFH")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Staff on Full Day WFH: No Users on Full Day WFH")
    ).toBeInTheDocument();
  });
});
