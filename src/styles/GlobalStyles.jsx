// src/styles/GlobalStyles.js
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px; 
    scroll-behavior: smooth;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.main};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.6;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  #root {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.headings};
    color: ${({ theme }) => theme.colors.primaryLight};
    margin-bottom: ${({ theme }) => theme.spacing["3"]};
    line-height: 1.3;
    font-weight: 600;
  }

  h1 { font-size: ${({ theme }) => theme.fontSizes["4xl"]}; }
  h2 { font-size: ${({ theme }) => theme.fontSizes["3xl"]}; }
  h3 { font-size: ${({ theme }) => theme.fontSizes["2xl"]}; }
  h4 { font-size: ${({ theme }) => theme.fontSizes.xl}; }
  p {
    margin-bottom: ${({ theme }) => theme.spacing["4"]};
    color: ${({ theme }) => theme.colors.textDark};
  }

  a {
    color: ${({ theme }) => theme.colors.primaryLight};
    text-decoration: none;
    transition: ${({ theme }) => theme.transitions.short};

    &:hover {
      color: ${({ theme }) => theme.colors.primary};
      text-decoration: underline;
    }
  }

  button,
  input,
  select,
  textarea {
    font-family: inherit;
    font-size: ${({ theme }) => theme.fontSizes.base};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) =>
  theme.spacing[3]};
    background-color: ${({ theme }) => theme.colors.surfaceLight};
    color: ${({ theme }) => theme.colors.text};
    transition: border-color ${({ theme }) =>
      theme.transitions.short}, box-shadow ${({ theme }) =>
  theme.transitions.short};

    &::placeholder {
      color: ${({ theme }) => theme.colors.textLighter};
      opacity: 1;
    }

    &:focus, &:focus-visible {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
    }
  }
  
  button {
    cursor: pointer;
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    border: none;
    font-weight: 500; // Medium weight for buttons
    padding: ${({ theme }) => theme.spacing["2.5"]} ${({ theme }) =>
  theme.spacing["4"]}; // Slightly more padding

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primaryHover};
    }

    &:disabled {
      background-color: ${({ theme }) => theme.colors.disabled};
      color: ${({ theme }) => theme.colors.disabledText};
      cursor: not-allowed;
    }
  }

  img, video {
    max-width: 100%;
    height: auto;
    display: block;
  }

  ul, ol {
    list-style: none;
  }

  .container { /* Replicates Tailwind's container mx-auto for max-width */
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: ${({ theme }) => theme.spacing["4"]};
    padding-right: ${({ theme }) => theme.spacing["4"]};
    @media (min-width: ${({ theme }) => theme.breakpoints.sm}) { max-width: ${({
  theme,
}) => theme.breakpoints.sm}; }
    @media (min-width: ${({ theme }) => theme.breakpoints.md}) { max-width: ${({
  theme,
}) => theme.breakpoints.md}; }
    @media (min-width: ${({ theme }) => theme.breakpoints.lg}) { max-width: ${({
  theme,
}) => theme.breakpoints.lg}; }
    @media (min-width: ${({ theme }) => theme.breakpoints.xl}) { max-width: ${({
  theme,
}) => theme.breakpoints.xl}; }
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
`;

export default GlobalStyles;
