import React, { SVGProps } from "react";

export const EyeIcon = (props: SVGProps<never>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2" // Corrected to camelCase
      {...props}
    >
      <path
        strokeLinecap="round" // Corrected to camelCase
        strokeLinejoin="round" // Corrected to camelCase
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round" // Corrected to camelCase
        strokeLinejoin="round" // Corrected to camelCase
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
           -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
};
