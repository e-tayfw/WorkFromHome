/* eslint-disable testing-library/no-unnecessary-act */
// WFHCalendar.test.tsx

import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { WFHCalendar } from "@/components/schedule/Calendar/index";
import { Provider } from "react-redux";
import configureStore, { MockStoreEnhanced } from "redux-mock-store";
import { RootState } from "@/redux/store";
import { generateOwnSchedule } from "@/pages/api/scheduleApi";

// Mock the generateOwnSchedule API call
jest.mock("@/pages/api/scheduleApi", () => ({
  generateOwnSchedule: jest.fn(),
}));

const mockStore = configureStore<Partial<RootState>, unknown>([]);

describe("WFHCalendar", () => {
  let store: MockStoreEnhanced<Partial<RootState>>;

  beforeAll(() => {
    // Set the system time to January 1st, 2023
    jest.useFakeTimers({ now: new Date("2023-01-01") });
    jest.setSystemTime(new Date("2023-01-01"));
  });

  afterAll(() => {
    // Restore the original timer implementation
    jest.useRealTimers();
  });

  beforeEach(() => {
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

  /**
   * Helper function to mock API response
   */
  const mockScheduleResponse = (scheduleData: Record<string, number>) => {
    (generateOwnSchedule as jest.Mock).mockResolvedValue({
      schedule: scheduleData,
    });
  };

  /**
   * Test Case 1: Initial Render
   */
  test("renders the WFHCalendar component with initial data correctly", async () => {
    const mockScheduleData = {
      "010123": 1, // 01-01-23: AM WFH
      "020123": 2, // 02-01-23: PM WFH
      "030123": 3, // 03-01-23: Full Day WFH
    };

    // Mock the generateOwnSchedule function
    mockScheduleResponse(mockScheduleData);

    render(
      <Provider store={store}>
        <WFHCalendar />
      </Provider>
    );

    // eslint-disable-next-line testing-library/no-debugging-utils
    screen.debug();

    // Verify that the component renders the title
    await waitFor(() => {
      expect(screen.getByText("WFH Calendar")).toBeInTheDocument();
    });

    // Verify that the initial date is displayed
    expect(screen.getByText("01-01-23")).toBeInTheDocument();

    // Verify that WFH categories are displayed with initial data
    await waitFor(() => {
      expect(screen.getByText("AM WFH")).toBeInTheDocument();
    });
  });

  /**
   * Test Case 2: Navigate to Next Day (First Time)
   */
  test("navigates to the next day and displays updated WFH data", async () => {
    const initialScheduleData = {
      "010123": 1, // 01-01-23: AM WFH
      "020123": 2, // 02-01-23: PM WFH
      "030123": 3, // 03-01-23: Full Day WFH
    };

    // Mock the initial API response
    mockScheduleResponse(initialScheduleData);

    render(
      <Provider store={store}>
        <WFHCalendar />
      </Provider>
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText("01-01-23")).toBeInTheDocument();
    });

    // Click the "Next Day" button to navigate to 02-01-23
    const nextDayButton = screen.getByText("Next Day");
    await act(async () => {
      fireEvent.click(nextDayButton);
    });

    // Verify that the date has updated
    await waitFor(() => {
      expect(screen.getByText("02-01-23")).toBeInTheDocument();
    });

    // Verify that WFH categories are updated
    expect(screen.getByText("PM WFH")).toBeInTheDocument();
  });

  /**
   * Test Case 3: Navigate to Next Day (Second Time)
   */
  test("navigates to the next day again and displays further updated WFH data", async () => {
    const initialScheduleData = {
      "010123": 1, // 01-01-23: AM WFH
      "020123": 2, // 02-01-23: PM WFH
      "030123": 3, // 03-01-23: Full Day WFH
    };

    // Mock the initial API response
    mockScheduleResponse(initialScheduleData);

    render(
      <Provider store={store}>
        <WFHCalendar />
      </Provider>
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText("01-01-23")).toBeInTheDocument();
    });

    // Click the "Next Day" button to navigate to 02-01-23
    const nextDayButton = screen.getByText("Next Day");
    await act(async () => {
      fireEvent.click(nextDayButton);
    });

    // Wait for the date to update
    await waitFor(() => {
      expect(screen.getByText("02-01-23")).toBeInTheDocument();
    });

    // Click the "Next Day" button again to navigate to 03-01-23
    await act(async () => {
      fireEvent.click(nextDayButton);
    });

    // Verify that the date has updated
    await waitFor(() => {
      expect(screen.getByText("03-01-23")).toBeInTheDocument();
    });

    // Verify that WFH categories are updated
    expect(screen.getByText("Full Day WFH")).toBeInTheDocument();
  });

  /**
   * Test Case 4: Navigate Back to Previous Day
   */
  test("navigates back to the previous day and displays correct WFH data", async () => {
    const initialScheduleData = {
      "010123": 1, // 01-01-23: AM WFH
      "020123": 2, // 02-01-23: PM WFH
      "030123": 3, // 03-01-23: Full Day WFH
    };

    // Mock the initial API response
    mockScheduleResponse(initialScheduleData);

    render(
      <Provider store={store}>
        <WFHCalendar />
      </Provider>
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText("01-01-23")).toBeInTheDocument();
    });

    // Click the "Next Day" button to navigate to 02-01-23
    const nextDayButton = screen.getByText("Next Day");
    await act(async () => {
      fireEvent.click(nextDayButton);
    });

    // Wait for the date to update to 02-01-23
    await waitFor(() => {
      expect(screen.getByText("02-01-23")).toBeInTheDocument();
    });

    // Now, click the "Prev Day" button to navigate back to 01-01-23
    const prevDayButton = screen.getByText("Prev Day");
    await act(async () => {
      fireEvent.click(prevDayButton);
    });

    // Verify that the date has reverted back to 01-01-23
    await waitFor(() => {
      expect(screen.getByText("01-01-23")).toBeInTheDocument();
    });

    // Verify that WFH categories are correctly displayed
    expect(screen.getByText("AM WFH")).toBeInTheDocument();
  });
});
