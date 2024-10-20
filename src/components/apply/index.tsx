import React, { useState, useEffect, useCallback } from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Datecomponent } from "@/components/apply/datepicker";
import { Selection } from "@/components/apply/selection";
import { Reason } from "@/components/apply/reason";
import { Submit } from "@/components/apply/submit";
import { DateRangePickerComponent } from "@/components/apply/range_datepicker";
import { Daypicker } from "@/components/apply/day"
import { Body, Display } from "@/components/TextStyles";
import Swal from 'sweetalert2';
import { useSelector } from "react-redux";
import axios, { AxiosError } from 'axios';
import { toast } from "react-toastify";

type ArrangementType = 'AM' | 'PM' | 'FD' | '';

type DayValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 0;


interface DateRange {
  start: string;
  end: string;
}

interface SubmitData {
  staffid: number;
  date: string;
  arrangement: ArrangementType;
  reason: string;
}

interface SubmitRecurringData {
  staffid: number;
  startdate: string;
  enddate: string;
  arrangement: ArrangementType;
  day: number;
  reason: string;
}

const Apply: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedArrangement, setArrangement] = useState<ArrangementType>("");
  const [reason, setReason] = useState("");
  const [day, setDay] = useState<DayValue>(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isRecurringFormValid, setIsRecurringFormValid] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({start: '', end: ''});
  const staffid = useSelector((state: any) => state.auth.staffId);

  useEffect(() => {
    setIsFormValid(
      selectedDate !== "" && selectedArrangement !== "" && reason.trim() !== ""
    );
  }, [selectedDate, selectedArrangement, reason]);

  useEffect(() => {
    const isDateRangeValid = dateRange.start !== '' && 
                             dateRange.end !== '' && 
                             new Date(dateRange.start) <= new Date(dateRange.end);
    
    setIsRecurringFormValid(
      isDateRangeValid &&
      day !== 0 && 
      selectedArrangement !== "" && 
      reason.trim() !== ""
    );
  }, [dateRange, day, selectedArrangement, reason]);

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleArrangementChange = useCallback((value: ArrangementType) => {
    setArrangement(value);
  }, []);

  const handleReasonChange = useCallback((text: string) => {
    setReason(text);
  }, []);

  const handleDayChange = useCallback((value: DayValue) => {
    setDay(value);
  }, []);

  const handleDateRangeChange = useCallback((date: DateRange) => {
    setDateRange(date);
  },[]);

      // Helper function to format existing arrangements
  const formatExistingArrangements = (existing: string) => {
    const arrangements = existing.split(', ');
    return arrangements.map(formatArrangement).join(', ');
  };

  // Helper function to format a single arrangement
  const formatArrangement = (arrangement: string) => {
    switch (arrangement) {
      case 'FD':
        return 'Full Day';
      case 'AM':
        return 'Half Day (AM)';
      case 'PM':
        return 'Half Day (PM)';
      default:
        return arrangement;
    }
  };

  // Helper function to format day from int
  const formatDay = (day: number) => {
    switch (day) {
      case (1):
        return 'Monday';
      case (2):
        return 'Tuesday';
      case (3):
        return 'Wednesday';
      case (4):
        return 'Thursday';
      case (5):
        return 'Friday';          
      case (6):
        return 'Saturday';    
      case (7):
        return 'Sunday';                  
    }
  };  

  const handleRecurringSubmit = useCallback(async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const submitData: SubmitRecurringData = {
      staffid: staffid,
      startdate: dateRange.start,
      enddate: dateRange.end,
      arrangement: selectedArrangement,
      day: day,
      reason: reason,
    }

    try {
      const response = await axios.post("http://127.0.0.1:8085/api/recurringRequest", submitData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Successful submission
      await Swal.fire({
        title: 'Request Submitted',
        html: `
          <p>Awaiting approval from your Reporting Manager</p>
          <br>
          <p><u><strong>Details</strong></u></p>
          <br>
          <div style="display: flex; justify-content: center;">
            <div style="text-align: left; display: inline-block;">
              <p>Selected Day: ${formatDay(response.data.day)}</p>
              <p>Start Date: ${response.data.startDate}</p>
              <p>End Date: ${response.data.endDate}</p> 
              <p>Arrangement: ${formatArrangement(response.data.arrangement)}</p>                                       
              <p>Reason: ${response.data.reason}</p>
              <p>Reporting Manager: ${response.data.reportingManager}</p>
            </div>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // Reset form fields
      setDateRange({start: '', end: ''});
      setDay(0);
      setArrangement("");
      setReason("");       

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        const responseData = axiosError.response?.data;
        const status = axiosError.response?.status;
        
        let title = 'Request Rejected';
        let message = responseData.message || 'An error occurred while processing your request';


        await Swal.fire({
          title: title,
          html: `
            <p>${message}</p>
            <br>
            <p><u><strong>Details</strong></u></p>
            <br>
            <div style="display: flex; justify-content: center;">
              <div style="text-align: left; display: inline-block;">
                <p>Selected Day: ${formatDay(responseData.day)}</p>
                <p>Start Date: ${responseData.startDate}</p>
                <p>End Date: ${responseData.endDate}</p> 
                <p>Arrangement: ${formatArrangement(responseData.arrangement)}</p>                                       
                <p>Reason: ${responseData.reason}</p>
              </div>
            </div>
          `,
          icon: 'error',
          confirmButtonText: 'OK'
        });
        
        // Reset form fields
        setDateRange({start: '', end: ''});
        setDay(0);
        setArrangement("");
        setReason("");       
      } else {
        console.error("Error in API call:", error);
        await Swal.fire({
          title: 'Request Rejected',
          text: "An unexpected error occurred. Please try again.",
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  }, [staffid, dateRange, selectedArrangement, day, reason]);

  const handleSubmit = useCallback(async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const submitData: SubmitData = {
      staffid: staffid,
      date: selectedDate,
      arrangement: selectedArrangement,
      reason: reason,
    };

    try {
      const response = await axios.post("http://127.0.0.1:8085/api/request", submitData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Successful submission
      await Swal.fire({
        title: 'Request Submitted',
        html: `
          <p>Awaiting approval from your reporting manager</p>
          <br>
          <p><u><strong>Details</strong></u></p>
          <br>
          <div style="display: flex; justify-content: center;">
            <div style="text-align: left; display: inline-block;">
              <p>Date: ${response.data.date}</p>
              <p>Arrangement: ${formatArrangement(response.data.arrangement)}</p>                                       
              <p>Reason: ${response.data.reason}</p>
              <p>Reporting Manager: ${response.data.reportingManager}</p>
            </div>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      // Reset form fields
      setSelectedDate("");
      setArrangement("");
      setReason("");

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        const responseData = axiosError.response?.data;
        const status = axiosError.response?.status;

        let title = 'Request Rejected';
        let message = '';

        if (status === 400) {
          if ((responseData.existing === "AM" || responseData.existing === "PM") && responseData.requested === "FD") {
            message = `You can't apply for a full day request when a same-day request already exists`;
          } else if (responseData.existing === "FD" && responseData.requested !== "FD") {
            message = `You have already made a request for a Full Day WFH on ${responseData.date}`;
          } else if (responseData.two === true) {
            message = "You already have an AM and PM WFH request.\nNo need to apply for a full day arrangement";
          } else {
            message = `You already have a request for the same WFH arrangement on ${responseData.date}`;
          }
        } else {
          message = responseData.message || "An error occurred while processing your request.";
        }

        await Swal.fire({
          title: title,
          html: `
            <p>${message}</p>
            <br>
            <p><u><strong>Details</strong></u></p>
            <br>
            <div style="display: flex; justify-content: center;">
              <div style="text-align: left; display: inline-block;">
                <p>Date: ${responseData.date}</p>
                <p>Existing Arrangement: ${formatExistingArrangements(responseData.existing)}</p>
                <p>Requested Arrangement: ${formatArrangement(responseData.requested)}</p>                                       
              </div>
            </div>
          `,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      
        setArrangement("");
        setSelectedDate("");
        setReason("");
      } else {
        console.error("Error in API call:", error);
        await Swal.fire({
          title: 'Request Rejected',
          text: "An unexpected error occurred. Please try again.",
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  }, [staffid, selectedDate, selectedArrangement, reason]);

  

  return (
    <div className="container flex flex-col items-center px-4 sm:px-6 lg:px-8 mt-24 sm:mt-28">
      <div className="">
        <Display className="text-[50px] lg:text-[80px] leading-[60px] lg:leading-[95px] sm:ml-32 font-bold mb-8">
          Work-From-Home
        </Display>
      </div>
      <div className="w-full max-w-lg">
        <Tabs>
          <TabList>
            <Tab>Ad-Hoc</Tab>
            <Tab>Recurring</Tab>
          </TabList>

          <TabPanel>
            <div>
              <Body className="text-sm font-light text-primary mt-4">
                Select a date 
              </Body>
              <div className="mt-2">
                <Datecomponent
                  onDateChange={handleDateChange}
                  selectedDate={selectedDate}
                />
              </div>

              <Body className="text-sm font-light text-primary mt-8">
                Work Arrangement 
              </Body>
              <div className="mt-2">
                <Selection
                  onSelectionChange={handleArrangementChange}
                  selectedValue={selectedArrangement}
                />
              </div>

              <Body className="text-sm font-light text-primary mt-8">Reason</Body>
              <div className="mt-2">
                <Reason onReasonChange={handleReasonChange} reasonText={reason} />
              </div>

              <div className="flex items-center text-left bg-gray-50 border border-gray-300 text-primary text-sm font-light mt-4 h-8 px-2 py-3 rounded" role="alert">
                <svg className="fill-current w-4 h-3 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"/></svg>
                <p>All fields must be filled</p>
              </div>
              <div className="mt-4">
                <Submit onSubmit={handleSubmit} isDisabled={!isFormValid} />
              </div>
            </div>
          </TabPanel>

          <TabPanel>
            <div>
              <Body className="text-sm font-light text-primary mt-4">
                  Select a Start Date and End Date
              </Body>

              <div className="mt-2">
                <DateRangePickerComponent 
                  selectedDateRange={dateRange} 
                  onDateRangeChange={handleDateRangeChange}
                />
              </div>

              <Body className="text-sm font-light text-primary mt-8">
                Select a day 
              </Body>

              <div className ="mt-2">
                <Daypicker selectedDay ={day} onDayChange={handleDayChange}/>
              </div>

              <Body className="text-sm font-light text-primary mt-8">
                Work Arrangement 
              </Body>

              <div className="mt-2">
                <Selection
                  onSelectionChange={handleArrangementChange}
                  selectedValue={selectedArrangement}
                />
              </div>

              <Body className="text-sm font-light text-primary mt-8">Reason</Body>

              <div className="mt-2">
                <Reason onReasonChange={handleReasonChange} reasonText={reason} />
              </div>

              <div className="flex items-center text-left bg-gray-50 border border-gray-300 text-primary text-sm font-light mt-4 h-8 px-2 py-3 rounded" role="alert">
                <svg className="fill-current w-4 h-3 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"/></svg>
                <p>All fields must be filled</p>
              </div>

              <div className="mt-4">
                <Submit onSubmit={handleRecurringSubmit} isDisabled={!isRecurringFormValid} />
              </div>

            </div>

          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export { Apply };