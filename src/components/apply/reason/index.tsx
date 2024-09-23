import React, { useState, useEffect } from 'react';

const Reason = ({ onReasonChange, reasonText }) => {
    const [localReasonText, setLocalReasonText] = useState(reasonText);

    useEffect(() => {
        setLocalReasonText(reasonText);
    }, [reasonText]);

    useEffect(() => {
        onReasonChange(localReasonText);
    }, [localReasonText, onReasonChange]);
    
    const handleReasonChange = (event) => {
        setLocalReasonText(event.target.value);
    };

    return(
    <div>
        <textarea id="message" 
                  rows={3} 
                  className="block p-2.5 w-full text-sm resize-none text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"
                  placeholder="Give a reason for your request"
                  value={localReasonText}
                  onChange={handleReasonChange}>   
        </textarea>
    </div>
    );
};
export { Reason };