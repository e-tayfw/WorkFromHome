import React, { useState } from "react";
import { Apply } from "@/components/apply";

interface SubmitData {
  user: number;
  date: string;
  arrangement: string;
  reason: string;
}

const ApplyPage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [submittedData, setSubmittedData] = useState<SubmitData | null>(null); // Define proper type for submitted data

  const handleSubmitData = (data: SubmitData) => {
    setSubmittedData(data);
    console.log("Retrieve Data:", data);
  };

  return (
    <div>
      <Apply onSubmitData={handleSubmitData} />
    </div>
  );
};

export default ApplyPage;