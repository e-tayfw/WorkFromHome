import React, { useState, useEffect } from "react";
import { Label, Body } from "@/components/TextStyles";
import { getDepartmentList } from "@/pages/api/departmentApi"; // Adjust the import paths
import { getTeamList } from "@/pages/api/teamApi"; // Adjust the import paths
import { SpinnerIcon } from "@/components/Svgs/spinner";
import { generateTeamSchedule } from "@/pages/api/scheduleApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface FilterProps { 
  onSelect: (teamSchedule: any) => void; // Update type according to the expected schedule type
}

export const HRFilter: React.FC<FilterProps> = ({ onSelect }) => {
  const [teams, setTeams] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loadingTeams, setLoadingTeams] = useState<boolean>(false);
  const [loadingDepartments, setLoadingDepartments] = useState<boolean>(false);
  const [loadingDefaultTeam, setLoadingDefaultTeam] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [masterTeamData, setMasterTeamData] = useState<any>(null);
  const [masterDepartmentData, setMasterDepartmentData] = useState<any>(null);

  // retrieve staff id from the redux store
    const staffId = useSelector((state: RootState) => state.auth.staffId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const role = useSelector((state: RootState) => state.auth.role);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const dept = useSelector((state: RootState) => state.auth.dept);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoadingTeams(true);
      try {
        const fetchedTeamSchedule = await getTeamList();
        setMasterTeamData(fetchedTeamSchedule);
        setTeams(Object.keys(fetchedTeamSchedule["HR_team_schedule"]));
      } catch (error) {
        console.error("Error fetching team list:", error);
      } finally {
        setLoadingTeams(false);
      }
    };

    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const fetchedDepartmentSchedule = await getDepartmentList();
        setMasterDepartmentData(fetchedDepartmentSchedule);
        setDepartments(
          Object.keys(fetchedDepartmentSchedule["HR_department_schedule"])
        );
      } catch (error) {
        console.error("Error fetching department list:", error);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchTeams();
    fetchDepartments();
  }, []);

  const handleDepartmentChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const departmentName = event.target.value;
    setSelectedDepartment(departmentName);
    // Clear the team selection
    setSelectedTeam("");

    if (departmentName) {
      const departmentSchedule =
        masterDepartmentData["HR_department_schedule"][departmentName];
      onSelect(departmentSchedule);
    } else {
      // If no department is selected, reset to default schedule if needed
      // onSelect(defaultSchedule);
    }
  };

  const handleTeamChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const teamName = event.target.value;
    setSelectedTeam(teamName);
    // Clear the department selection
    setSelectedDepartment("");

    if (teamName) {
      const teamSchedule = masterTeamData["HR_team_schedule"][teamName];
      onSelect(teamSchedule);
    } else {
      // If no team is selected, reset to default schedule if needed
      // onSelect(defaultSchedule);
    }
  };


  const handleClearFilters = async () => {
    setSelectedTeam("");
    setSelectedDepartment("");
    setLoadingDefaultTeam(true);

    try {
      // Fetch your own team schedule
      const defaultTeamScheduleResponse = await generateTeamSchedule(
        Number(staffId)
      );

      // Assuming the response structure contains 'team_schedule'
      const defaultTeamSchedule = defaultTeamScheduleResponse.team_schedule;

      // Update the parent component with the default team schedule
      onSelect(defaultTeamSchedule);
    } catch (error) {
      console.error("Error fetching default team schedule:", error);
    } finally {
      setLoadingDefaultTeam(false);
    }
  };


  return (
    <div className="flex flex-col items-center">
      {loadingDepartments ? (
        <div className="flex flex-row items-center justify-center">
          Loading the departments available <SpinnerIcon />
        </div>
      ) : (
        <div className="flex flex-row items-center justify-center mb-4">
          <Label className="mr-2">Select Department:</Label>
          <select
            data-testid="department-select"
            name="department"
            id="department"
            className="rounded-md p-2"
            value={selectedDepartment}
            onChange={handleDepartmentChange}
          >
            <option value="">-- Select a department --</option>
            {departments.map((departmentName: string) => (
              <option key={departmentName} value={departmentName}>
                {departmentName}
              </option>
            ))}
          </select>
        </div>
      )}
      {loadingTeams ? (
        <div className="flex flex-row items-center justify-center">
          Loading the teams available <SpinnerIcon />
        </div>
      ) : (
        <div className="flex flex-row items-center justify-center mb-4">
          <Label className="mr-2">Select Team:</Label>
          <select
            data-testid="team-select"
            name="team"
            id="team"
            className="rounded-md p-2"
            value={selectedTeam}
            onChange={handleTeamChange}
          >
            <option value="">-- Select a team --</option>
            {teams.map((teamName: string) => (
              <option key={teamName} value={teamName}>
                {teamName}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-row items-center justify-center mb-4">
        <button
          className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-xl"
          onClick={handleClearFilters}
          disabled={loadingDefaultTeam}
        >
          {loadingDefaultTeam ? (
            <div className="flex items-center">
              Loading... <SpinnerIcon />
            </div>
          ) : (
            "Clear Filters"
          )}
        </button>
      </div>

      {selectedDepartment && (
        <div className="mt-4">
          <Body>Selected Department: {selectedDepartment}</Body>
        </div>
      )}
      {selectedTeam && (
        <div className="mt-4">
          <Body>Selected Team: {selectedTeam}</Body>
        </div>
      )}
      {!selectedTeam && !selectedDepartment && (
        <div className="mt-4">
          <Body>Currently Viewing Your Own Team</Body>
        </div>
      )}
    </div>
  );
};
