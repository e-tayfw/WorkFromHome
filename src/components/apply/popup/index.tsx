import React, { useEffect, useRef } from 'react';
import 'flowbite/dist/flowbite.min.css';
import { Modal } from 'flowbite';
import type { ModalOptions, ModalInterface } from 'flowbite';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalInstance = useRef<ModalInterface | null>(null);

  useEffect(() => {
    if (modalRef.current) {
      const options: ModalOptions = {
        placement: 'center',
        backdrop: 'static',
        backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
        closable: true,
        onHide: () => {
          onClose();
        },
      };

      modalInstance.current = new Modal(modalRef.current, options);
    }

    return () => {
      if (modalInstance.current) {
        modalInstance.current.destroy();
      }
    };
  }, [onClose]);

  useEffect(() => {
    if (modalInstance.current) {
      if (isOpen) {
        modalInstance.current.show();
      } else {
        modalInstance.current.hide();
      }
    }
  }, [isOpen]);

  return (
    <div id="flowbite-modal" tabIndex={-1} aria-hidden="true" ref={modalRef} className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={onClose}
            >
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div className="p-4 md:p-5 space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Popup };