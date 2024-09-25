import React, { useEffect, useState } from "react";
import axios from "axios"; // Assuming you're using axios for the API call
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store"; // Import your RootState type if you are using TypeScript

interface Schedule {
  [date: string]: number | undefined;// 0: no WFH, 1: AM WFH, 2: PM WFH, 3: Full Day WFH
}

// const schedule: Schedule = testSchedule[0].schedule;
// This function makes the API call to fetch the schedule for a given staff ID
const generateOwnSchedule = async (staffId: number) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8085/api/generateOwnSchedule/${staffId}`
    );
    if (response.status === 200) {
      return response.data; // Return the fetched schedule
    } else {
      throw new Error("Failed to generate schedule");
    }
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while generating the schedule.");
  }
};

export const WFHCalendar: React.FC = () => {
  const [currentView, setCurrentView] = useState("day");
  const [schedule, setSchedule] = useState<Schedule | null>(null); // To store fetched schedule data

  // Step 1: Access the staffId from the Redux store
  const staffId = useSelector((state: RootState) => state.auth.staffId);
  console.log(staffId);

  // Function to fetch the schedule and update state
  const fetchSchedule = async () => {
    if (staffId) {
      // Make sure staffId exists before fetching
      try {
        const fetchedSchedule = await generateOwnSchedule(Number(staffId));
        console.log("Fetched schedule data:", fetchedSchedule); // Log the fetched data
        setSchedule(fetchedSchedule); // Update the schedule state with the fetched data
      } catch (error) {
        console.error("Error fetching schedule:", error);
      }
    } else {
      console.error("No staffId found in Redux store");
    }
  };

  // Fetch schedule when staffId changes and is not null
  useEffect(() => {
    if (staffId) {
      fetchSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // The effect will run only when staffId changes and is not null

  const toggleView = () => {
    setCurrentView(currentView === "day" ? "week" : "day");
  };

  // Function to format the date (e.g., "2024-07-24 14:08:04" => "24-07-2024")
  const dateFormat = (date: string) => {
    const dateObject = new Date(date); // Let JavaScript parse the date
    if (isNaN(dateObject.getTime())) {
      console.error(`Invalid date: ${date}`);
      return date;
    }
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = dateObject.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Function to get the week number from the date
  const getWeekNumber = (date: string) => {
    const dateObject = new Date(date); // Let JavaScript parse the date
    if (isNaN(dateObject.getTime())) {
      console.error(`Invalid date: ${date}`);
      return 0;
    }
    const startOfYear = new Date(dateObject.getFullYear(), 0, 1);
    const dayOfYear = Math.floor(
      (dateObject.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  };

  if (!schedule) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">WFH Calendar</h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={toggleView}
      >
        Toggle View
      </button>
      {currentView === "day" ? (
        <div className="flex flex-col">
          {Object.entries(schedule["schedule"]).map(([date, status], index) => (
            <div
              key={index}
              className="flex flex-col items-center p-4 border border-gray-200 rounded mb-4"
            >
              <h2 className="text-lg font-bold">{dateFormat(date)}</h2>
              <p>
                {status === 0
                  ? "No WFH"
                  : status === 1
                  ? "AM WFH"
                  : status === 2
                  ? "PM WFH"
                  : "Full Day WFH"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center">
          {Object.values(
            Object.keys(schedule["schedule"]).reduce(
              (weeks: { [key: number]: Schedule }, date) => {
                const weekNumber: number = getWeekNumber(date);
                if (!weeks[weekNumber]) {
                  weeks[weekNumber] = {} as Schedule;
                }
                weeks[weekNumber][date] = schedule["schedule"][date];
                return weeks;
              },
              {}
            )
          ).map((week: Schedule, index: number) => (
            <div key={index} className="flex flex-wrap justify-center">
              {Object.keys(week).map((date, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded w-1/7"
                >
                  <h2 className="text-lg font-bold">{dateFormat(date)}</h2>
                  <p>
                    {week[date] == 0
                      ? "No WFH"
                      : week[date] == 1
                      ? "AM WFH"
                      : week[date] == 2
                      ? "PM WFH"
                      : "Full Day WFH"}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
