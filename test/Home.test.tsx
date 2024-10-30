// import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from '@/pages/index'
import { describe, expect } from "@jest/globals";



describe("Home", () => {
  test("renders the Home component correctly", () => {
    render(<Home />);
  
      // Use getAllByText to find all elements containing the text "Schedule"
      const scheduleElements = screen.getAllByText(/schedule/i); // Returns an array of elements
        // Check that at least one "Schedule" element is found
      expect(scheduleElements.length).toBeGreaterThan(0);
  });
});
