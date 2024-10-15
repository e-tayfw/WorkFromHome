import { getTeamList } from "../../../pages/api/teamApi";
import { getDepartmentList } from "../../../pages/api/departmentApi";
import { useState, useEffect } from "react";
import { SpinnerIcon } from "@/components/Svgs/spinner";
import { Body, Label } from "@/components/TextStyles";

interface FilterProps {
  onSelect: (teamSchedule: any) => void; // Update type according to the expected schedule type
  filterType: string;
}

export const Filter: React.FC<FilterProps> = ({ onSelect, filterType }) => {
  const [teams, setTeams] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [departmentLoading, setDepartmentLoading] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [masterData, setMasterData] = useState<any>(null);
  const [masterDepartmentData, setMasterDepartmentData] = useState<any>(null);
  useEffect(() => {
    if (filterType === "team") {
      const fetchTeams = async () => {
        setLoading(true);
        try {
          const fetchedTeamSchedule = await getTeamList();
          setMasterData(fetchedTeamSchedule);
          setTeams(Object.keys(fetchedTeamSchedule["HR_team_schedule"]));
          console.log("Master data:", masterData);
        } catch (error) {
          console.error("Error fetching team list:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTeams();
    }
    
    else {
      const fetchDepartments = async () => {
        setDepartmentLoading(true);
        try {
          const fetchedDepartmentSchedule = await getDepartmentList();
          setMasterDepartmentData(fetchedDepartmentSchedule);
          setDepartments(
            Object.keys(fetchedDepartmentSchedule["HR_department_schedule"])
          );
        } catch (error) {
          console.error("Error fetching department list:", error);
        } finally {
          setDepartmentLoading(false);
        }
      };
      fetchDepartments();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleDepartmentChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const departmentName = event.target.value;
    setSelectedDepartment(departmentName);

    if (departmentName) {
      const departmentSchedule =
        masterDepartmentData["HR_department_schedule"][departmentName];
      onSelect(departmentSchedule);
    }
  };

  const handleTeamChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const teamName = event.target.value;
    setSelectedTeam(teamName);

    if (teamName) {
      const teamSchedule = masterData["HR_team_schedule"][teamName];
      onSelect(teamSchedule);
    }
  };


  if (filterType === "department") {
    if (departmentLoading) {
      return (
        <div className="flex flex-col items-center">
          <div className="flex flex-row items-center justify-center">
            Loading the departments available <SpinnerIcon />
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center">
          <div className="flex flex-row items-center justify-center">
            <Label className="mr-2">Select Department:</Label>
            <select
              name="department"
              id="department"
              className="rounded-md p-2"
              value={selectedDepartment}
              onChange={handleDepartmentChange} // Update the handler
            >
              <option value="" disabled>
                -- Select a department --
              </option>
              {departments.map((departmentName: string) => (
                <option key={departmentName} value={departmentName}>
                  {departmentName}
                </option>
              ))}
            </select>
          </div>
          {selectedDepartment && (
            <div className="mt-4">
              <Body>Selected Department: {selectedDepartment}</Body>
            </div>
          )}
        </div>
      );
    }




  } else {
    
    if (loading) {
      return (
        <div className="flex flex-col items-center">
          <div className="flex flex-row items-center justify-center">
            Loading the teams available <SpinnerIcon />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-center justify-center">
          <Label className="mr-2">Select Manager&apos;s Team:</Label>
          <select
            name="team"
            id="team"
            className="rounded-md p-2"
            value={selectedTeam}
            onChange={handleTeamChange} // Update the handler
          >
            <option value="" disabled>
              -- Select a team --
            </option>
            {teams.map((teamName: string) => (
              <option key={teamName} value={teamName}>
                {teamName}
              </option>
            ))}
          </select>
        </div>
        {selectedTeam && (
          <div className="mt-4">
            <Body>Selected Team: {selectedTeam}</Body>
          </div>
        )}
        {!selectedTeam && (
          <div className="mt-4">
            <Body>Currently Viewing Your Own Team</Body>
          </div>
        )}
      </div>
    );
  }
};
