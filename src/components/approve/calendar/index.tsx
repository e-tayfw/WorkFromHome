import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Importing styles for the calendar
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { H1, H2 } from '@/components/TextStyles'; // Import H1 for main heading

const localizer = momentLocalizer(moment); // Localizer for the calendar using moment.js

// Define the CalendarEvent interface to type the event object
interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  dateKey: string;
  duration: 'AM' | 'PM' | 'FD';
}

// Custom toolbar to style the month/year header (like "October 2024")
const CustomToolbar = (toolbar: any) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY');
  };

  const label = () => {
    const date = moment(toolbar.date);
    return <H1 className="text-primary mb-6">{date.format('MMMM YYYY')}</H1>;
  };

  return (
    <div className="rbc-toolbar flex items-center justify-between">
      <span className="rbc-btn-group">
        <button onClick={goToCurrent} className="btn btn-primary">Today</button>
        <button onClick={goToBack} className="btn btn-primary">Back</button>
        <button onClick={goToNext} className="btn btn-primary">Next</button>
      </span>
      <span className="rbc-toolbar-label">{label()}</span>
      <span className="rbc-btn-group">
        <button onClick={() => toolbar.onView('month')} className="btn btn-primary">Month</button>
        <button onClick={() => toolbar.onView('week')} className="btn btn-primary">Week</button>
      </span>
    </div>
  );
};

const CalendarView: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [events, setEvents] = useState<CalendarEvent[]>([]); // Events for the calendar
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [requestsByDay, setRequestsByDay] = useState<any>({}); // Store requests grouped by day

  const staffId = useSelector((state: any) => state.auth.staffId);

  useEffect(() => {
    const fetchData = async () => {
      Swal.fire({
        title: 'Loading...',
        html: 'Please wait while we fetch your approvals',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const [requestRes, employeeRes] = await Promise.all([
          axios.get(`http://127.0.0.1:8085/api/request/approverID/${staffId}`),
          axios.get(`http://127.0.0.1:8085/api/employee/team/manager/${staffId}`),
        ]);

        const groupedRequests: any = {};
        const employees = employeeRes.data.employees.reduce((acc: any, emp: any) => {
          acc[emp.Staff_ID] = `${emp.Staff_FName} ${emp.Staff_LName}`;
          return acc;
        }, {});

        // Group requests by date and then by duration (AM, PM, FD)
        requestRes.data.forEach((item: any) => {
          const dateKey = moment(item.Date_Requested).format('YYYY-MM-DD');
          const duration = item.Duration;

          // Correctly map the requestor's name from the employee details
          const requestorName = employees[item.Requestor_ID] || 'Unknown';

          // Skip requests that have 'Unknown' in requestor name or status
          if (requestorName === 'Unknown' || item.Status === 'Unknown') {
            return;
          }

          if (!groupedRequests[dateKey]) {
            groupedRequests[dateKey] = { AM: [], PM: [], FD: [] };
          }

          groupedRequests[dateKey][duration].push({
            ...item,
            requestorName,
            status: item.Status,
          });
        });

        setRequestsByDay(groupedRequests);
        setLoading(false);
        Swal.close();
      } catch (err) {
        console.error('Error fetching approval data:', err);
        setError('Failed to load approval data');
        setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to load approvals, please try again!',
        });
      }
    };

    fetchData();
  }, [staffId]);

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "#2176FF"; // Default color
    switch (event.duration) {
      case "AM":
        backgroundColor = "#FFC107"; // Color for AM
        break;
      case "PM":
        backgroundColor = "#FF5722"; // Color for PM
        break;
      case "FD":
        backgroundColor = "#4CAF50"; // Color for FD
        break;
      default:
        backgroundColor = "#2176FF"; // Fallback color
    }
    const style = {
      backgroundColor,
      color: "white",
      borderRadius: "5px",
      padding: "5px",
    };
    return { style }; // Return CSS style, not className
  };

  // Handle event click to show details of requests for the selected time period (AM/PM/FD)
  const handleDurationClick = (date: string, duration: 'AM' | 'PM' | 'FD') => {
    const requests = requestsByDay[date][duration];

    const content = requests
      .map(
        (request: any) => `
        <div class="mb-4">
          <b>${request.requestorName}:</b> ${request.status}
        </div>
      `
      )
      .join('');

    Swal.fire({
      title: `Requests for ${duration} on ${date}`,
      html: content,
      icon: 'info',
      confirmButtonColor: '#072040',
    });
  };

  // Handle event selection with properly typed event object
  const handleSelectEvent = (event: CalendarEvent) => {
    handleDurationClick(event.dateKey, event.duration); // Show modal for AM/PM/FD
  };

  // Convert grouped requests into calendar events
  const calendarEvents = Object.keys(requestsByDay).flatMap((date) => {
    const amRequests = requestsByDay[date].AM;
    const pmRequests = requestsByDay[date].PM;
    const fdRequests = requestsByDay[date].FD;

    // Filter requests by 'Approved' status
    const amApproved = amRequests.filter((req: any) => req.status.toLowerCase() === 'approved').length;
    const pmApproved = pmRequests.filter((req: any) => req.status.toLowerCase() === 'approved').length;
    const fdApproved = fdRequests.filter((req: any) => req.status.toLowerCase() === 'approved').length;

    // Filter requests by 'Pending' status
    const amPending = amRequests.filter((req: any) => req.status.toLowerCase() === 'pending').length;
    const pmPending = pmRequests.filter((req: any) => req.status.toLowerCase() === 'pending').length;
    const fdPending = fdRequests.filter((req: any) => req.status.toLowerCase() === 'pending').length;

    // Create events for AM, PM, and FD with specific time slots
    const amEvent = amApproved > 0 || amPending > 0
      ? {
          title: `AM: ${amApproved} (pending: ${amPending})`,
          start: new Date(`${date}T09:00:00`),
          end: new Date(`${date}T14:00:00`),
          dateKey: date,
          duration: 'AM',
        }
      : null;

    const pmEvent = pmApproved > 0 || pmPending > 0
      ? {
          title: `PM: ${pmApproved} (pending: ${pmPending})`,
          start: new Date(`${date}T14:00:00`),
          end: new Date(`${date}T18:00:00`),
          dateKey: date,
          duration: 'PM',
        }
      : null;

    const fdEvent = fdApproved > 0 || fdPending > 0
      ? {
          title: `FD: ${fdApproved} (pending: ${fdPending})`,
          start: new Date(`${date}T09:00:00`),
          end: new Date(`${date}T18:00:00`),
          dateKey: date,
          duration: 'FD',
        }
      : null;

    return [amEvent, pmEvent, fdEvent].filter(
      (event): event is CalendarEvent => event !== null
    ); // Only return non-null events
  });

  return (
    <div className="container mx-auto p-4">
      {loading ? (
        <div className="flex items-center justify-center mt-6">
          <H2>Loading...</H2>
        </div>
      ) : (
        <>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            views={{ month: true, week: true, day: true }} // Enable Month, Week, Day views
            style={{ height: 600 }}
            min={new Date(1970, 1, 1, 9, 0, 0)} // Start time 9:00 AM
            max={new Date(1970, 1, 1, 18, 0, 0)} // End time 6:00 PM
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent} // Updated with explicit typing
            components={{
              toolbar: CustomToolbar,
            }}
          />
        </>
      )}

      {error && (
        <div className="flex items-center justify-center mt-6">
          <H2 className="text-red-500">{error}</H2>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
