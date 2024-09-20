// import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect } from "@jest/globals";
import Schedule from "@/components/schedule";


// Mock the useRouter hook
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("Schedule", () => {
  test("renders the Schedule component correctly", () => {
    render(<Schedule />);

    // Use getByTestId to find the Schedule component
    const scheduleElement = screen.getByTestId("schedule-component");
    // Check that at least one "Schedule" element is found
    expect(scheduleElement).toBeTruthy();
    
  });
});
