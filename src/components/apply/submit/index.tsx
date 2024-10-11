import React from 'react';

interface SubmitProps {
  onSubmit: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  isDisabled: boolean;
}

const Submit: React.FC<SubmitProps> = ({ onSubmit, isDisabled }) => {
    return( 
        <button 
            type="submit" 
            className={`text-white
                       ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : '!bg-primary hover:ring-2 hover:ring-primary hover:text-primary hover:!bg-background'}
                       font-medium 
                       rounded-full 
                       text-sm 
                       px-5 
                       py-2.5 
                       text-center 
                       w-full
                       sm:w-auto
                       me-2 
                       mb-2`}
            onClick={onSubmit}
            disabled={isDisabled}
        >
            Submit
        </button>
    );
};

export { Submit };