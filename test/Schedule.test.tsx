// import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect } from "@jest/globals";
import Schedule from "@/components/schedule";
import { Provider } from "react-redux";
import { store } from "@/redux/store";

// Create a mock store
const mockStore = store

// Mock the useRouter hook
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("Schedule", () => {
  test("renders the Schedule component correctly", () => {
    render(
      <Provider store={mockStore}>
        <Schedule />
      </Provider>
    );

    // Use getByTestId to find the Schedule component
    const scheduleElement = screen.getByTestId("schedule-component");
    // Check that at least one "Schedule" element is found
    expect(scheduleElement).toBeTruthy();
    
  });
});
