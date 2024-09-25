import React, { useState } from "react";
import { Apply } from "@/components/apply";

const ApplyPage = () => {
  const [submittedData, setSubmittedData] = useState(null);

  const handleSubmitData = (data) => {
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