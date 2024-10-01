import React, { useState, useEffect } from "react";
import { Body, H2, H1 } from "@/components/TextStyles";
import moment from "moment";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { team_schedule_test } from "@/constants/team_schedule_test";
import { dateFormat } from "@/utils/date-format";

// Define the structure of the schedule
interface TeamMember {
  [userId: string]: number | undefined;
}

interface ScheduleData {
  [teamScheduleId: string]: TeamMember;
}
interface Schedule {
    [date: string]: number | undefined
  }
  
export const TeamCalendar: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleData | null>(
    team_schedule_test
  );
  const staffId = useSelector((state: RootState) => state.auth.staffId);
  const [currentView, setCurrentView] = useState<"day" | "week">("day");

  const [weeks, setWeeks] = useState<{ [key: number]: Schedule }>({});

  const getCurrentDate = () => {
    const today = new Date();
    return `${today.getDate().toString().padStart(2, "0")}${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}${today.getFullYear().toString().slice(2)}`;
  };
  const isNextDisabled = () => {
    const lastDate = schedule?.[0]?.schedule
      ? Object.keys(schedule[0].schedule).pop()
      : null;
    if (!lastDate) return false;
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
    const firstDate = schedule?.[0]?.schedule
      ? Object.keys(schedule[0].schedule).shift()
      : null;
    if (!firstDate) return false;

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
    const lastDate = schedule?.[0]?.schedule
      ? Object.keys(schedule[0].schedule).pop()
      : null;
    if (!lastDate) return false;

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
    const firstDate = schedule?.[0]?.schedule
      ? Object.keys(schedule[0].schedule).shift()
      : null;

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
  const [currentWeek, setCurrentWeek] = useState<number>(
    getCurrentWeekNumber()
  );
  const groupScheduleByWeek = () => {
    if (
      !schedule || 
      !schedule[0].schedule
    ) {
      console.log("No schedule found");
      return {};
    }
    const weeksObj: { [key: string]: Schedule } = {};
    Object.keys(schedule[0].schedule).forEach((date: string) => {
      const weekNumber = getWeekNumber(date).toString();
      if (!weeksObj[weekNumber]) {
        weeksObj[weekNumber] = {};
      }
      weeksObj[weekNumber][date] = (
        schedule[0] as { [key: string]: number }
      )[date];
    });
    setWeeks(weeksObj);
  };


  useEffect(() => {
    if (schedule && schedule[0] && schedule[0].schedule) {
      groupScheduleByWeek(); // Only call this when schedule is available
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule]);

  const handlePrevDay = () => {
    const currentDate = new Date(selectedDate);
    const prevDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    setSelectedDate(
      `${prevDate.getFullYear()}-${(prevDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${prevDate.getDate().toString().padStart(2, "0")}`
    );
  };

  const handleNextDay = () => {
    const currentDate = new Date(selectedDate);
    const nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    setSelectedDate(
      `${nextDate.getFullYear()}-${(nextDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${nextDate.getDate().toString().padStart(2, "0")}`
    );
  };
  const getTeamSchedule = (date: string) => {
    const formattedDate = date.replace(/-/g, ""); // Remove dashes
    const rearrangedDate =
      formattedDate.substring(6, 8) +
      formattedDate.substring(4, 6) +
      formattedDate.substring(2, 4); // Rearrange to DDMMYYYY

    const wfhUsers: string[] = [];
    let amCount = 0;
    let pmCount = 0;
    let fullDayCount = 0;
    let totalStrength = 0;

    if (schedule) {
      Object.entries(schedule).forEach(([userId, userSchedule]) => {
        const wfhStatus = userSchedule[rearrangedDate];
        if (wfhStatus !== undefined) {
          if (wfhStatus === 1) {
            amCount++;
            wfhUsers.push(userId);
          } else if (wfhStatus === 2) {
            pmCount++;
            wfhUsers.push(userId);
          } else if (wfhStatus === 3) {
            fullDayCount++;
            wfhUsers.push(userId);
          } else if (wfhStatus === 0) {
            totalStrength++;
          }
        }
      });
    }

    return {
      wfhUsers,
      amCount,
      pmCount,
      fullDayCount,
      totalStrength,
    };
  };
  const [selectedDate, setSelectedDate] = useState<string>("2024-10-01");

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
            <H2 className="text-lg font-bold">{selectedDate}</H2>
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
            className={`flex flex-col items-center p-4 border border-gray-200 min-h-[400px] rounded-xl mb-4 }`}
          >
            <Body className="text-lg font-bold">
              {getTeamSchedule(selectedDate).wfhUsers.length > 0
                ? `Staff on WFH: ${getTeamSchedule(selectedDate).wfhUsers.join(
                    ", "
                  )}`
                : "No WFH Users"}
            </Body>
            <Body className="text-lg">
              AM WFH: {getTeamSchedule(selectedDate).amCount}
            </Body>
            <Body className="text-lg">
              PM WFH: {getTeamSchedule(selectedDate).pmCount}
            </Body>
            <Body className="text-lg">
              Full Day WFH: {getTeamSchedule(selectedDate).fullDayCount}
            </Body>
            <Body className="text-lg">
              Total Strength: {getTeamSchedule(selectedDate).totalStrength}
            </Body>
          </div>
        </div>
      ) :  (
        <div>
          <div className="flex justify-between mb-4">
            <button
              className={`bg-primary hover:bg-secondary text-white font-bold py-2 px-4 my-4 rounded-xl ${
                isPrevWeekDisabled() ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handlePrevWeek}
              disabled={isPrevWeekDisabled()}
            >
              Prev Week
            </button>
            <H2 className="text-lg font-bold">
              {getWeekDates(currentWeek.toString())}
            </H2>
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
          <div
            className={`flex flex-col items-center p-4 border border-gray-200 min-h-[400px] rounded-xl mb-4 }`}
          >
            <Body className="text-lg font-bold">
              {getTeamSchedule(selectedDate).wfhUsers.length > 0
                ? `Staff on WFH: ${getTeamSchedule(selectedDate).wfhUsers.join(
                    ", "
                  )}`
                : "No WFH Users"}
            </Body>
            <Body className="text-lg">
              AM WFH: {getTeamSchedule(selectedDate).amCount}
            </Body>
            <Body className="text-lg">
              PM WFH: {getTeamSchedule(selectedDate).pmCount}
            </Body>
            <Body className="text-lg">
              Full Day WFH: {getTeamSchedule(selectedDate).fullDayCount}
            </Body>
            <Body className="text-lg">
              Total Strength: {getTeamSchedule(selectedDate).totalStrength}
            </Body>
          </div>
        </div>
      )}
    </div>
    );
}