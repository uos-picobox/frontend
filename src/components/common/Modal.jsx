// src/components/common/Modal.js
import React, { useEffect } from "react";
import styled from "styled-components";
import { X } from "lucide-react";
import Button from "./Button";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndices.modal};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  width: 90%;
  max-width: 500px;
  position: relative;
  transform: ${({ isOpen }) =>
    isOpen ? "translateY(0)" : "translateY(-20px)"};
  transition: transform 0.3s ease;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  padding-bottom: ${({ theme }) => theme.spacing[3]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.primaryLight};
  margin: 0;
`;

const CloseButton = styled(Button)`
  padding: ${({ theme }) =>
    theme.spacing[1]}; // Smaller padding for icon button
`;

const ModalBody = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[5]};
  color: ${({ theme }) => theme.colors.textDark};
  max-height: 60vh;
  overflow-y: auto;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const Modal = ({ isOpen, onClose, title, children, footerActions }) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen && typeof document === "undefined") return null; // Avoid SSR issues if not careful

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContent isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton
            variant="text"
            onClick={onClose}
            size="sm"
            aria-label="Close modal"
          >
            <X size={24} />
          </CloseButton>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        {footerActions && <ModalFooter>{footerActions}</ModalFooter>}
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;
