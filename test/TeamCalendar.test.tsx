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

// Mock the store
const mockStore = configureStore<Partial<RootState>, unknown>([]);

describe("TeamCalendar", () => {
  let store: MockStoreEnhanced<Partial<RootState>>;
  beforeAll(() => {
    // Set the system time to January 1st, 2023
    jest.useFakeTimers({ now: new Date("2024-08-08") });
    jest.setSystemTime(new Date("2024-08-08"));
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

    // Mock the generateOwnSchedule function to resolve with mockScheduleData
    (generateTeamSchedule as jest.Mock).mockResolvedValue(mockTeamScheduleData);

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
  });

  // toggle between day and week views and check for correct display
  it("should toggle between day and week views", async () => {
    render(
      <Provider store={store}>
        <TeamCalendar />
      </Provider>
    );

    const toggleButton = screen.getByRole("button", { name: /Toggle View/i });

    // Click to switch to week view
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    await waitFor(() => {
      expect(
        screen.getByText(/\d{2}\/\d{2}\/\d{2} - \d{2}\/\d{2}\/\d{2}/)
      ).toBeInTheDocument();
    });

    // Click to switch back to day view
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    await waitFor(() => {
      expect(screen.getByText(moment().format("DD/MM/YY"))).toBeInTheDocument();
    });
  });

  // handle day navigation 
  it("should handle next and previous day navigation", async () => {
    render(
      <Provider store={store}>
        <TeamCalendar />
      </Provider>
    );

    const nextButton = screen.getByRole("button", { name: /Next Day/i });
    const prevButton = screen.getByRole("button", { name: /Prev Day/i });

    expect(nextButton).toBeEnabled();
    expect(prevButton).toBeEnabled();

    // Click next day button
    // eslint-disable-next-line testing-library/no-unnecessary-act
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

  // handling of next and previous week navigation
  it("should handle next and previous week navigation", async () => {
    render(
      <Provider store={store}>
        <TeamCalendar />
      </Provider>
    );

    // Switch to week view
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Toggle View/i }));
    });

    const nextWeekButton = screen.getByRole("button", { name: /Next Week/i });
    const prevWeekButton = screen.getByRole("button", { name: /Prev Week/i });

    expect(nextWeekButton).toBeEnabled();
    expect(prevWeekButton).toBeEnabled();

    // Click next week button
    await act(async () => {
      fireEvent.click(nextWeekButton);
    });

    await waitFor(() => {
      const nextWeek = moment().add(1, "week");
      expect(screen.getByText(getWeekRangeText(nextWeek))).toBeInTheDocument();
    });

    // Click previous week button
    await act(async () => {
      fireEvent.click(prevWeekButton);
    });

    await waitFor(() => {
      const currentWeek = moment();
      expect(
        screen.getByText(getWeekRangeText(currentWeek))
      ).toBeInTheDocument();
    });
  });

  // WFH details should be displayed with no users
  it("should display WFH details in modal when Eye icon is clicked", async () => {
    render(
      <Provider store={store}>
        <TeamCalendar />
      </Provider>
    );

    // Click on the Eye icon
    const eyeIcon = await screen.findByTestId("eye-icon");
    // eslint-disable-next-line testing-library/no-unnecessary-act
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

  // Helper function to format week range text
  const getWeekRangeText = (weekMoment: moment.Moment) => {
    const startOfWeek = weekMoment.startOf("week").format("DD/MM/YY");
    const endOfWeek = weekMoment.endOf("week").format("DD/MM/YY");
    return `${startOfWeek} - ${endOfWeek}`;
  };
});
