// src/components/common/Input.js
import React from "react";
import styled, { css } from "styled-components";

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  width: 100%;
`;

const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textDark};
  margin-bottom: ${({ theme }) => theme.spacing[1.5]};
`;

const StyledInput = styled.input`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.surfaceLight};
  border: 1px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[2.5]}
    ${({ theme }) => theme.spacing[3]}; // Matched button padding for consistency
  font-size: ${({ theme }) => theme.fontSizes.base};
  transition: border-color ${({ theme }) => theme.transitions.short},
    box-shadow ${({ theme }) => theme.transitions.short};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLighter};
    opacity: 1;
  }

  &:focus,
  &:focus-visible {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 2px
      ${({ theme, $hasError }) =>
        $hasError ? theme.colors.error : theme.colors.primary}33;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
    opacity: 0.7;
  }

  ${({ type }) =>
    type === "date" &&
    css`
      /* Specific styles for date input if needed to ensure consistency */
      /* May need to style the calendar picker icon if possible/desired */
      min-height: calc(
        ${({ theme }) => theme.spacing[2.5]} * 2 +
          ${({ theme }) => theme.fontSizes.base} * 1.6
      ); // approx height of text input
    `}
`;

const StyledTextarea = styled(StyledInput).attrs({ as: "textarea" })`
  min-height: 100px;
  resize: vertical;
`;

const StyledSelect = styled(StyledInput).attrs({ as: "select" })`
  appearance: none; // Remove default system appearance
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23${({
    theme,
  }) =>
    theme.colors.textLighter.substring(
      1
    )}%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right ${({ theme }) => theme.spacing[3]} center;
  background-size: 0.65em auto;
  padding-right: ${({ theme }) => theme.spacing[8]}; /* Make space for arrow */
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: ${({ theme }) => theme.spacing[1.5]};
  margin-bottom: 0; /* Remove default p margin if it's the last element in FormGroup */
`;

const Input = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  disabled,
  name,
  required,
  children,
  ...props
}) => {
  const InputComponent =
    type === "textarea"
      ? StyledTextarea
      : type === "select"
      ? StyledSelect
      : StyledInput;

  return (
    <FormGroup>
      {label && (
        <Label htmlFor={id || name}>
          {label} {required && "*"}
        </Label>
      )}
      <InputComponent
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        hasError={!!error}
        required={required}
        {...props}
      >
        {type === "select" ? children : null}
      </InputComponent>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FormGroup>
  );
};

export default Input;
