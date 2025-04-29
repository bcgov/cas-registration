import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InputRow } from "../../../app/components/compliance-summary/InputRow";
import React from "react";

type TextFieldProps = {
  name: string;
  value: string;
  onChange: (e: any) => void;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  InputProps?: {
    endAdornment?: React.ReactNode;
  };
  [key: string]: any;
};

type BoxProps = {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  label?: string;
};

vi.mock("@mui/material", async () => {
  const actual = await vi.importActual("@mui/material");
  return {
    ...actual,
    TextField: (props: TextFieldProps) => {
      const {
        name,
        value,
        onChange,
        error,
        helperText,
        placeholder,
        inputProps,
        InputProps,
        ...rest
      } = props;
      return (
        <div data-testid="mui-textfield">
          <input
            data-testid={`input-${name}`}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            {...inputProps}
            {...rest}
          />
          {error && <div data-testid="error-message">{helperText}</div>}
          {InputProps?.endAdornment && (
            <div data-testid="end-adornment">{InputProps.endAdornment}</div>
          )}
        </div>
      );
    },
    Box: (props: BoxProps) => {
      const { className, style, children, label } = props;
      return (
        <div className={className} style={style} data-testid="mui-box">
          {label && label}
          {children}
        </div>
      );
    },
  };
});

describe("InputRow Component", () => {
  const defaultProps = {
    name: "testInput",
    value: "test value",
    onChange: vi.fn(),
  };

  it("renders with basic props", () => {
    render(<InputRow {...defaultProps} />);

    const input = screen.getByTestId("input-testInput");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("test value");
  });

  it("displays label when provided", () => {
    render(<InputRow {...defaultProps} label="Test Label" />);

    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("handles input changes", () => {
    render(<InputRow {...defaultProps} />);

    const input = screen.getByTestId("input-testInput");
    fireEvent.change(input, { target: { value: "new value" } });

    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it("displays error state and helper text", () => {
    render(
      <InputRow
        {...defaultProps}
        error={true}
        helperText="This field is required"
      />,
    );

    expect(screen.getByTestId("error-message")).toHaveTextContent(
      "This field is required",
    );
  });

  it("renders with placeholder text", () => {
    render(<InputRow {...defaultProps} placeholder="Enter value here" />);

    const input = screen.getByTestId("input-testInput");
    expect(input).toHaveAttribute("placeholder", "Enter value here");
  });

  it("renders with end adornment", () => {
    render(<InputRow {...defaultProps} endAdornment={<span>icon</span>} />);

    expect(screen.getByTestId("end-adornment")).toHaveTextContent("icon");
  });

  it("applies custom class names", () => {
    render(<InputRow {...defaultProps} classNames="custom-class" />);

    const box = screen.getAllByTestId("mui-box")[0];
    expect(box.className).toContain("custom-class");
  });

  it("applies custom styles", () => {
    const customStyle = { marginTop: "10px" };
    render(<InputRow {...defaultProps} style={customStyle} />);

    const box = screen.getAllByTestId("mui-box")[0];
    expect(box).toHaveStyle("margin-top: 10px");
  });

  it("passes inputProps to TextField", () => {
    render(
      <InputRow
        {...defaultProps}
        inputProps={{
          maxLength: 10,
          "aria-label": "custom-input",
        }}
      />,
    );

    const input = screen.getByTestId("input-testInput");
    expect(input).toHaveAttribute("maxLength", "10");
    expect(input).toHaveAttribute("aria-label", "custom-input");
  });
});
