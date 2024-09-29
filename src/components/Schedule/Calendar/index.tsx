import React, { useState, useEffect } from "react";
import { testSchedule } from "@/constants/schedule_test";
import { Body, H2, H1 } from "@/components/TextStyles";
import moment from "moment";
interface Schedule {
  [date: string]: number | undefined;
}

export const WFHCalendar: React.FC = () => {
  const getCurrentDate = () => {
    const today = new Date();
    return `${today.getDate().toString().padStart(2, "0")}${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}${today.getFullYear().toString().slice(2)}`;
  };
  const isNextDisabled = () => {
    const lastDate = Object.keys(testSchedule[0].schedule).pop();
    if (!lastDate) {
      return false;
    }
    const currentDate = new Date(
      parseInt(selectedDate.slice(4)),
      parseInt(selectedDate.slice(2, 4)) - 1,
      parseInt(selectedDate.slice(0, 2))
    );
    const lastDateObject = new Date(
      parseInt(lastDate.slice(4)),
      parseInt(lastDate.slice(2, 4)) - 1,
      parseInt(lastDate.slice(0, 2))
    );

    return currentDate.getTime() >= lastDateObject.getTime();
  };

  const isPrevDisabled = () => {
    const firstDate = Object.keys(testSchedule[0].schedule).shift();
    if (!firstDate) {
      return false;
    }
    const currentDate = new Date(
      parseInt(selectedDate.slice(4)),
      parseInt(selectedDate.slice(2, 4)) - 1,
      parseInt(selectedDate.slice(0, 2))
    );
    const firstDateObject = new Date(
      parseInt(firstDate.slice(4)),
      parseInt(firstDate.slice(2, 4)) - 1,
      parseInt(firstDate.slice(0, 2))
    );

    return currentDate.getTime() <= firstDateObject.getTime();
  };

  const isNextWeekDisabled = () => {
    const lastDate = Object.keys(testSchedule[0].schedule).pop();
    if (!lastDate) {
      return false;
    }
    const currentDate = new Date(
      parseInt(selectedDate.slice(4)),
      parseInt(selectedDate.slice(2, 4)) - 1,
      parseInt(selectedDate.slice(0, 2))
    );
    const lastDateObject = new Date(
      parseInt(lastDate.slice(4)),
      parseInt(lastDate.slice(2, 4)) - 1,
      parseInt(lastDate.slice(0, 2))
    );
    const nextWeekDate = new Date(
      currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    return nextWeekDate.getTime() > lastDateObject.getTime();
  };

  const isPrevWeekDisabled = () => {
    const firstDate = Object.keys(testSchedule[0].schedule).shift();
    const currentDate = new Date(
      parseInt(selectedDate.slice(4)),
      parseInt(selectedDate.slice(2, 4)) - 1,
      parseInt(selectedDate.slice(0, 2))
    );
    const firstDateObject = firstDate
      ? new Date(
          parseInt(firstDate.slice(4)),
          parseInt(firstDate.slice(2, 4)) - 1,
          parseInt(firstDate.slice(0, 2))
        )
      : null;
    const prevWeekDate = new Date(
      currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
    );

    return (
      firstDateObject !== null &&
      prevWeekDate.getTime() < firstDateObject.getTime()
    );
  };
  const getWeekDates = (weekNumber: string) => {
    const firstDayOfWeek = new Date(
      parseInt(selectedDate.slice(4)),
      parseInt(selectedDate.slice(2, 4)) - 1,
      parseInt(selectedDate.slice(0, 2)) -
        3 +
        (parseInt(weekNumber) - currentWeek) * 7
    );
    const lastDayOfWeek = new Date(
      parseInt(selectedDate.slice(4)),
      parseInt(selectedDate.slice(2, 4)) - 1,
      parseInt(selectedDate.slice(0, 2)) +
        3 +
        (parseInt(weekNumber) - currentWeek) * 7
    );

    return `${dateFormat(
      `${firstDayOfWeek.getDate().toString().padStart(2, "0")}${(
        firstDayOfWeek.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}${firstDayOfWeek.getFullYear().toString().slice(2)}`
    )} - ${dateFormat(
      `${lastDayOfWeek.getDate().toString().padStart(2, "0")}${(
        lastDayOfWeek.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}${lastDayOfWeek.getFullYear().toString().slice(2)}`
    )}`;
  };
  const getWeekNumber = (date: string) => {
    const dateParts = date.match(/(\d{2})(\d{2})(\d{2})/);
    if (!dateParts) {
      return 0;
    }
    const day = parseInt(dateParts[1]);
    const month = parseInt(dateParts[2]) - 1;
    const year = parseInt(dateParts[3]);
    const dateObject = new Date(year, month, day);
    return Math.ceil(
      ((+dateObject - +new Date(dateObject.getFullYear(), 0, 1)) / 86400000 +
        dateObject.getDay() +
        1) /
        7
    );
  };
  const handleNextWeek = () => {
    setCurrentWeek(currentWeek + 1);
    const newDate = new Date(
      parseInt(selectedDate.slice(4)),
      parseInt(selectedDate.slice(2, 4)) - 1,
      parseInt(selectedDate.slice(0, 2)) + 7
    );
    setSelectedDate(
      `${newDate.getDate().toString().padStart(2, "0")}${(
        newDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}${newDate.getFullYear().toString().slice(2)}`
    );
  };

  const handlePrevWeek = () => {
    setCurrentWeek(currentWeek - 1);
    const newDate = new Date(
      parseInt(selectedDate.slice(4)),
      parseInt(selectedDate.slice(2, 4)) - 1,
      parseInt(selectedDate.slice(0, 2)) - 7
    );
    setSelectedDate(
      `${newDate.getDate().toString().padStart(2, "0")}${(
        newDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}${newDate.getFullYear().toString().slice(2)}`
    );
  };
  const getCurrentWeekNumber = () => {
    const today = new Date();
    return getWeekNumber(
      `${today.getDate().toString().padStart(2, "0")}${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${today.getFullYear().toString().slice(2)}`
    );
  };

  const [currentView, setCurrentView] = useState<"day" | "week">("day");
  const [currentWeek, setCurrentWeek] = useState<number>(
    getCurrentWeekNumber()
  );
  const [weeks, setWeeks] = useState<{ [key: number]: Schedule }>({});
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDate());

  const dateFormat = (date: string) => {
    return `${date.slice(0, 2)}-${date.slice(2, 4)}-${date.slice(4)}`;
  };

  const groupScheduleByWeek = () => {
    const weeksObj: { [key: string]: Schedule } = {};
    Object.keys(testSchedule[0].schedule).forEach((date: string) => {
      const weekNumber = getWeekNumber(date).toString();
      if (!weeksObj[weekNumber]) {
        weeksObj[weekNumber] = {};
      }
      weeksObj[weekNumber][date] = (
        testSchedule[0].schedule as { [key: string]: number }
      )[date];
    });
    setWeeks(weeksObj);
  };

  useEffect(() => {
    groupScheduleByWeek();
  }, []);

  const handleNextDay = () => {
    const currentDate = new Date(
      parseInt(selectedDate.slice(4)),
      parseInt(selectedDate.slice(2, 4)) - 1,
      parseInt(selectedDate.slice(0, 2)) + 1
    );
    setSelectedDate(
      `${currentDate.getDate().toString().padStart(2, "0")}${(
        currentDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}${currentDate.getFullYear().toString().slice(2)}`
    );
  };

  const handlePrevDay = () => {
    const currentDate = new Date(
      parseInt(selectedDate.slice(4)),
      parseInt(selectedDate.slice(2, 4)) - 1,
      parseInt(selectedDate.slice(0, 2)) - 1
    );
    setSelectedDate(
      `${currentDate.getDate().toString().padStart(2, "0")}${(
        currentDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}${currentDate.getFullYear().toString().slice(2)}`
    );
  };
  const getWfhClass = (wfhStatus: number) => {
    switch (wfhStatus) {
      case 0:
        return "bg-white text-primary";
      case 1:
        return "bg-gradient-to-t from-white to-secondary text-white";
      case 2:
        return "bg-gradient-to-b from-white to-secondary text-primary";
      case 3:
        return "bg-secondary text-white";
      default:
        return "";
    }
  };

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
            <H2 className="text-lg font-bold">{dateFormat(selectedDate)}</H2>
            <button
              className={`bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-xl ${
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
              (testSchedule[0].schedule as { [date: string]: number })[
                selectedDate
              ]
            )}`}
          >
            <Body className="text-lg font-bold">
              {(testSchedule[0].schedule as { [date: string]: number })[
                selectedDate
              ] === 0
                ? "No WFH"
                : (testSchedule[0].schedule as { [date: string]: number })[
                    selectedDate
                  ] === 1
                ? "AM WFH"
                : (testSchedule[0].schedule as { [date: string]: number })[
                    selectedDate
                  ] === 2
                ? "PM WFH"
                : "Full Day WFH"}
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
          {Object.keys(weeks).map((weekNumber, index) => (
            <div key={index}>
              {currentWeek === parseInt(weekNumber) ? (
                <div>
                  <H2 className="text-lg font-bold mb-4">
                    Week {weekNumber} ({getWeekDates(weekNumber)})
                  </H2>
                  <div className="flex flex-col lg:flex-row justify-center lg:space-x-4 space-y-3">
                    {Array(7)
                      .fill(0)
                      .map((_, index) => {
                        const currentDate = new Date(
                          parseInt(selectedDate.slice(4)),
                          parseInt(selectedDate.slice(2, 4)) - 1,
                          parseInt(selectedDate.slice(0, 2)) +
                            index -
                            3 +
                            (parseInt(weekNumber) - currentWeek) * 7
                        );
                        const dateString = `${currentDate
                          .getDate()
                          .toString()
                          .padStart(2, "0")}${(currentDate.getMonth() + 1)
                          .toString()
                          .padStart(2, "0")}${currentDate
                          .getFullYear()
                          .toString()
                          .slice(2)}`;

                        const wfhStatus = (
                          testSchedule[0].schedule as { [date: string]: number }
                        )[dateString];

                        const getWfhClass = () => {
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
                        const isToday = moment().format("DDMMYY") === dateString;


                        return (
                          <div
                            className={`flex flex-col justify-between items-center p-4 border border-gray-200 rounded-xl min-h-[100px] lg:min-h-[400px] w-full md:w-1/2 lg:w-1/7 xl:w-1/7 2xl:w-1/7 ${getWfhClass()}`}
                          >
                            <div className="flex flex-col">
                              {isToday && (
                                <Body className="text-lg font-bold">
                                  Today
                                  </Body>
                                  )}
                              <H2 className="text-lg font-bold">
                                {dateFormat(dateString)}
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
                      })}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
