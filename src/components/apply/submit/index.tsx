import React, { useEffect } from 'react';
import 'flowbite/dist/flowbite.min.css';

const Submit = () =>{
    return( 
        <button type="button" 
                className="text-white
                         !bg-primary

                           focus:ring-2
                           focus:ring-accent
                           font-medium 
                           rounded-full 
                           text-sm 
                           px-5 
                           py-2.5 
                           text-center 
                           w-full
                           sm:w-auto
                           me-2 
                           mb-2">
                            Submit
                           </button>

    );
};
export {Submit};