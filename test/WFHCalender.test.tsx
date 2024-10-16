// WFHCalendar.test.tsx

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  test("renders the WFHCalendar component correctly", async () => {
    const mockScheduleData = {
      schedule: {
        "010123": 1,
        "020123": 2,
        "030123": 3,
      },
    };

    // Mock the generateOwnSchedule function to resolve with mockScheduleData
    (generateOwnSchedule as jest.Mock).mockResolvedValue(mockScheduleData);

    render(
      <Provider store={store}>
        <WFHCalendar />
      </Provider>
    );

    // Wait for the component to finish rendering the async data
    // Wait for the specific elements to appear
    await waitFor(() => {
      expect(screen.getByText("WFH Calendar")).toBeInTheDocument();
    });

    // Additional assertions
    await waitFor(() => {
      expect(screen.getByText("01-01-23")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("AM WFH")).toBeInTheDocument();
    });

    // Click the "Next Day" button to navigate to 02-01-23
    const nextDayButton = screen.getByText("Next Day");
    fireEvent.click(nextDayButton);

    await waitFor(() => {
      expect(screen.getByText("02-01-23")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("PM WFH")).toBeInTheDocument();
    });

    // Click the "Next Day" button again to navigate to 03-01-23
    fireEvent.click(nextDayButton);

    await waitFor(() => {
      expect(screen.getByText("03-01-23")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Full Day WFH")).toBeInTheDocument();
    });

    // Click the "Prev Day" button to go back to 02-01-23
    const prevDayButton = screen.getByText("Prev Day");
    fireEvent.click(prevDayButton);

    await waitFor(() => {
      expect(screen.getByText("02-01-23")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("PM WFH")).toBeInTheDocument();
    });

  });
});
