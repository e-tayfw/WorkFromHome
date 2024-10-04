import { useState } from "react";
import { Display, BodyLarge } from "@/components/TextStyles"; // Import BodyLarge for buttons
import ApproveTable from "@/components/approve/table";
import CalendarView from "@/components/approve/calendar"; // Import the CalendarView

const Approve = () => {
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table"); // State to toggle between views

  return (
    <div data-testid="approve-component" className="flex flex-col items-start">
      <div className="flex flex-row relative mt-20 lg:mt-0 max-h-[500px]">
        <div className="px-[16px] lg:px-[128px]">
          <div className="py-[10px] lg:py-[60px] text-[50px] lg:text-[80px] leading-[60px] lg:leading-[95px] font-bold">
            <span className="block animate-slide-up1 mt-[60px] md:mt-[100px]">
              <Display>Manage Staff Requests</Display>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-8xl w-full px-[16px] md:px-[128px] pt-[60px] pb-[30px] md:pt-[50px]">
        {/* Toggle Button */}
        <div className="mb-4 flex space-x-4">
          <button
            className={`px-4 py-2 rounded-md focus:outline-none transition-all duration-200 ${
              viewMode === "table"
                ? "bg-primary text-white shadow-lg"
                : "bg-gray-200 text-primary"
            }`}
            onClick={() => setViewMode("table")}
          >
            <BodyLarge className="font-semibold">Table View</BodyLarge>
          </button>
          <button
            className={`px-4 py-2 rounded-md focus:outline-none transition-all duration-200 ${
              viewMode === "calendar"
                ? "bg-primary text-white shadow-lg"
                : "bg-gray-200 text-primary"
            }`}
            onClick={() => setViewMode("calendar")}
          >
            <BodyLarge className="font-semibold">Calendar View</BodyLarge>
          </button>
        </div>

        {/* Conditionally render either the table or calendar view */}
        {viewMode === "table" ? <ApproveTable /> : <CalendarView />}
      </div>
    </div>
  );
};

export default Approve;
