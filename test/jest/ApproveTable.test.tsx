import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ApproveTable from '@/components/Approve/table'; // Adjust the import path as necessary
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import '@testing-library/jest-dom';

// Create a mock Redux store
const mockStore = configureMockStore();
const store = mockStore({
  auth: {
    staffId: 123,
  },
});

// Mock data for employees
const mockEmployees = [
  { Staff_ID: 1, Staff_FName: 'John', Staff_LName: 'Doe' },
  { Staff_ID: 2, Staff_FName: 'Jane', Staff_LName: 'Smith' },
  { Staff_ID: 3, Staff_FName: 'Jake', Staff_LName: 'Johnson' },
];

describe('ApproveTable Component', () => {
  it('should display all employees\' full names (first + last name)', () => {
    render(
      <Provider store={store}>
        <ApproveTable employees={mockEmployees} />
      </Provider>
    );

    // Check if all employees' full names are rendered on the screen
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Jake Johnson')).toBeInTheDocument();
  });

  it('should filter employees based on the search term', () => {
    render(
      <Provider store={store}>
        <ApproveTable employees={mockEmployees} />
      </Provider>
    );

    // Find the search input by its role
    const searchInput = screen.getByRole('textbox', { name: /search by name/i });

    // Simulate typing 'John' into the search input
    fireEvent.change(searchInput, { target: { value: 'John' } });

    // Check if only the employees whose names include 'John' are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jake Johnson')).toBeInTheDocument();

    // Check if 'Jane Smith' is not displayed (since it doesn't match 'John')
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });
});
