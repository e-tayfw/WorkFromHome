import React, { useState } from "react";
import { Apply } from "@/components/apply";
import { Popup } from "@/components/apply/popup";
import axios from 'axios'

interface SubmitData {
  staffid: number;
  date: string;
  arrangement: string;
  reason: string;
}

interface SubmitResponse {
  success: boolean;
  message: string;
}

const ApplyPage: React.FC = () => {
  const [submittedData, setSubmittedData] = useState<SubmitData | null>(null);
  const [submitResponse, setSubmitResponse] = useState<SubmitResponse | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleSubmitData = async (data: SubmitData) => {
    setSubmittedData(data);
    console.log("Retrieve Data:", data);

    try {
      // Replace this with your actual API call
      const response = await simulateApiCall(data);
      setSubmitResponse(response);
      setIsPopupOpen(true);
    } catch (error) {
      setSubmitResponse({ success: false, message: "An error occurred" });
      setIsPopupOpen(true);
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  // Simulate API call (replace with actual API call)
  const simulateApiCall = async (data: SubmitData): Promise<SubmitResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Math.random() > 0.5 
      ? { success: true, message: "Application submitted successfully" }
      : { success: false, message: "Failed to submit application" };
  };

  return (
    <div>
      <Apply onSubmitData={handleSubmitData} />
      <Popup 
        isOpen={isPopupOpen}
        onClose={closePopup}
        title={submitResponse?.success ? "Success" : "Error"}
      >
        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
          {submitResponse?.message}
        </p>
        {submitResponse?.success && submittedData && (
          <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
            Your application for {submittedData.arrangement} on {submittedData.date} has been received.
          </p>
        )}
        <div className="flex items-center pt-4 mt-4 border-t border-gray-200 rounded-b dark:border-gray-600">
          <button 
            onClick={closePopup} 
            type="button" 
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Close
          </button>
        </div>
      </Popup>
    </div>
  );
};

export default ApplyPage;