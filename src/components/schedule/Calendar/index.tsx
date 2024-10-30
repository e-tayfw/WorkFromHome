import React, { useState, useEffect } from "react";
import { Body, H2, H1, BodyLarge, BodySmall } from "@/components/TextStyles";
import { generateOwnSchedule } from "@/pages/api/scheduleApi";
import moment from "moment";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

// Define the structure of the schedule
interface ScheduleEntry {
  schedule: { [date: string]: number | undefined };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Schedule {
  [date: string]: number | undefined;
}

export const WFHCalendar: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleEntry | null>(null);
  const staffId = useSelector((state: RootState) => state.auth.staffId);

  // Define minDate and maxDate
  const minDate = moment().subtract(2, "months").startOf("day");
  const maxDate = moment().add(3, "months").endOf("day");

  // Initialize selectedDate as a moment object
  const [selectedDate, setSelectedDate] = useState<moment.Moment>(moment());

  const fetchSchedule = async () => {
    if (staffId) {
      try {
        const fetchedSchedule = await generateOwnSchedule(Number(staffId));
        setSchedule(fetchedSchedule);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      }
    } else {
      console.error("No staffId found in Redux store");
    }
  };

  useEffect(() => {
    fetchSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isNextDisabled = () => {
    const nextDay = selectedDate.clone().add(1, "day");
    return nextDay.isAfter(maxDate, "day");
  };

  const isPrevDisabled = () => {
    const prevDay = selectedDate.clone().subtract(1, "day");
    return prevDay.isBefore(minDate, "day");
  };

  const isNextWeekDisabled = () => {
    const nextWeekStartDate = selectedDate
      .clone()
      .add(1, "week")
      .startOf("week");
    for (let i = 0; i < 7; i++) {
      const dateMoment = nextWeekStartDate.clone().add(i, "days");
      if (
        dateMoment.isSameOrAfter(minDate, "day") &&
        dateMoment.isSameOrBefore(maxDate, "day")
      ) {
        return false;
      }
    }
    return true;
  };

  const isPrevWeekDisabled = () => {
    const prevWeekStartDate = selectedDate
      .clone()
      .subtract(1, "week")
      .startOf("week");
    for (let i = 0; i < 7; i++) {
      const dateMoment = prevWeekStartDate.clone().add(i, "days");
      if (
        dateMoment.isSameOrAfter(minDate, "day") &&
        dateMoment.isSameOrBefore(maxDate, "day")
      ) {
        return false;
      }
    }
    return true;
  };

  const getWeekDates = () => {
    const weekStart = selectedDate.clone().startOf("week");
    const weekEnd = selectedDate.clone().endOf("week");
    return `${weekStart.format("DD-MM-YY")} to ${weekEnd.format("DD-MM-YY")}`;
  };

  const handleNextWeek = () => {
    setSelectedDate(selectedDate.clone().add(1, "week").startOf("week"));
  };

  const handlePrevWeek = () => {
    setSelectedDate(selectedDate.clone().subtract(1, "week").startOf("week"));
  };

  const handleNextDay = () => {
    setSelectedDate(selectedDate.clone().add(1, "day"));
  };

  const handlePrevDay = () => {
    setSelectedDate(selectedDate.clone().subtract(1, "day"));
  };

  const getWfhClass = (wfhStatus: number) => {
    switch (wfhStatus) {
      case 0:
        return "bg-white text-primary";
      case 1:
        return "bg-gradient-to-t from-white to-secondary text-primary";
      case 2:
        return "bg-gradient-to-b from-white to-secondary text-primary";
      case 3:
        return "bg-secondary text-white";
      default:
        return "";
    }
  };

  const [currentView, setCurrentView] = useState<"day" | "week">("day");

  return (
    <div className="container mx-auto p-4">
      <H1 className="text-2xl font-bold mb-4">WFH Calendar</H1>
      <button
        className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 mb-4 rounded-xl"
        onClick={() => setCurrentView(currentView === "day" ? "week" : "day")}
      >
        Toggle View
      </button>
      {currentView === "day" ? (
        <div>
          <div className="flex justify-between mb-4">
            <button
              className={`bg-primary hover:bg-secondary text-white font-bold py-2 px-4 my-4 rounded-xl ${
                isPrevDisabled() ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handlePrevDay}
              disabled={isPrevDisabled()}
            >
              Prev Day
            </button>
            <H2 className="text-lg font-bold">
              {selectedDate.format("DD-MM-YY")}
            </H2>
            <button
              className={`bg-primary hover:bg-secondary text-white font-bold py-2 px-4 my-4 rounded-xl ${
                isNextDisabled() ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleNextDay}
              disabled={isNextDisabled()}
            >
              Next Day
            </button>
          </div>
          <div
            className={`flex flex-col items-center p-4 border border-gray-200 min-h-[400px] rounded-xl mb-4 ${getWfhClass(
              schedule?.schedule?.[selectedDate.format("DDMMYY")] ?? 0
            )}`}
          >
            <Body className="text-lg font-bold">
              {(() => {
                const wfhStatus =
                  schedule?.schedule?.[selectedDate.format("DDMMYY")] ?? 0;
                switch (wfhStatus) {
                  case 0:
                    return "No WFH";
                  case 1:
                    return "AM WFH";
                  case 2:
                    return "PM WFH";
                  case 3:
                    return "Full Day WFH";
                  default:
                    return "No WFH";
                }
              })()}
            </Body>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between mb-4">
            <button
              className={`bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-xl ${
                isPrevWeekDisabled() ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handlePrevWeek}
              disabled={isPrevWeekDisabled()}
            >
              Prev Week
            </button>
            <BodyLarge className="text-center px-2 font-bold">
              {getWeekDates()
                .split(" ")
                .map((date, index) => (
                  <span key={index} className="block lg:inline-block">
                    {date}
                  </span>
                ))}
            </BodyLarge>
            <button
              className={`bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-xl ${
                isNextWeekDisabled() ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleNextWeek}
              disabled={isNextWeekDisabled()}
            >
              Next Week
            </button>
          </div>
          <div className="flex flex-col lg:flex-row justify-center lg:space-x-4 space-y-3">
            {Array.from({ length: 7 }).map((_, index) => {
              const dateMoment = selectedDate
                .clone()
                .startOf("week")
                .add(index, "days");
              const dateString = dateMoment.format("DDMMYY");
              const isWithinRange =
                dateMoment.isSameOrAfter(minDate, "day") &&
                dateMoment.isSameOrBefore(maxDate, "day");

              if (isWithinRange) {
                const wfhStatus = schedule?.schedule?.[dateString] ?? 0;
                const isToday = moment().isSame(dateMoment, "day");

                return (
                  <div
                    key={dateString}
                    className={`flex flex-col justify-between items-center p-4 border border-gray-200 rounded-xl min-h-[100px] lg:min-h-[400px] w-full md:w-1/2 lg:w-1/7 xl:w-1/7 2xl:w-1/7 ${getWfhClass(
                      wfhStatus
                    )}`}
                  >
                    <div className="flex flex-col">
                      {isToday && (
                        <Body className="text-lg font-bold">Today</Body>
                      )}
                      <H2 className="text-lg font-bold">
                        {dateMoment.format("DD-MM-YY")}
                      </H2>
                    </div>
                    <div className="flex flex-col h-24 justify-center items-center">
                      <Body className="text-lg font-bold">
                        {wfhStatus === 0
                          ? "No WFH"
                          : wfhStatus === 1
                          ? "AM WFH"
                          : wfhStatus === 2
                          ? "PM WFH"
                          : "Full Day WFH"}
                      </Body>
                    </div>
                  </div>
                );
              } else {
                // Render placeholder to maintain alignment
                return (
                  <div
                    key={dateString}
                    className="flex flex-col justify-between items-center p-4 min-h-[100px] lg:min-h-[400px] w-full md:w-1/2 lg:w-1/7 xl:w-1/7 2xl:w-1/7"
                  >
                    {/* Empty placeholder */}
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}
    </div>
  );
};
