import React, { useState } from "react";
import { Apply } from "@/components/apply";
import axios from 'axios'

const ApplyPage: React.FC = ({}) => {
  return (
    <div>
      <Apply onSubmitData />
    </div>
  );
};

export default ApplyPage;