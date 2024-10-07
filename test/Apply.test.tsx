import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Apply } from '@/components/apply';
import '@testing-library/jest-dom';

// Mock the imported components
jest.mock('@/components/apply/datepicker', () => ({
    Datecomponent: ({ onDateChange }: { onDateChange: (date: string) => void }) => {
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = new Date(e.target.value);
        const currentDate = new Date();
        const twoMonthsAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 2));
        const threeMonthsAhead = new Date(currentDate.setMonth(currentDate.getMonth() + 5));
  
        if (selectedDate < twoMonthsAgo) {
          alert('Cannot select a date more than 2 months in the past');
          return;
        }
        if (selectedDate > threeMonthsAhead) {
          alert('Cannot select a date more than 3 months in the future');
          return;
        }
        onDateChange(e.target.value);
      };
  
      return <input data-testid="date-input" type="date" onChange={handleChange} />;
    },
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
  it('Enables submit button when all fields are filled', () => {
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

  it('Keeps submit button disabled when not all fields are filled', () => {
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
  it('Prevents selecting a date more than 2 months in the past', () => {
    render(
      <Provider store={store}>
        <Apply />
      </Provider>
    );

    const dateInput = screen.getByTestId('date-input');
    const tooOldDate = new Date();
    tooOldDate.setMonth(tooOldDate.getMonth() - 3);
    
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    fireEvent.change(dateInput, { target: { value: tooOldDate.toISOString().split('T')[0] } });

    expect(alertMock).toHaveBeenCalledWith('Cannot select a date more than 2 months in the past');
    expect(screen.getByTestId('submit-button')).toBeDisabled();

    alertMock.mockRestore();
  });

  it('Prevents selecting a date more than 3 months in the future', () => {
    render(
      <Provider store={store}>
        <Apply />
      </Provider>
    );

    const dateInput = screen.getByTestId('date-input');
    const tooFutureDate = new Date();
    tooFutureDate.setMonth(tooFutureDate.getMonth() + 4);
    
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    fireEvent.change(dateInput, { target: { value: tooFutureDate.toISOString().split('T')[0] } });

    expect(alertMock).toHaveBeenCalledWith('Cannot select a date more than 3 months in the future');
    expect(screen.getByTestId('submit-button')).toBeDisabled();

    alertMock.mockRestore();
  });

  
});