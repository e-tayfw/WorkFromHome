import React, { useEffect, useState } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-bs5";
import "datatables.net-responsive-bs5";
import { getEmployeeFullNameByStaffID } from "@/pages/api/employeeApi";
import { SpinnerIcon } from "@/components/Svgs/spinner";
DataTable.use(DT);

interface ScheduleProps {
  [userid: string]: {
    [date: string]: number | undefined;
  };
}

interface ScheduleTableProps {
  scheduleByDate: ScheduleProps;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  scheduleByDate,
}) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const getEmployeeName = async (userid: string) => {
    const name = await getEmployeeFullNameByStaffID(userid.toString());
    return name;
  };

  const scheduleMapping = (sched: number) => {
    switch (sched) {
      case 0:
        return "In Office";
      case 1:
        return "AM WFH";
      case 2:
        return "PM WFH";
      case 3:
        return "Full Day WFH";
      default:
        return "Unknown";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const tempData: any[] = [];
      for (const userid in scheduleByDate) {
        const name = await getEmployeeName(userid);
        for (const date in scheduleByDate[userid]) {
          tempData.push({
            userid,
            name,
            sched: scheduleMapping(scheduleByDate[userid][date] ?? 0),
          });
        }
      }
      setTableData(tempData);
      setLoading(false);
    };

    fetchData();
  }, [scheduleByDate]);

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center">
          <SpinnerIcon />
        </div>
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { title: "User ID", data: "userid" },
            { title: "Name", data: "name" },
            { title: "Schedule", data: "sched" },
          ]}
          className="min-w-full divide-y divide-gray-200"
          options={{
            responsive: true,
            pagingType: "simple",
          }}
        />
      )}
    </div>
  );
};
