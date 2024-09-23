import React, { useState, useEffect } from "react";
import { Datecomponent } from "@/components/apply/datepicker";
import { Selection } from "@/components/apply/selection";
import { Reason } from "@/components/apply/reason";
import { Submit } from "@/components/apply/submit";
import { Body } from "@/components/TextStyles";

const Apply = () => {
  // State to store form values
  const [selectedDate, setSelectedDate] = useState("");
  const [preferredArrangement, setPreferredArrangement] = useState("");
  const [reason, setReason] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  // Effect to check form validity
  useEffect(() => {
    setIsFormValid(
      selectedDate !== "" &&
      preferredArrangement !== "" &&
      reason.trim() !== ""
    );
  }, [selectedDate, preferredArrangement, reason]);

  // Handle the form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Date:", selectedDate);
    console.log("Preferred Arrangement:", preferredArrangement);
    console.log("Reason:", reason);

    // Reset form fields
    setSelectedDate("");
    setPreferredArrangement("");
    setReason("");
  };

  return (
    <div className="flex justify-center items-start min-h-screen">
      <div className="flex flex-col max-w-lg w-full p-4 sm:max-w-md">
        <div>
          <Body className="text-sm font-light text-primary">Select a date *</Body>
        </div>
        <div className="mt-2 ml-2">
          <Datecomponent onDateChange={setSelectedDate} selectedDate={selectedDate} />
        </div>

        <div>
          <Body className="mt-8 text-sm font-light text-primary">
            Preferred Work Arrangement *
          </Body>
        </div>
        <div className="mt-2 ml-2 ">
          <Selection onSelectionChange={setPreferredArrangement} selectedValue={preferredArrangement} />
        </div>

        <div>
          <Body className="mt-8 text-sm font-light text-primary">Reason *</Body>
        </div>
        <div className="mt-2 ml-2">
          <Reason onReasonChange={setReason} reasonText={reason} />
        </div>
        <div>
          <Body className="mt-4 ml-2 text-xs font-light text-primary">
            *All fields are to be filled before submitting
          </Body>
        </div>
        <div className="mt-4 ml-2">
          <Submit onSubmit={handleSubmit} isDisabled={!isFormValid} />
        </div>
      </div>
    </div>
  );
};

export { Apply };