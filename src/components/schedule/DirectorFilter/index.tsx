import React, { useState, useEffect } from "react";
import { Label, Body } from "@/components/TextStyles";
import { generateDirectorTeamSchedule } from "@/pages/api/scheduleApi"; // Adjust the import paths
import { SpinnerIcon } from "@/components/Svgs/spinner";
import { generateTeamSchedule } from "@/pages/api/scheduleApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface FilterProps {
  onSelect: (teamSchedule: any) => void; // Update type according to the expected schedule type
}

export const DirectorFilter: React.FC<FilterProps> = ({ onSelect }) => {
  const [teams, setTeams] = useState<string[]>([]);
  const [loadingTeams, setLoadingTeams] = useState<boolean>(false);
  const [loadingDefaultTeam, setLoadingDefaultTeam] = useState<boolean>(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [masterTeamData, setMasterTeamData] = useState<any>(null);

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
        // Fetch the default team schedule on initial load
        const defaultTeamScheduleResponse = await generateTeamSchedule(
          Number(staffId)
        );
        const defaultTeamSchedule = defaultTeamScheduleResponse.team_schedule;
        // Update the parent component with the default team schedule
        onSelect(defaultTeamSchedule);
        const fetchedTeamSchedule = await generateDirectorTeamSchedule(
          Number(staffId)
        );
        setMasterTeamData(fetchedTeamSchedule);
        setTeams(Object.keys(fetchedTeamSchedule["director_schedule"]));
      } catch (error) {
        console.error("Error fetching director's team list:", error);
      } finally {
        setLoadingTeams(false);
        setLoadingDefaultTeam(false);
      }
    };

    fetchTeams();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId]);


  const handleTeamChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const teamName = event.target.value;
    setSelectedTeam(teamName);
    // Clear the department selection
    setSelectedDepartment("");

    if (teamName) {
      const teamSchedule = masterTeamData["director_schedule"][teamName];
      onSelect(teamSchedule);
    } else {
      // If no team is selected, reset to default schedule if needed
      // onSelect(defaultSchedule);
    }
  };

  const handleClearFilters = async () => {
    setSelectedTeam("");
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
      {loadingTeams ? (
        <div className="flex flex-row items-center justify-center">
          Loading the teams available <SpinnerIcon />
        </div>
      ) : (
        <div className="flex flex-row items-center justify-center mb-4">
          <Label className="mr-2">Select Team:</Label>
          <select
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
