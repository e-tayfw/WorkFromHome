import { Display } from "@/components/TextStyles";
import { WFHCalendar } from "@/components/schedule/Calendar";
import { TeamCalendar } from "@/components/schedule/TeamCalendar";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import React, { useState, useEffect, useCallback } from "react";
// import { getEmployeeDataByEmail } from "@/pages/api/employeeApi";
import { HRFilter } from "@/components/schedule/HRFilter";
import { SpinnerIcon } from "@/components/Svgs/spinner";
import {
  generateDirectorTeamSchedule,
  generateManagerTeamSchedule,
  generateTeamSchedule,
} from "@/pages/api/scheduleApi";
import { DirectorFilter } from "./DirectorFilter";
import { ManagerView } from "./ManagerView";

const Schedule: React.FC = () => {
  const router = useRouter();
  const { team } = router.query;
  // const staffUsername = useSelector((state: RootState) => state.auth.email);
  const staffId = useSelector((state: RootState) => state.auth.staffId);
  const [loading, setLoading] = useState<boolean>(false);
  const [scheduleData, setScheduleData] = useState<any>(null); // Adjust this type according to ScheduleData type

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const role = useSelector((state: RootState) => state.auth.role);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dept = useSelector((state: RootState) => state.auth.dept);

  const fetchSchedule = useCallback(async () => {
    if (staffId) {
      try {
        setLoading(true);
        if (role == "1" && dept != "HR") {
          const fetchedSchedule = await generateDirectorTeamSchedule(
            Number(staffId)
          );
          setScheduleData(fetchedSchedule.director_schedule); // Set the fetched data
          setLoading(false);
        } else if (role == "3") {
          const fetchedSchedule = await generateManagerTeamSchedule(
            Number(staffId)
          );
          setScheduleData(fetchedSchedule.team_schedule); // Set the fetched data
          setLoading(false);
        } else {
          const fetchedSchedule = await generateTeamSchedule(Number(staffId));
          setScheduleData(fetchedSchedule.team_schedule); // Set the fetched data
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
      } finally {
      }
    } else {
      console.error("No staffId found in Redux store");
      setLoading(false);
    }
  }, [staffId, role, dept]);

  // Fetch the initial schedule for the user's team on mount
  useEffect(() => {
    fetchSchedule();
    // console.log(team)
  }, [fetchSchedule]);

  const handleTeamSelect = (teamSchedule: any) => {
    setScheduleData(teamSchedule); // Update the state with the selected team's schedule
  };
  const handleDepartmentSelect = (departmentSchedule: any) => {
    setScheduleData(departmentSchedule); // Update the state with the selected department's schedule
  };

  if (loading) {
    return (
      <div className="flex flex-row relative mt-20 lg:mt-0 max-h-[500px] ">
        <div className="px-[16px] lg:px-[128px]">
          <div className="py-[10px] lg:py-[60px] text-[50px] lg:text-[80px] leading-[60px] lg:leading-[95px] font-bold ">
            <span className="block animate-slide-up1 mt-[60px] md:mt-[100px]">
              <Display>
                Loading <SpinnerIcon />{" "}
              </Display>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="schedule-component" className="flex flex-col items-start">
      <div className="flex flex-row relative mt-20 lg:mt-0 max-h-[500px] ">
        <div className="px-[16px] lg:px-[128px]">
          <div className="py-[10px] lg:py-[60px] text-[50px] lg:text-[80px] leading-[60px] lg:leading-[95px] font-bold ">
            <span className="block animate-slide-up1 mt-[60px] md:mt-[100px]">
              <Display>Let&apos;s Get at it!</Display>
            </span>
          </div>
        </div>
      </div>
      {role == "1" && team && dept == "HR" && (
        <div className="max-w-8xl w-full px-[16px] md:px-[128px] pt-[60px] pb-[30px] md:pt-[50px]">
          <HRFilter onSelect={handleDepartmentSelect} />
        </div>
      )}
      {role == "1" && team && dept != "HR" && (
        <div className="max-w-8xl w-full px-[16px] md:px-[128px] pt-[60px] pb-[30px] md:pt-[50px]">
          <DirectorFilter onSelect={handleTeamSelect} />
        </div>
      )}
      {role == "3" && team && (
        <div className="max-w-8xl w-full px-[16px] md:px-[128px] pt-[60px] pb-[30px] md:pt-[50px]">
          <ManagerView onSelect={handleTeamSelect} />
        </div>
      )}

      <div className="max-w-8xl w-full px-[16px] md:px-[128px] pt-[60px] pb-[30px] md:pt-[50px]">
        {team ? ( // Ensure scheduleData is not null before rendering
          <TeamCalendar selectedSchedule={scheduleData} />
        ) : (
          <WFHCalendar />
        )}
      </div>
    </div>
  );
};

export default Schedule;
