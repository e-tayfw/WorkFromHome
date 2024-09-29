import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Datecomponent } from "@/components/apply/datepicker";
import { Selection } from "@/components/apply/selection";
import { Reason } from "@/components/apply/reason";
import { Submit } from "@/components/apply/submit";
import { Body } from "@/components/TextStyles";

type ArrangementType = 'AM' | 'PM' | 'FD' | '';

interface SubmitData {
  staffid: number;
  date: string;
  arrangement: ArrangementType;
  reason: string;
}

interface ApplyProps {
  onSubmitData: (data: SubmitData) => void;
}

const Apply: React.FC<ApplyProps> = ({ onSubmitData }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [preferredArrangement, setPreferredArrangement] = useState<ArrangementType>("");
  const [reason, setReason] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

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

  const handleSubmit = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    const submitData: SubmitData = {
      staffid: 140078,
      date: selectedDate,
      arrangement: preferredArrangement,
      reason: reason,
    };
    console.log("Send Data:", submitData);

    onSubmitData(submitData);

    // Reset form fields
    setSelectedDate("");
    setPreferredArrangement("");
    setReason("");
  }, [selectedDate, preferredArrangement, reason, onSubmitData]);

  return (
    <div className="flex justify-center items-start min-h-screen">
      <div className="flex flex-col max-w-lg w-full p-4 sm:max-w-md">
        <div>
          <Body className="text-sm font-light text-primary">
            Select a date *
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
            Preferred Work Arrangement *
          </Body>
        </div>
        <div className="mt-2 ml-2 ">
          <Selection
            onSelectionChange={handleArrangementChange}
            selectedValue={preferredArrangement}
          />
        </div>

        <div>
          <Body className="mt-8 text-sm font-light text-primary">Reason *</Body>
        </div>
        <div className="mt-2 ml-2">
          <Reason onReasonChange={handleReasonChange} reasonText={reason} />
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