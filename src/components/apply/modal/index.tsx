import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-20 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 z-50">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="mb-6">
          {children}
        </div>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 !bg-primary text-white hover:ring-2 hover:ring-primary hover:text-primary hover:!bg-background rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export { Modal };