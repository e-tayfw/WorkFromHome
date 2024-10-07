import React, { useState, useEffect, useCallback } from "react";
import { Datecomponent } from "@/components/apply/datepicker";
import { Selection } from "@/components/apply/selection";
import { Reason } from "@/components/apply/reason";
import { Submit } from "@/components/apply/submit";
import { H1, BodyLarge, Body, Display } from "@/components/TextStyles";
import Swal from 'sweetalert2';
import { useSelector } from "react-redux";
import axios from 'axios';
import { toast } from "react-toastify";

type ArrangementType = 'AM' | 'PM' | 'FD' | '';

interface SubmitData {
  staffid: number;
  date: string;
  arrangement: ArrangementType;
  reason: string;
}

const Apply: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [preferredArrangement, setPreferredArrangement] = useState<ArrangementType>("");
  const [reason, setReason] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const staffid = useSelector((state: any) => state.auth.staffId);

  useEffect(() => {
    setIsFormValid(
      selectedDate !== "" && preferredArrangement !== "" && reason.trim() !== ""
    );
  }, [selectedDate, preferredArrangement, reason]);

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleArrangementChange = useCallback((value: ArrangementType) => {
    setPreferredArrangement(value);
  }, []);

  const handleReasonChange = useCallback((text: string) => {
    setReason(text);
  }, []);

  const handleSubmit = useCallback(async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setIsLoading(true);

    const submitData: SubmitData = {
      staffid: staffid,
      date: selectedDate,
      arrangement: preferredArrangement,
      reason: reason,
    };

    try {
      const response = await axios.post("http://127.0.0.1:8085/api/request", submitData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        Swal.fire({
          title: 'Request Submitted',
          html: `
            <p>Awaiting approval from your Reporting Manager</p>
            <br>
            <p><u><strong>Details</strong></u></p>
            <br>
            <div style="display: flex; justify-content: center;">
              <div style="text-align: left; display: inline-block;">
                <p>Date: ${submitData.date}</p>
                <p>Arrangement: ${submitData.arrangement === "FD" ? "Work-From-Home (Full Day)" : 
                                  submitData.arrangement === "AM" ? "Work-From-Home (AM)" : "Work-From-Home (PM)"}</p>
                <p>Reason: ${submitData.reason}</p>
                <p>Reporting Manager: ${response.data.reportingManager}</p>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'OK'
        });

        
        // Reset form fields on success
        setSelectedDate("");
        setPreferredArrangement("");
        setReason("");
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error in API call:", error);
      Swal.fire({
        title: 'Request Rejected',
        text: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  }, [staffid, selectedDate, preferredArrangement, reason]);

  return (
    <div className="container flex flex-col items-center px-4 sm:px-6 lg:px-8 mt-24 sm:mt-28">
      <div className="">
        <Display className="text-[50px] lg:text-[80px] leading-[60px] lg:leading-[95px] sm:ml-32 font-bold mb-8">
          Work-From-Home
        </Display>
      </div>
      <div className="w-full max-w-lg">
        <div>
          <Body className="text-sm font-light text-primary">
            Select a date 
          </Body>
        </div>
        <div className="mt-2">
          <Datecomponent
            onDateChange={handleDateChange}
            selectedDate={selectedDate}
          />
        </div>

        <div className="mt-8">
          <Body className="text-sm font-light text-primary">
            Preferred Work Arrangement 
          </Body>
        </div>
        <div className="mt-2">
          <Selection
            onSelectionChange={handleArrangementChange}
            selectedValue={preferredArrangement}
          />
        </div>

        <div className="mt-8">
          <Body className="text-sm font-light text-primary">Reason</Body>
        </div>
        <div className="mt-2">
          <Reason onReasonChange={handleReasonChange} reasonText={reason} />
        </div>

        <div className="flex items-center text-left bg-gray-50 border border-gray-300 text-primary text-sm font-light mt-4 h-8 px-2 py-3 rounded" role="alert">
          <svg className="fill-current w-4 h-3 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"/></svg>
          <p>All fields must be filled</p>
        </div>

        <div className="mt-4">
          <Submit onSubmit={handleSubmit} isDisabled={!isFormValid || isLoading} />
        </div>
      </div>
    </div>
  );
};

export { Apply };