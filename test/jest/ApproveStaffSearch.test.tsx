import React from "react";
import { render, screen } from "@testing-library/react";
import StaffSearch from "@/components/approve/search";
import { fireEvent } from "@testing-library/react";

describe("StaffSearch Component", () => {
  const mockSetSearchTerm = jest.fn();
  const employees = [
    { Staff_ID: 1, Staff_FName: "John", Staff_LName: "Doe" },
    { Staff_ID: 2, Staff_FName: "Jane", Staff_LName: "Smith" },
  ];

  test("should render without errors", () => {
    render(
      <StaffSearch
        searchTerm=""
        setSearchTerm={mockSetSearchTerm}
        employees={employees}
      />
    );
    expect(screen.getByLabelText(/search by name/i)).toBeInTheDocument();
  });

  test("should display the input field with correct placeholder and label", () => {
    render(
      <StaffSearch
        searchTerm=""
        setSearchTerm={mockSetSearchTerm}
        employees={employees}
      />
    );
    const inputElement = screen.getByPlaceholderText(/enter staff name/i);
    expect(inputElement).toBeInTheDocument();
    expect(screen.getByLabelText(/search by name/i)).toBeInTheDocument();
  });
  test("should update searchSuggestions when searchTerm changes", () => {
    const { rerender } = render(
      <StaffSearch
        searchTerm=""
        setSearchTerm={mockSetSearchTerm}
        employees={employees}
      />
    );
    const inputElement = screen.getByPlaceholderText(/enter staff name/i);

    // Update searchTerm to 'John'
    fireEvent.change(inputElement, { target: { value: "John" } });
    expect(mockSetSearchTerm).toHaveBeenCalledWith("John");

    // Rerender with updated searchTerm
    rerender(
      <StaffSearch
        searchTerm="John"
        setSearchTerm={mockSetSearchTerm}
        employees={employees}
      />
    );

    // Expect 'John Doe' to be in suggestions
    expect(screen.getByText(/Doe/i)).toBeInTheDocument();
  });

  test("should handle empty searchTerm and clear suggestions", () => {
    render(
      <StaffSearch
        searchTerm=""
        setSearchTerm={mockSetSearchTerm}
        employees={employees}
      />
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  test("should perform case-insensitive search", () => {
    const { rerender } = render(
      <StaffSearch
        searchTerm="jane"
        setSearchTerm={mockSetSearchTerm}
        employees={employees}
      />
    );
    expect(screen.getByText(/Smith/i)).toBeInTheDocument();

    rerender(
      <StaffSearch
        searchTerm="JANE"
        setSearchTerm={mockSetSearchTerm}
        employees={employees}
      />
    );
    expect(screen.getByText(/Smith/i)).toBeInTheDocument();
  });

  test("should handle no matching suggestions", () => {
    render(
      <StaffSearch
        searchTerm="Nonexistent"
        setSearchTerm={mockSetSearchTerm}
        employees={employees}
      />
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  test("should handle empty employees array", () => {
    render(
      <StaffSearch
        searchTerm="John"
        setSearchTerm={mockSetSearchTerm}
        employees={[]}
      />
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
  test("should display correct number of suggestions", () => {
    render(
      <StaffSearch
        searchTerm="J"
        setSearchTerm={mockSetSearchTerm}
        employees={employees}
      />
    );
    const suggestionItems = screen.getAllByRole("listitem");
    expect(suggestionItems.length).toBe(2);
  });

  test("should display employee full names in suggestions", () => {
    render(
      <StaffSearch
        searchTerm="John"
        setSearchTerm={mockSetSearchTerm}
        employees={employees}
      />
    );
    expect(screen.getByText(/Doe/i)).toBeInTheDocument();
  });

  test("clicking on a suggestion should update searchTerm and clear suggestions", () => {
    render(
      <StaffSearch
        searchTerm="J"
        setSearchTerm={mockSetSearchTerm}
        employees={employees}
      />
    );
    const suggestionItem = screen.getByText(/ohn Doe/i);
    fireEvent.mouseDown(suggestionItem);
    expect(mockSetSearchTerm).toHaveBeenCalledWith("John Doe");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  test("suggestions list should not be displayed when searchTerm is empty", () => {
    render(
      <StaffSearch
        searchTerm=""
        setSearchTerm={mockSetSearchTerm}
        employees={employees}
      />
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  test("pressing Enter key should clear searchSuggestions", () => {
    render(
      <StaffSearch
        searchTerm="J"
        setSearchTerm={mockSetSearchTerm}
        employees={employees}
      />
    );
    const inputElement = screen.getByPlaceholderText(/enter staff name/i);
    fireEvent.keyDown(inputElement, { key: "Enter", code: "Enter" });
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  test("blurring the input field should clear searchSuggestions", () => {
    render(
      <StaffSearch
        searchTerm="J"
        setSearchTerm={mockSetSearchTerm}
        employees={employees}
      />
    );
    const inputElement = screen.getByPlaceholderText(/enter staff name/i);
    fireEvent.blur(inputElement);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  test("typing into the input field should update searchTerm", () => {
    render(
      <StaffSearch
        searchTerm=""
        setSearchTerm={mockSetSearchTerm}
        employees={employees}
      />
    );
    const inputElement = screen.getByPlaceholderText(/enter staff name/i);
    fireEvent.change(inputElement, { target: { value: "Jane" } });
    expect(mockSetSearchTerm).toHaveBeenCalledWith("Jane");
  });
});




