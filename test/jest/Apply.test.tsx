import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Apply } from '@/components/apply';
import '@testing-library/jest-dom';

// Mock the imported components
jest.mock('@/components/apply/datepicker', () => ({
  Datecomponent: ({ onDateChange }: { onDateChange: (date: string) => void }) => (
    <input data-testid="date-input" onChange={(e) => onDateChange(e.target.value)} />
  ),
}));

jest.mock('@/components/apply/range_datepicker', () => ({
  DateRangePickerComponent: ({ onDateRangeChange }: { onDateRangeChange: (dateRange: {start: string, end: string}) => void }) => (
    <div>
      <input data-testid="start-date-input" onChange={(e) => onDateRangeChange({start: e.target.value, end: '2024-10-31'})} />
      <input data-testid="end-date-input" onChange={(e) => onDateRangeChange({start: '2024-10-01', end: e.target.value})} />
    </div>
  ),
}));

jest.mock('@/components/apply/day', () => ({
  Daypicker: ({ onDayChange }: { onDayChange: (day: number) => void }) => (
    <select data-testid="day-select" onChange={(e) => onDayChange(Number(e.target.value))}>
      <option value="0">Select a day</option>
      <option value="1">Monday</option>
      <option value="2">Tuesday</option>
      <option value="3">Wednesday</option>
      <option value="4">Thursday</option>
      <option value="5">Friday</option>
      <option value="6">Saturday</option>
      <option value="7">Sunday</option>
    </select>
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

describe('Apply Component - Ad-Hoc Form', () => {
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

describe('Apply Component - Recurring Form', () => {
  it('enables submit button when all recurring fields are filled', async () => {
    render(
      <Provider store={store}>
        <Apply />
      </Provider>
    );
    fireEvent.click(screen.getByText('Recurring'));

    fireEvent.change(screen.getByTestId('start-date-input'), { target: { value: '2024-10-01' } });
    fireEvent.change(screen.getByTestId('end-date-input'), { target: { value: '2024-10-31' } });
    fireEvent.change(screen.getByTestId('day-select'), { target: { value: '1' } });
    fireEvent.change(screen.getByTestId('arrangement-select'), { target: { value: 'FD' } });
    fireEvent.change(screen.getByTestId('reason-input'), { target: { value: 'Recurring test reason' } });

    await waitFor(() => {
      expect(screen.getByTestId('submit-button')).toBeEnabled();
    });
  });
});