import React, { useState, useEffect } from "react";
import { Body } from "@/components/TextStyles";
import { generateTeamSchedule } from "@/pages/api/scheduleApi";
import { generateManagerTeamSchedule } from "@/pages/api/scheduleApi";
import { SpinnerIcon } from "@/components/Svgs/spinner";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface ManagerViewProps {
  onSelect: (teamSchedule: any) => void; // Update type according to the expected schedule type
}

export const ManagerView: React.FC<ManagerViewProps> = ({ onSelect }) => {
  const [isInCharge, setIsInCharge] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [teamSchedule, setTeamSchedule] = useState<any>(null);

  // Retrieve staff id from the redux store
  const staffId = useSelector((state: RootState) => state.auth.staffId);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const role = useSelector((state: RootState) => state.auth.role);

  const fetchOwnTeamSchedule = async () => {
    setLoading(true);
    try {
      const ownTeamScheduleResponse = await generateTeamSchedule(
        Number(staffId)
      );
      const ownTeamSchedule = ownTeamScheduleResponse.team_schedule;

      setTeamSchedule(ownTeamSchedule);
      onSelect(ownTeamSchedule);
    } catch (error) {
      console.error("Error fetching own team schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagedTeamSchedule = async () => {
    setLoading(true);
    try {
      const managedTeamScheduleResponse = await generateManagerTeamSchedule(
        Number(staffId)
      );
      const managedTeamSchedule =
        managedTeamScheduleResponse.team_schedule;
      setTeamSchedule(managedTeamSchedule);
      onSelect(managedTeamSchedule);
    } catch (error) {
      console.error("Error fetching in-charge team schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch the default schedule on initial load (Own Team)
    fetchOwnTeamSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId]);

  const handleToggle = () => {
    if (isInCharge) {
      // Switch to Own Team
      fetchOwnTeamSchedule();
    } else {
      // Switch to In-Charge Teams
      fetchManagedTeamSchedule();
    }
    setIsInCharge(!isInCharge);
  };


  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row items-center justify-center mb-4 space-x-4">
        <button
          className={`text-white font-bold py-2 px-4 rounded-xl transition-colors duration-300 ${
            isInCharge
              ? "bg-cyan-950 hover:bg-black"
              : "bg-primary hover:bg-black"
          }`}
          onClick={handleToggle}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center">
              Loading... <SpinnerIcon />
            </div>
          ) : isInCharge ? (
            "View Own Team"
          ) : (
            "View Team In Charge"
          )}
        </button>
      </div>

      {isInCharge ? (
        <div className="mt-4">
          <Body>Currently Viewing: Team In Charge Of</Body>
        </div>
      ) : (
        <div className="mt-4">
          <Body>Currently Viewing: Own Team</Body>
        </div>
      )}
    </div>
  );
};
