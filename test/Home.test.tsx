// import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "@/pages/index"
import { describe, expect } from "@jest/globals";



describe("Home", () => {
  test("renders the Home component correctly", () => {
    const { getByRole } = render(<Home />);

    // Example: Checking if an element with role 'main' exists
    const mainElement = getByRole("main"); // Adjust the selector as needed
    expect(mainElement).toBeTruthy();
  });
});
