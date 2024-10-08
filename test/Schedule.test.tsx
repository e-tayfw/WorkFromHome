import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect } from "@jest/globals";
import Schedule from "@/components/schedule";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { Provider } from "react-redux";
import { store } from "@/redux/store";

// Mock the useRouter hook from Next.js
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("Schedule", () => {
  beforeEach(() => {
    // Reset mocks before each test to avoid interference between tests
    jest.resetAllMocks();

    // Provide a mock implementation for useRouter
    const mockRouter = {
      query: {
        team: "exampleTeam",
      },
      // Add other properties if your component uses them
      push: jest.fn(),
      replace: jest.fn(),
      pathname: "/schedule",
      route: "/schedule",
      asPath: "/schedule",
    };

    // Mock the implementation of useRouter to return the mockRouter
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("next/router").useRouter.mockReturnValue(mockRouter);
  });

  beforeEach(() => {
    // Reset mocks before each test to avoid interference between tests
    jest.resetAllMocks();

    // Provide a mock implementation for useRouter
    const mockRouter = {
      query: {
        team: "exampleTeam",
      },
      // Add other properties if your component uses them
      push: jest.fn(),
      replace: jest.fn(),
      pathname: "/schedule",
      route: "/schedule",
      asPath: "/schedule",
    };

    // Mock the implementation of useRouter to return the mockRouter
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("next/router").useRouter.mockReturnValue(mockRouter);
  });

  test("renders the Schedule component correctly", () => {
    render(
      <Provider store={store}>
        <Schedule />
      </Provider>
    );
    render(
      <Provider store={store}>
        <Schedule />
      </Provider>
    );

    // Use getByTestId to find the Schedule component
    const scheduleElement = screen.getByTestId("schedule-component");
    expect(scheduleElement).toBeTruthy();
  });
});
