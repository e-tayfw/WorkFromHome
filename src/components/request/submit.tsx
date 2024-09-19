import React, { useEffect } from 'react';
import 'flowbite/dist/flowbite.min.css';
import type { Config } from "tailwindcss";

const Submit = () =>{
    return( 
        <button type="button" 
                className="text-white
                         !bg-primary
                           focus:outline-none 
                           focus:ring-4 
                           focus:ring-blue-300 
                           font-medium 
                           rounded-full 
                           text-sm 
                           px-5 
                           py-2.5 
                           text-center 
                           me-2 
                           mb-2">
                            Submit
                           </button>

    );
};
export default Submit;