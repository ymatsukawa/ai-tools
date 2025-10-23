import { useState, useCallback } from 'react';

interface ModalState {
  isOpen: boolean;
  message: string;
}

export const useModal = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    message: ''
  });

  const showModal = useCallback((message: string) => {
    setModalState({ isOpen: true, message });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, message: '' });
  }, []);

  return {
    modalState,
    showModal,
    closeModal,
  };
};
