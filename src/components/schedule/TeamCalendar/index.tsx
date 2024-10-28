import React, { useState, useEffect } from "react";
import { Body, H2, H1, BodySmall } from "@/components/TextStyles";
import moment from "moment";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { EyeIcon } from "@/components/Svgs/eye";
import { CloseIcon } from "@/components/Svgs/close";
import { getEmployeeFullNameByStaffID } from "@/pages/api/employeeApi";
import { ScheduleTable } from "@/components/schedule/Table";

interface TeamMember {
  [date: string]: number | undefined;
}

interface ScheduleData {
  [userId: string]: TeamMember;
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ScheduleProps {
  [userid: string]: {
    [date: string]: number | undefined;
  };
}



// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ScheduleByDateData = {
  amwfhUsers: string[];
  pmwfhUsers: string[];
  fulldaywfhUsers: string[];
  amCount: number;
  pmCount: number;
  fullDayCount: number;
  totalStrength: number;
  scheduleByDate: ScheduleData;
};

interface TeamCalendarProps {
  selectedSchedule: ScheduleData; // Accepting schedule from the parent
}

export const TeamCalendar: React.FC<TeamCalendarProps> = ({
  selectedSchedule,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const staffId = useSelector((state: RootState) => state.auth.staffId);
  const [employeeNames, setEmployeeNames] = useState<{ [key: string]: string }>(
    {}
  );
  const [schedule, setSchedule] = useState<ScheduleData | null>(
    selectedSchedule
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<string>("");

  const [currentView, setCurrentView] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState<string>(
    moment().format("YYYY-MM-DD")
  );

  // Define minDate and maxDate
  const minDate = moment().subtract(2, "months").add(1, "day").startOf("day");
  const maxDate = moment().add(3, "months").subtract(1, "day").endOf("day");

  // isNextDisabled and isPrevDisabled functions remain the same
  const isNextDisabled = () => {
    const currentDate = moment(selectedDate);
    const nextDayDate = currentDate.clone().add(1, "day").format("DDMMYY");
    // Check if any user has schedule data for nextDayDate
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const hasScheduleForNextDay = Object.values(schedule || {}).some(
      (userSchedule) => userSchedule[nextDayDate] !== undefined
    );
    return currentDate.isSameOrAfter(maxDate, "day");
  };

  const isPrevDisabled = () => {
    const currentDate = moment(selectedDate);
    const prevDayDate = currentDate.clone().subtract(1, "day").format("DDMMYY");
    // Check if any user has schedule data for prevDayDate
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const hasScheduleForPrevDay = Object.values(schedule || {}).some(
      (userSchedule) => userSchedule[prevDayDate] !== undefined
    );
    return currentDate.isSameOrBefore(minDate, "day");
  };

  // isNextWeekDisabled and isPrevWeekDisabled functions
  const isPrevWeekDisabled = () => {
    const prevWeekStartDate = moment(selectedDate)
      .clone()
      .subtract(1, "week")
      .startOf("week");

    // Check if any date in the previous week is within the allowed range
    for (let i = 0; i < 7; i++) {
      const date = prevWeekStartDate.clone().add(i, "days");
      if (
        date.isSameOrAfter(minDate, "day") &&
        date.isSameOrBefore(maxDate, "day")
      ) {
        return false; // At least one date is within the range
      }
    }
    return true; // All dates are out of range
  };

  const isNextWeekDisabled = () => {
    const nextWeekStartDate = moment(selectedDate)
      .clone()
      .add(1, "week")
      .startOf("week");

    // Check if any date in the next week is within the allowed range
    for (let i = 0; i < 7; i++) {
      const date = nextWeekStartDate.clone().add(i, "days");
      if (
        date.isSameOrAfter(minDate, "day") &&
        date.isSameOrBefore(maxDate, "day")
      ) {
        return false; // At least one date is within the range
      }
    }
    return true; // All dates are out of range
  };

  const getWeekDates = () => {
    const weekStart = moment(selectedDate).startOf("week");
    const weekEnd = moment(selectedDate).endOf("week");

    return `${weekStart.format("DD/MM/YY")} - ${weekEnd.format("DD/MM/YY")}`;
  };

  const getEmployeeName = async (staffId: number) => {
    try {
      const response = await getEmployeeFullNameByStaffID(staffId.toString());
      return response;
    } catch (error) {
      console.error("Error fetching employee name:", error);
      return "Unknown User";
    }
  };

  const fetchEmployeeNames = async (userIds: string[]) => {
    const names: { [key: string]: string } = { ...employeeNames };

    for (const userId of userIds) {
      if (!names[userId]) {
        try {
          const name = await getEmployeeName(Number(userId));
          names[userId] = name;
        } catch (error) {
          console.error("Error fetching employee name:", error);
          names[userId] = "Unknown User";
        }
      }
    }

    setEmployeeNames(names);
  };

  const handleEyeIconClick = (date: string) => {
    // Determine the format of the incoming date and parse accordingly
    let formattedDate = date;
    if (date.length === 6) {
      // If date is in "DDMMYY" format, convert to "YYYY-MM-DD"
      formattedDate = moment(date, "DDMMYY").format("YYYY-MM-DD");
    } else if (date.includes("/")) {
      // If date is in "DD/MM/YY" format, convert to "YYYY-MM-DD"
      formattedDate = moment(date, "DD/MM/YY").format("YYYY-MM-DD");
    }

    // Now use the formatted date
    const { amwfhUsers, pmwfhUsers, fulldaywfhUsers } =
      getTeamSchedule(formattedDate);
    const uniqueUserIds = Array.from(
      new Set([...amwfhUsers, ...pmwfhUsers, ...fulldaywfhUsers])
    );

    fetchEmployeeNames(uniqueUserIds);
    setModalDate(formattedDate);
    setModalOpen(true);
    setSearchQuery("");
  };

  useEffect(() => {
    setSchedule(selectedSchedule);
  }, [selectedSchedule]);

  const handleNextWeek = () => {
    const newDate = moment(selectedDate).clone().add(1, "week").startOf("week");
    setSelectedDate(newDate.format("YYYY-MM-DD"));
  };

  const handlePrevWeek = () => {
    const newDate = moment(selectedDate)
      .clone()
      .subtract(1, "week")
      .startOf("week");
    setSelectedDate(newDate.format("YYYY-MM-DD"));
  };

  const handlePrevDay = () => {
    const prevDate = moment(selectedDate).subtract(1, "days");
    setSelectedDate(prevDate.format("YYYY-MM-DD"));
  };

  const handleNextDay = () => {
    const nextDate = moment(selectedDate).add(1, "days");
    setSelectedDate(nextDate.format("YYYY-MM-DD"));
  };

  const getTeamSchedule = (date: string) => {
    const formattedDate = moment(date, "YYYY-MM-DD").format("DDMMYY");

    const amwfhUsers: string[] = [];
    const pmwfhUsers: string[] = [];
    const fulldaywfhUsers: string[] = [];
    const scheduleByDate = schedule || {};

    let amCount = 0;
    let pmCount = 0;
    let fullDayCount = 0;
    let presentCount = 0;

    const totalStrength = Object.keys(schedule || {}).length;

    if (schedule) {
      Object.entries(schedule).forEach(([userId, userSchedule]) => {
        const wfhStatus = userSchedule[formattedDate];

        if (wfhStatus === 1) {
          amCount++;
          amwfhUsers.push(userId);
        } else if (wfhStatus === 2) {
          pmCount++;
          pmwfhUsers.push(userId);
        } else if (wfhStatus === 3) {
          fullDayCount++;
          fulldaywfhUsers.push(userId);
        } else {
          // Users with wfhStatus === 0 or undefined are considered present
          presentCount++;
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
      presentCount,
      totalStrength,
      scheduleByDate,
    };
  };

  // Updated getWeekDatesArray function
  const getWeekDatesArray = () => {
    const weekStart = moment(selectedDate).startOf("week");
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = weekStart.clone().add(i, "days");
      const isWithinRange =
        currentDate.isSameOrAfter(minDate, "day") &&
        currentDate.isSameOrBefore(maxDate, "day");
      dates.push({ date: currentDate, isWithinRange });
    }
    return dates;
  };

  const weekDates = getWeekDatesArray();

  return (
    <div className="container mx-auto p-5 max-w-[95%] lg:max-w-[80%]">
      <H1 className="text-2xl font-bold mb-4">WFH Calendar</H1>
      <button
        className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 mb-4 rounded-xl"
        onClick={() => setCurrentView(currentView === "day" ? "week" : "day")}
      >
        Toggle View
      </button>

      {/* Modal Rendering */}
      {modalOpen &&
        (() => {
          const { amwfhUsers, pmwfhUsers, fulldaywfhUsers, scheduleByDate } =
            getTeamSchedule(modalDate);
          console.log("scheduleByDate", scheduleByDate);
          const amwfhUserNames = amwfhUsers.map(
            (userId) => employeeNames[userId] || "Loading..."
          );
          const pmwfhUserNames = pmwfhUsers.map(
            (userId) => employeeNames[userId] || "Loading..."
          );
          const fulldaywfhUserNames = fulldaywfhUsers.map(
            (userId) => employeeNames[userId] || "Loading..."
          );

          const filteredAMUsers = amwfhUserNames.filter((name) =>
            name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          const filteredPMUsers = pmwfhUserNames.filter((name) =>
            name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          const filteredFullDayUsers = fulldaywfhUserNames.filter((name) =>
            name.toLowerCase().includes(searchQuery.toLowerCase())
          );

          return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-30">
              <div className="bg-white p-4 rounded-xl max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                  <H2 className="text-lg font-bold">
                    {moment(modalDate).format("DD/MM/YY")} - WFH Schedule
                  </H2>
                  <button
                    data-testid="close-modal"
                    onClick={() => setModalOpen(false)}
                  >
                    <CloseIcon />
                  </button>
                </div>
                {/* <input
                  type="text"
                  placeholder="Search by name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4 p-2 border border-gray-300 rounded w-full"
                /> */}
                <div
                  className="flex flex-col space-y-2"
                  data-testid="user-name"
                >
                  <Body className="text-lg font-bold">
                    Staff on AM WFH:
                    {filteredAMUsers.length > 0
                      ? ` ${filteredAMUsers.join(", ")}`
                      : " No Users on AM WFH"}
                  </Body>
                  <Body className="text-lg font-bold">
                    Staff on PM WFH:
                    {filteredPMUsers.length > 0
                      ? ` ${filteredPMUsers.join(", ")}`
                      : " No Users on PM WFH"}
                  </Body>
                  <Body className="text-lg font-bold">
                    Staff on Full Day WFH:
                    {filteredFullDayUsers.length > 0
                      ? ` ${filteredFullDayUsers.join(", ")}`
                      : " No Users on Full Day WFH"}
                  </Body>
                </div>
                <ScheduleTable
                  scheduleByDate={scheduleByDate}
                  selectedDate={modalDate}
                />
              </div>
            </div>
          );
        })()}

      {/* View Conditional Rendering */}
      {currentView === "day" ? (
        /* Day View Code */
        <div>
          <div className="flex justify-between mb-4">
            <button
              className={`bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-xl ${
                isPrevDisabled() ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handlePrevDay}
              disabled={isPrevDisabled()}
            >
              Prev Day
            </button>
            <H2 className="text-lg text-center font-bold">
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
          <div className="flex flex-col items-center p-4 border border-gray-200 min-h-[400px] rounded-xl mb-4">
            <EyeIcon
              data-testid={`eye-icon-${selectedDate}`}
              onClick={() => handleEyeIconClick(selectedDate)}
            />
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
              Present in Office: {getTeamSchedule(selectedDate).presentCount}
            </Body>
            <Body className="text-lg">
              Total Strength: {getTeamSchedule(selectedDate).totalStrength}
            </Body>
          </div>
        </div>
      ) : (
        /* Week View Code */
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
            <H2 className="text-lg text-center font-bold">{getWeekDates()}</H2>
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
          <BodySmall className="font-bold">
            Click the eye icon to view WFH users
          </BodySmall>
          <div className="week-schedule flex flex-col lg:flex-row justify-center lg:space-x-4 space-y-3">
            {weekDates.map(({ date: dateMoment, isWithinRange }) => {
              const dateStr = dateMoment.format("YYYY-MM-DD");
              const displayDate = dateMoment.format("DD/MM/YY");

              if (isWithinRange) {
                const scheduleData = getTeamSchedule(dateStr);
                return (
                  <div
                    key={dateStr}
                    className="flex flex-col justify-between items-center p-4 border border-gray-200 rounded-xl min-h-[100px] lg:min-h-[400px] w-full md:w-1/2 lg:w-1/7 xl:w-1/7 2xl:w-1/7"
                  >
                    <H2>{displayDate}</H2>
                    <button>
                      <EyeIcon
                        data-testid={`eye-icon-${dateStr}`}
                        onClick={() => handleEyeIconClick(dateStr)}
                      />
                    </button>
                    <Body className="text-lg">
                      AM WFH: {scheduleData.amCount}
                    </Body>
                    <Body className="text-lg">
                      PM WFH: {scheduleData.pmCount}
                    </Body>
                    <Body className="text-lg">
                      Full Day WFH: {scheduleData.fullDayCount}
                    </Body>
                    <Body className="text-lg">
                      Total Strength: {scheduleData.totalStrength}
                    </Body>
                  </div>
                );
              } else {
                // Render an empty placeholder to maintain alignment
                return (
                  <div
                    key={dateStr}
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
