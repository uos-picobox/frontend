// src/components/common/Button.js
import React from "react";
import styled, { css } from "styled-components";

const StyledButton = styled.button.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) => {
    // 커스텀 props는 DOM에 전달하지 않음
    const customProps = ["variant", "size", "fullWidth", "hasText"];
    if (customProps.includes(prop)) {
      return false;
    }
    // 기본 HTML 속성들은 전달 (defaultValidatorFn이 함수인 경우에만 사용)
    return typeof defaultValidatorFn === "function"
      ? defaultValidatorFn(prop)
      : true;
  },
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.fonts.main};
  font-weight: 500;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.short},
    border-color ${({ theme }) => theme.transitions.short},
    color ${({ theme }) => theme.transitions.short},
    opacity ${({ theme }) => theme.transitions.short};
  padding: ${({ theme, size }) => {
    if (size === "sm") return `${theme.spacing[1.5]} ${theme.spacing[3]}`; // Adjusted for smaller buttons
    if (size === "lg") return `${theme.spacing[3]} ${theme.spacing[6]}`;
    return `${theme.spacing[2.5]} ${theme.spacing[4]}`; // Default (medium)
  }};
  font-size: ${({ theme, size }) => {
    if (size === "sm") return theme.fontSizes.sm;
    if (size === "lg") return theme.fontSizes.lg;
    return theme.fontSizes.base;
  }};
  border: 1px solid transparent;
  line-height: 1.25; /* Ensure text aligns well with icons */

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px
      ${({ theme, variant }) => {
        if (variant === "primary" || variant === "secondary")
          return theme.colors[variant] + "55";
        return theme.colors.primary + "55";
      }};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.disabled};
    border-color: ${({ theme }) => theme.colors.disabled};
    color: ${({ theme }) => theme.colors.disabledText};
  }

  ${({ variant, theme }) => {
    switch (variant) {
      case "primary":
        return css`
          background-color: ${theme.colors.primary};
          color: ${theme.colors.white};
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primaryHover};
          }
        `;
      case "secondary":
        return css`
          background-color: ${theme.colors.secondary};
          color: ${theme.colors.white};
          &:hover:not(:disabled) {
            background-color: ${theme.colors.secondaryHover};
          }
        `;
      case "outline":
        return css`
          background-color: transparent;
          color: ${theme.colors.primaryLight};
          border-color: ${theme.colors.primaryLight};
          &:hover:not(:disabled) {
            background-color: ${theme.colors.primary +
            "22"}; /* Slight bg on hover */
            border-color: ${theme.colors.primary};
            color: ${theme.colors.primary};
          }
        `;
      case "danger":
        return css`
          background-color: ${theme.colors.error};
          color: ${theme.colors.white};
          &:hover:not(:disabled) {
            background-color: darken(${theme.colors.error}, 0.1);
          }
        `;
      case "text": // For icon buttons or simple text buttons
        return css`
          background-color: transparent;
          color: ${theme.colors.textLighter};
          padding: ${theme.spacing[1.5]}; /* Adjusted for icon buttons */
          border: none;
          &:hover:not(:disabled) {
            color: ${theme.colors.primaryLight};
            background-color: ${theme.colors.surfaceLight + "55"};
          }
        `;
      default: // Default to primary or a subtle button
        return css`
          background-color: ${theme.colors.surfaceLight};
          color: ${theme.colors.text};
          border-color: ${theme.colors.border};
          &:hover:not(:disabled) {
            background-color: ${theme.colors.border}; /* Darken surfaceLight */
          }
        `;
    }
  }}

  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}
  
  svg {
    margin-right: ${({ theme, hasText }) => (hasText ? theme.spacing[2] : "0")};
    width: ${({ size }) =>
      size === "sm" ? "1em" : "1.25em"}; /* Adjust icon size with button size */
    height: ${({ size }) => (size === "sm" ? "1em" : "1.25em")};
  }
`;

const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  iconLeft,
  iconRight,
  onClick,
  disabled = false,
  type = "button",
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={onClick}
      disabled={disabled}
      type={type}
      hasText={!!children}
      {...props}
    >
      {iconLeft}
      {children}
      {iconRight}
    </StyledButton>
  );
};

export default Button;
