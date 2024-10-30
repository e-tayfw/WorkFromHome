import React, { useState, useEffect, ChangeEvent } from "react";

interface ReasonProps {
  onReasonChange: (reason: string) => void;
  reasonText: string;
}

const Reason: React.FC<ReasonProps> = ({ onReasonChange, reasonText }) => {
  const [localReasonText, setLocalReasonText] = useState<string>(reasonText);
  const maxLength = 255;

  useEffect(() => {
    setLocalReasonText(reasonText);
  }, [reasonText]);

  useEffect(() => {
    onReasonChange(localReasonText);
  }, [localReasonText, onReasonChange]);

  const handleReasonChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const input = event.target.value;
    if (input.length <= maxLength) {
      setLocalReasonText(input);
    }
  };

  const getCounterColor = () => {
    if (localReasonText.length === maxLength) {
      return "text-red-500";
    }
    return "text-gray-500";
  };

  return (
    <div className="relative">
      <textarea
        id="message"
        rows={3}
        className="block p-2.5 w-full text-sm resize-none text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"
        placeholder="Give a reason for your request"
        value={localReasonText}
        onChange={handleReasonChange}
        maxLength={maxLength}
      />
      <div className={`absolute bottom-2 right-2 text-sm ${getCounterColor()}`}>
        {localReasonText.length}/{maxLength}
      </div>
    </div>
  );
};

export { Reason };

