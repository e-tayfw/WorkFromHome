import React, { useState, useEffect, useCallback } from "react";
import { Datecomponent } from "@/components/apply/datepicker";
import { Selection } from "@/components/apply/selection";
import { Reason } from "@/components/apply/reason";
import { Submit } from "@/components/apply/submit";
import { Modal } from "@/components/apply/modal";
import { H1, BodyLarge, Body, Display } from "@/components/TextStyles";
import Swal from 'sweetalert2';
import { useSelector } from "react-redux";

type ArrangementType = 'AM' | 'PM' | 'FD' | '';

interface SubmitData {
  staffid: number;
  date: string;
  arrangement: ArrangementType;
  reason: string;
}

const Apply: React.FC = ({}) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [preferredArrangement, setPreferredArrangement] = useState<ArrangementType>("");
  const [reason, setReason] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<SubmitData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<{ success: boolean; message: string } | null>(null);
  const staffid = useSelector((state:any) => state.auth.staffId);

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

  //remove later
  const simulateApiCall = (data: SubmitData): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate a 70% success rate
        if (Math.random() < 0.7) {
          resolve({ success: true, message: "Application submitted successfully!" });
        } else {
          resolve({ success: false, message: "Failed to submit application. Please try again." });
        }
      }, 2000); // Two second API call
    });
  };

  const handleSubmit = useCallback(async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    setIsLoading(true);
    setApiResponse(null);


    const submitData: SubmitData = {
      staffid: staffid,
      date: selectedDate,
      arrangement: preferredArrangement,
      reason: reason,
    };

    try {

      //remove later
      const response = await simulateApiCall(submitData);

      /*
      const createRequest = async() => {
        try {
          const response = await axios.post("http://127.0.0.1:8085/api/request", submitData, {
            headers:{
              'Content-Type' : 'application/json',
            }
          });
          console.log(response.data);

          setApiResponse({
              success: response.data.success,
              message: response.data.message
            });
          
          setSubmittedData(submitData);
          
          // Reset form fields on success
          if (response.data.success) {
            setSelectedDate("");
            setPreferredArrangement("");
            setReason("");
          } 
          // Show the modal after the API call completes
          setIsModalOpen(true);

        } catch(e) {
          console.error("Error in API call:", e);
          setApiResponse({ success: false, message: "An unexpected error occurred. Please try again." });
        
        } finally {
          setIsLoading(false);
        }

        await createRequest();

      */
      
      //remove later
      setApiResponse(response);
      

      ////////////////////////////////remove later
      //if (apiResponse.success){
      if (response.success) {
        setSubmittedData(submitData);

      // Reset form fields on success
        setSelectedDate("");
        setPreferredArrangement("");
        setReason("");

      }
      console.log(submitData)

      // Show the modal after the API call completes
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error in simulated API call:", err);
      setApiResponse({ success: false, message: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, preferredArrangement, reason]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="container flex justify-center items-start sm:mt-28 mt-24">
      <div className="flex flex-col max-w-lg p-4 sm:max-w-md">
            <div className="text-[50px] lg:text-[55px] leading-[60px] lg:leading-[80px] font-bold lg:mb-0 mb-4">
                <p>Work-From-Home</p>
            </div>
        <div>
          <Body className="text-sm font-light text-primary">
            Select a date 
          </Body>
        </div>
        <div className="mt-2 ml-2">
          <Datecomponent
            onDateChange={handleDateChange}
            selectedDate={selectedDate}
          />
        </div>

        <div>
          <Body className="mt-8 text-sm font-light text-primary">
            Preferred Work Arrangement 
          </Body>
        </div>
        <div className="mt-2 ml-2 ">
          <Selection
            onSelectionChange={handleArrangementChange}
            selectedValue={preferredArrangement}
          />
        </div>

        <div>
          <Body className="mt-8 text-sm font-light text-primary">Reason</Body>
        </div>
        <div className="mt-2 ml-2">
          <Reason onReasonChange={handleReasonChange} reasonText={reason} />
        </div>

        <div className="flex items-center text-left bg-gray-50 border border-gray-300 text-primary text-sm font-light mt-4 ml-2 h-8 px-2 py-3 rounded" role="alert">
          <svg className="fill-current w-4 h-3 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"/></svg>
          <p>All fields must be filled</p>
        </div>

        <div className="mt-4 ml-2">
          <Submit onSubmit={handleSubmit} isDisabled={!isFormValid || isLoading} />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={apiResponse?.success ? "Request Submitted" : "Request Rejected"}>
        {apiResponse && submittedData && (
          <div>
            {apiResponse.success == true && submittedData && (
              <div className="mt-4 text-left">
                <Body className="">Awaiting approval from your Reporting Manager</Body>
                <Body className="font-semibold mt-2 mb-2">Details:</Body>
                <Body>Date: {submittedData.date}</Body>
                <Body>Arrangement: {submittedData.arrangement == "FD" ? "Work-From-Home (Full Day)" : submittedData.arrangement == "AM" ? "Work-From-Home (AM)" : "Work-From-Home (PM)"}</Body>
                <Body>Reason: {submittedData.reason}</Body>
              </div>
            )}
            {apiResponse.success == false && submittedData && (
              <div className="mt-4 text-left">
                <Body className="">A request for the same date already exists</Body>
                <Body className="font-semibold mt-2 mb-2">Details:</Body>
                <Body>Date: {submittedData.date}</Body>
                <Body>Arrangement: {submittedData.arrangement == "FD" ? "Work-From-Home (Full Day)" : submittedData.arrangement == "AM" ? "Work-From-Home (AM)" : "Work-From-Home (PM)"}</Body>
                <Body>Reason: {submittedData.reason}</Body>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export { Apply };