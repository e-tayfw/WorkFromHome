import { useState, useEffect } from "react";
import { Display, BodyLarge, H1 } from "@/components/TextStyles";
import ApproveTable from "@/components/approve/table";
import CalendarView from "@/components/approve/calendar";
import axios from "axios";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Approve = () => {
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [noReportsMessage, setNoReportsMessage] = useState<string | null>(null);
  const [employees, setEmployees] = useState([]); // State to hold employee data
  const staffId = useSelector((state: any) => state.auth.staffId);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure ToastContainer is only rendered on the client side
    setIsClient(true);
    
    // Fetch the message from the API based on staffId
    const fetchReportData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8085/api/employee/team/manager/${staffId}`);

        const message = response.data.message;

        // Set employees and noReportsMessage based on the response
        if (message === "No employee reports to this person") {
          setNoReportsMessage("You have no direct Reports");
        } else {
          const mappedEmployees = response.data.employees.map((emp: any) => ({
            Staff_ID: emp.Staff_ID,
            Staff_FName: emp.Staff_FName,
            Staff_LName: emp.Staff_LName
          }));
          setEmployees(mappedEmployees);
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
        toast.error("Failed to fetch report data.");
      }
    };

    fetchReportData();
  }, [staffId]);

  if (noReportsMessage) {
    return (
      <div data-testid="approve-component" className="flex flex-col items-start">
        <div className="flex flex-row relative mt-20 lg:mt-0 max-h-[500px]">
          <div className="px-[16px] lg:px-[128px]">
            <div className="py-[10px] lg:py-[60px]">
              <span className="block animate-slide-up1 mt-[60px] md:mt-[100px]">
                <Display>Manage Staff Requests</Display>
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-8xl w-full px-[16px] md:px-[128px] pt-[60px] pb-[30px] md:pt-[50px]">
          <div className="flex">
            <H1 className="font-bold text-center">You have no direct reports :(</H1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="approve-component" className="flex flex-col items-start">
      {/* Conditionally render ToastContainer only on the client */}
      {isClient && <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick />}
      
      <div className="flex flex-row relative mt-20 lg:mt-0 max-h-[500px]">
        <div className="px-[16px] lg:px-[128px]">
          <div className="py-[10px] lg:py-[60px]">
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
              viewMode === "table" ? "bg-primary text-white shadow-lg" : "bg-gray-200 text-primary"
            }`}
            onClick={() => setViewMode("table")}
          >
            <BodyLarge className="font-semibold">Table View</BodyLarge>
          </button>
          <button
            className={`px-4 py-2 rounded-md focus:outline-none transition-all duration-200 ${
              viewMode === "calendar" ? "bg-primary text-white shadow-lg" : "bg-gray-200 text-primary"
            }`}
            onClick={() => setViewMode("calendar")}
          >
            <BodyLarge className="font-semibold">Calendar View</BodyLarge>
          </button>
        </div>

        {/* Conditionally render either the table or calendar view */}
        {viewMode === "table" ? (
          <ApproveTable employees={employees} />
        ) : (
          <CalendarView />
        )}
      </div>
    </div>
  );
};

export default Approve;
