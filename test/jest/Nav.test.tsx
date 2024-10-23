// Nav.test.tsx

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Nav from "@/components/nav";
import { Provider } from "react-redux";
import { RootState } from "@/redux/store";
import { getEmployeeFullNameByStaffID } from "@/pages/api/employeeApi";
import configureStore from "redux-mock-store";

// Mock the useRouter hook from next/navigation
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    // Include other router methods if needed
  }),
}));

// Mock the useRouter hook from next/router
jest.mock("next/router", () => ({
  useRouter: () => ({
    pathname: "/",
    push: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    // Include other router properties/methods if needed
  }),
}));

// Mock the getEmployeeFullNameByStaffID function
jest.mock("@/pages/api/employeeApi", () => ({
  getEmployeeFullNameByStaffID: jest.fn(),
}));

// Mock the logout action
jest.mock("@/redux/slices/authSlice", () => ({
  ...jest.requireActual("@/redux/slices/authSlice"),
  logout: jest.fn(() => ({ type: "auth/logout" })),
}));

const mockStore = configureStore<Partial<RootState>>([]);

describe("Nav Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("displays the fetched full name properly", async () => {
    // Mock the API response
    const mockFullName = "John Doe";
    (getEmployeeFullNameByStaffID as jest.Mock).mockResolvedValueOnce(
      mockFullName
    );

    // Mock the Redux store
    const initialState: Partial<RootState> = {
      auth: {
        staffId: 123,
        email: "",
        roleType: "",
        role: "",
        dept: "",
      },
    };
    const store = mockStore(initialState);

    // Render the component
    render(
      <Provider store={store}>
        <Nav />
      </Provider>
    );

    // Wait for the full name to be displayed
    const greetings = await screen.findAllByText(`Hi, ${mockFullName}!`);

    // Assert that at least one greeting is displayed
    expect(greetings.length).toBeGreaterThan(0);

    // Optionally, assert that each greeting is in the document
    greetings.forEach((greeting) => {
      expect(greeting).toBeInTheDocument();
    });
  });

  test("signs out when the Sign Out button is clicked", () => {
    // Mock the Redux store
    const initialState: Partial<RootState> = {
      auth: {
        staffId: 123,
        email: "",
        roleType: "",
        role: "",
        dept: "",
      },
    };
    const store = mockStore(initialState);

    // Render the component
    render(
      <Provider store={store}>
        <Nav />
      </Provider>
    );

    // Click the Sign Out button
    const signOutButton = screen.getByText("Sign Out");
    fireEvent.click(signOutButton);

    // Assert that the logout action was dispatched
    const actions = store.getActions();
    expect(actions).toContainEqual({ type: "auth/logout" });

    // Assert that the user was redirected to the home page
    expect(pushMock).toHaveBeenCalledWith("/");
  });
});
