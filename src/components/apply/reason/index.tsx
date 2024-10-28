import React, { useState, useEffect, ChangeEvent } from "react";

interface ReasonProps {
  onReasonChange: (reason: string) => void;
  reasonText: string;
}

const Reason: React.FC<ReasonProps> = ({ onReasonChange, reasonText }) => {
  const [localReasonText, setLocalReasonText] = useState<string>(reasonText);

  useEffect(() => {
    setLocalReasonText(reasonText);
  }, [reasonText]);

  useEffect(() => {
    onReasonChange(localReasonText);
  }, [localReasonText, onReasonChange]);

  const handleReasonChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setLocalReasonText(event.target.value);
  };

  return (
    <div>
      <textarea
        id="message"
        rows={3}
        className="block p-2.5 w-full text-sm resize-none text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"
        placeholder="Give a reason for your request"
        value={localReasonText}
        onChange={handleReasonChange}
      />
    </div>
  );
};

export { Reason };
