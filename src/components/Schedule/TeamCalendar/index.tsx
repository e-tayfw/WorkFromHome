import React, { useState, useEffect } from "react";
import { Body, H2, H1, BodySmall } from "@/components/TextStyles";
import moment from "moment";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
// import { team_schedule_test } from "@/constants/team_schedule_test";
import { EyeIcon } from "@/components/Svgs/eye";
// import { dateFormat } from "@/utils/date-format";
import { CloseIcon } from "@/components/Svgs/close";
import { generateTeamSchedule } from "@/pages/api/scheduleApi";

// Define the structure of the schedule
interface TeamMember {
  [date: string]: number | undefined;
}

interface ScheduleData {
  [userId: string]: TeamMember;
}

interface Schedule {
  [date: string]: number;
}

export const TeamCalendar: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleData | null>(
    null
  );
  const staffId = useSelector((state: RootState) => state.auth.staffId);
  
  // Function to fetch the schedule and update state
  const fetchSchedule = async () => {
    console.log("Staff:", staffId);
    if (staffId) {
      // Make sure staffId exists before fetching
      try {
        const fetchedSchedule = await generateTeamSchedule(Number(staffId));
        console.log("Fetched schedule data:", fetchedSchedule); // Log the fetched data
        setSchedule(fetchedSchedule); // Update the schedule state with the fetched data
      } catch (error) {
        console.error("Error fetching schedule:", error);
      }
    } else {
      console.error("No staffId found in Redux store");
    }
  };

  // Fetch schedule in useEffect after re-render
  useEffect(() => {
    if (staffId) {
      fetchSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // The effect will run only when staffId changes and is not null

  const [currentView, setCurrentView] = useState<"day" | "week">("day");

  const [weeks, setWeeks] = useState<{ [key: string]: Schedule }>({});
  const [selectedDate, setSelectedDate] = useState<string>(
    moment().format("YYYY-MM-DD")
  );
  const [currentWeek, setCurrentWeek] = useState<number>(
    moment(selectedDate).week()
  );
  const [selectedWeeklyDate, setSelectedWeeklyDate] = useState<string>(
    moment().format("DDMMYY")
  );
  const isNextDisabled = () => {
    if (!schedule) return false;
    const dates = Object.values(schedule)
      .flatMap((userSchedule) => Object.keys(userSchedule))
      .sort();
    const lastDate = dates.pop();
    if (!lastDate) return false;
    const currentDate = moment(selectedDate);
    const lastDateObject = moment(lastDate, "DDMMYY");

    return currentDate.isSameOrAfter(lastDateObject, "day");
  };

  const isPrevDisabled = () => {
    if (!schedule) return false;
    const dates = Object.values(schedule)
      .flatMap((userSchedule) => Object.keys(userSchedule))
      .sort();
    const firstDate = dates.shift();
    if (!firstDate) return false;
    const currentDate = moment(selectedDate);
    const firstDateObject = moment(firstDate, "DDMMYY");

    return currentDate.isSameOrBefore(firstDateObject, "day");
  };
  const [modalOpen, setModalOpen] = useState(false);
  const isNextWeekDisabled = () => {
    if (!schedule) return false;
    const dates = Object.values(schedule)
      .flatMap((userSchedule) => Object.keys(userSchedule))
      .sort();
    const lastDate = dates.pop();
    if (!lastDate) return false;

    const currentDate = moment(selectedDate);
    const lastDateObject = moment(lastDate, "DDMMYY");
    const nextWeekDate = currentDate.clone().add(7, "days");

    return nextWeekDate.isAfter(lastDateObject, "day");
  };

  const isPrevWeekDisabled = () => {
    if (!schedule) return false;
    const dates = Object.values(schedule)
      .flatMap((userSchedule) => Object.keys(userSchedule))
      .sort();
    const firstDate = dates.shift();
    if (!firstDate) return false;

    const currentDate = moment(selectedDate);
    const firstDateObject = moment(firstDate, "DDMMYY");
    const prevWeekDate = currentDate.clone().subtract(7, "days");

    return prevWeekDate.isBefore(firstDateObject, "day");
  };

  const getWeekDates = (weekNumber: number) => {
    const weekStart = moment().week(weekNumber).startOf("week");
    const weekEnd = moment().week(weekNumber).endOf("week");

    return `${weekStart.format("DD/MM/YY")} - ${weekEnd.format("DD/MM/YY")}`;
  };

  const handleNextWeek = () => {
    const newWeek = currentWeek + 1;
    setCurrentWeek(newWeek);
    const newDate = moment(selectedDate).add(7, "days");
    setSelectedDate(newDate.format("YYYY-MM-DD"));
  };

  const handlePrevWeek = () => {
    const newWeek = currentWeek - 1;
    setCurrentWeek(newWeek);
    const newDate = moment(selectedDate).subtract(7, "days");
    setSelectedDate(newDate.format("YYYY-MM-DD"));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const groupScheduleByWeek = () => {
    if (!schedule) {
      return;
    }
    const weeksObj: { [key: string]: Schedule } = {};

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(schedule).forEach(([userId, userSchedule]) => {
      Object.keys(userSchedule).forEach((date: string) => {
        const weekNumber = moment(date, "DDMMYY").week().toString();
        if (!weeksObj[weekNumber]) {
          weeksObj[weekNumber] = {};
        }
        if (!weeksObj[weekNumber][date]) {
          weeksObj[weekNumber][date] = 0;
        }
        weeksObj[weekNumber][date] += userSchedule[date] || 0;
      });
    });
    setWeeks(weeksObj);
  };

  useEffect(() => {
    if (schedule) {
      groupScheduleByWeek();
    }
  }, [groupScheduleByWeek, schedule]);

  const handlePrevDay = () => {
    const prevDate = moment(selectedDate).subtract(1, "days");
    setSelectedDate(prevDate.format("YYYY-MM-DD"));
  };

  const handleNextDay = () => {
    const nextDate = moment(selectedDate).add(1, "days");
    setSelectedDate(nextDate.format("YYYY-MM-DD"));
  };

  const getTeamSchedule = (date: string) => {
    const formattedDate = moment(date).format("DDMMYY");

    const amwfhUsers: string[] = [];
    const pmwfhUsers: string[] = [];
    const fulldaywfhUsers: string[] = [];
    let amCount = 0;
    let pmCount = 0;
    let fullDayCount = 0;
    let totalStrength = 0;

    if (schedule) {
      Object.entries(schedule).forEach(([userId, userSchedule]) => {
        const wfhStatus = userSchedule[formattedDate];
        if (wfhStatus !== undefined) {
          if (wfhStatus === 1) {
            amCount++;
            amwfhUsers.push(userId);
          } else if (wfhStatus === 2) {
            pmCount++;
            pmwfhUsers.push(userId);
          } else if (wfhStatus === 3) {
            fullDayCount++;
            fulldaywfhUsers.push(userId);
          } else if (wfhStatus === 0) {
            totalStrength++;
          }
        }
      });
    }

    return {
      amwfhUsers,
      pmwfhUsers,
      fulldaywfhUsers,
      amCount,
      pmCount,
      fullDayCount,
      totalStrength,
    };
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
            <H2 className="text-lg font-bold">
              {moment(selectedDate).format("DD/MM/YY")}
            </H2>
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
          {modalOpen && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-4 rounded-xl">
                <div className="flex justify-end">
                  <button onClick={() => setModalOpen(false)}>
                    <CloseIcon />
                  </button>
                </div>
                <div className="flex flex-col items-center">
                  <Body className="text-lg font-bold">
                    {getTeamSchedule(selectedDate).amwfhUsers.length > 0
                      ? `Staff on AM WFH: ${getTeamSchedule(
                          selectedDate
                        ).amwfhUsers.join(", ")}`
                      : "No Users on AM WFH"}
                  </Body>
                  <Body className="text-lg font-bold">
                    {getTeamSchedule(selectedDate).pmwfhUsers.length > 0
                      ? `Staff on PM WFH: ${getTeamSchedule(
                          selectedDate
                        ).pmwfhUsers.join(", ")}`
                      : "No Users on PM WFH"}
                  </Body>
                  <Body className="text-lg font-bold">
                    {getTeamSchedule(selectedDate).fulldaywfhUsers.length > 0
                      ? `Staff on Full Day WFH: ${getTeamSchedule(
                          selectedDate
                        ).fulldaywfhUsers.join(", ")}`
                      : "No Users on Full Day WFH"}
                  </Body>
                </div>
              </div>
            </div>
          )}
          <div
            className={`flex flex-col items-center p-4 border border-gray-200 min-h-[400px] rounded-xl mb-4 }`}
          >
            <EyeIcon onClick={() => setModalOpen(true)} />
            <BodySmall className="font-bold">
              Click the eye icon to view WFH users
            </BodySmall>
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
      ) : (
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
            <H2 className="text-lg font-bold">{getWeekDates(currentWeek)}</H2>
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
          {weeks[currentWeek.toString()] ? (
            <div className="week-schedule flex flex-col lg:flex-row justify-center lg:space-x-4 space-y-3">
              {Object.keys(weeks[currentWeek.toString()])
                .sort((a, b) => moment(a, "DDMMYY").diff(moment(b, "DDMMYY")))
                .map((date) => (
                  <div
                    key={date}
                    className="flex flex-col justify-between items-center p-4 border border-gray-200 rounded-xl min-h-[100px] lg:min-h-[400px] w-full md:w-1/2 lg:w-1/7 xl:w-1/7 2xl:w-1/7"
                  >
                    {modalOpen && (
                      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-4 rounded-xl">
                          <div className="flex justify-end">
                            <button onClick={() => setModalOpen(false)}>
                              <CloseIcon />
                            </button>
                          </div>
                          <div className="flex flex-col items-center">
                            <Body className="text-lg font-bold">
                              {getTeamSchedule(selectedWeeklyDate).amwfhUsers
                                .length > 0
                                ? `Staff on AM WFH: ${getTeamSchedule(
                                    moment(selectedWeeklyDate, "DDMMYY").format(
                                      "YYYY-MM-DD"
                                    )
                                  ).amwfhUsers.join(", ")}`
                                : "No Users on AM WFH"}
                            </Body>
                            <Body className="text-lg font-bold">
                              {getTeamSchedule(
                                moment(selectedWeeklyDate, "DDMMYY").format(
                                  "YYYY-MM-DD"
                                )
                              ).pmwfhUsers.length > 0
                                ? `Staff on PM WFH: ${getTeamSchedule(
                                    moment(selectedWeeklyDate, "DDMMYY").format(
                                      "YYYY-MM-DD"
                                    )
                                  ).pmwfhUsers.join(", ")}`
                                : "No Users on PM WFH"}
                            </Body>
                            <Body className="text-lg font-bold">
                              {getTeamSchedule(
                                moment(selectedWeeklyDate, "DDMMYY").format(
                                  "YYYY-MM-DD"
                                )
                              ).fulldaywfhUsers.length > 0
                                ? `Staff on Full Day WFH: ${getTeamSchedule(
                                    moment(selectedWeeklyDate, "DDMMYY").format(
                                      "YYYY-MM-DD"
                                    )
                                  ).fulldaywfhUsers.join(", ")}`
                                : "No Users on Full Day WFH"}
                            </Body>
                          </div>
                        </div>
                      </div>
                    )}
                    <H2>{moment(date, "DDMMYY").format("DD/MM/YY")}</H2>
                    <button>
                      <EyeIcon
                        onClick={() => {
                          setModalOpen(true);
                          setSelectedWeeklyDate(date);
                        }}
                      />
                    </button>
                    <BodySmall className="font-bold">
                      Click the eye icon to view WFH users
                    </BodySmall>
                    <Body className="text-lg">
                      AM WFH:{" "}
                      {
                        getTeamSchedule(
                          moment(date, "DDMMYY").format("YYYY-MM-DD")
                        ).amCount
                      }
                    </Body>
                    <Body className="text-lg">
                      PM WFH:{" "}
                      {
                        getTeamSchedule(
                          moment(date, "DDMMYY").format("YYYY-MM-DD")
                        ).pmCount
                      }
                    </Body>
                    <Body className="text-lg">
                      Full Day WFH:{" "}
                      {
                        getTeamSchedule(
                          moment(date, "DDMMYY").format("YYYY-MM-DD")
                        ).fullDayCount
                      }
                    </Body>
                    <Body className="text-lg">
                      Total Strength:{" "}
                      {
                        getTeamSchedule(
                          moment(date, "DDMMYY").format("YYYY-MM-DD")
                        ).totalStrength
                      }
                    </Body>
                  </div>
                ))}
            </div>
          ) : (
            <div>No data for this week.</div>
          )}
        </div>
      )}
    </div>
  );
};
