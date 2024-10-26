import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Apply } from '@/components/apply';
import axios from 'axios';
import '@testing-library/jest-dom';

// Mock the imported components
jest.mock('@/components/apply/datepicker', () => ({
    Datecomponent: ({ onDateChange }: { onDateChange: (date: string) => void }) => (
      <input data-testid="date-input" onChange={(e) => onDateChange(e.target.value)} />
    ),
  }));

jest.mock('@/components/apply/selection', () => ({
  Selection: ({ onSelectionChange }: { onSelectionChange: (value: string) => void }) => (
    <select data-testid="arrangement-select" onChange={(e) => onSelectionChange(e.target.value)}>
      <option value="">Select</option>
      <option value="AM">AM</option>
      <option value="PM">PM</option>
      <option value="FD">FD</option>
    </select>
  ),
}));

jest.mock('@/components/apply/reason', () => ({
  Reason: ({ onReasonChange }: { onReasonChange: (text: string) => void }) => (
    <textarea data-testid="reason-input" onChange={(e) => onReasonChange(e.target.value)} />
  ),
}));

jest.mock('@/components/apply/submit', () => ({
  Submit: ({ isDisabled }: { isDisabled: boolean }) => (
    <button data-testid="submit-button" disabled={isDisabled}>Submit</button>
  ),
}));


// Mock the redux store
const mockStore = configureStore([]);
const store = mockStore({
  auth: {
    staffId: '123456',
  },
});

describe('Apply Component', () => {
  it('shows all form fields', () => {
    render(
      <Provider store={store}>
        <Apply />
      </Provider>
    );
    expect(screen.getByTestId('date-input')).toBeInTheDocument();
    expect(screen.getByTestId('arrangement-select')).toBeInTheDocument();
    expect(screen.getByTestId('reason-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('enables submit button when all fields are filled', () => {
    render(
      <Provider store={store}>
        <Apply />
      </Provider>
    );

    // Submit button should be disabled
    expect(screen.getByTestId('submit-button')).toBeDisabled();

    // Fill in the date
    fireEvent.change(screen.getByTestId('date-input'), { target: { value: '2024-10-01' } });

    // Select an arrangement
    fireEvent.change(screen.getByTestId('arrangement-select'), { target: { value: 'FD' } });

    // Enter a reason
    fireEvent.change(screen.getByTestId('reason-input'), { target: { value: 'Test reason' } });

    // Submit button should be enabled
    expect(screen.getByTestId('submit-button')).toBeEnabled();
  });

  it('keeps submit button disabled when not all fields are filled', () => {
    render(
      <Provider store={store}>
        <Apply />
      </Provider>
    );

    // Submit button should be disabled
    expect(screen.getByTestId('submit-button')).toBeDisabled();

    // Fill in only the date
    fireEvent.change(screen.getByTestId('date-input'), { target: { value: '2024-10-01' } });

    // The submit button should still be disabled
    expect(screen.getByTestId('submit-button')).toBeDisabled();

    // Fill in the arrangement
    fireEvent.change(screen.getByTestId('arrangement-select'), { target: { value: 'FD' } });

    // Reason is not filled in
    //fireEvent.change(screen.getByTestId('reason-input'), { target: { value: 'Test reason' } });

    // Submit button should still be disabled
    expect(screen.getByTestId('submit-button')).toBeDisabled();
  });


  
});