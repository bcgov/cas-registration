"use client";

import { WidgetProps } from "@rjsf/utils/lib/types";
import * as React from "react";
import { styled } from "@mui/material/styles";
import Switch, { SwitchProps } from "@mui/material/Switch";
import { V_DARK_GREY_BG_COLOR } from "@bciers/styles/colors";

/**
 * Helper to safely embed text in an SVG data URL
 */
const textSvg = (text: string) =>
  `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='16px' width='24px'><text x='0' y='15' fill='white' font-family='Arial, Helvetica, sans-serif' font-size='12'>${text}</text></svg>")`;

const thumbWidth = 28;

interface StyledSwitchProps extends SwitchProps {
  trueLabel?: string;
  falseLabel?: string;
}

const StyledSwitch = styled(
  ({ trueLabel, falseLabel, ...props }: StyledSwitchProps) => (
    <Switch
      focusVisibleClassName=".Mui-focusVisible"
      disableRipple
      {...props}
    />
  ),
)(({ theme, trueLabel = "Yes", falseLabel = "No" }) => ({
  width: 64,
  height: 32,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(32px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: 0,
        "&::after": {
          backgroundImage: textSvg(trueLabel),
          left: 6,
          width: "auto",
          height: 16,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
        },
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: theme.palette.primary.main,
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.secondary.main,
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: thumbWidth,
    height: 28,
  },
  "& .MuiSwitch-track": {
    borderRadius: 32 / 2,
    backgroundColor: V_DARK_GREY_BG_COLOR,
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    "&::before, &::after": {
      content: '""',
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      width: "auto",
      display: "flex",
      height: 16,
      alignItems: "center",
    },
    "&::after": {
      backgroundImage: textSvg(falseLabel),
      left: 6,
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
    },
  },
}));

const SwitchContainer = styled("div")({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
});

const SwitchLabel = styled("span")({
  position: "absolute",
  zIndex: 1,
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: 12,
  color: "white",
  pointerEvents: "none",
  whiteSpace: "nowrap",
});

function measureTextWidth(text: string, font = "12px Arial") {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;
  ctx.font = font;
  return ctx.measureText(text).width;
}

const ToggleWidget: React.FC<
  WidgetProps & { trueLabel?: string; falseLabel?: string }
> = ({
  disabled,
  id,
  onChange,
  value,
  trueLabel = "Yes",
  falseLabel = "No",
}) => {
  const leftWidth = measureTextWidth(falseLabel);
  const rightWidth = measureTextWidth(trueLabel);
  const maxLabelWidth = Math.max(leftWidth, rightWidth);
  const thumbSpace = thumbWidth + 20;
  const totalWidth = maxLabelWidth + thumbSpace;

  return (
    <SwitchContainer style={{ width: totalWidth }}>
      {/* left label (trueLabel) */}
      <SwitchLabel
        style={{
          left: 8,
          opacity: value ? 1 : 0, // hide when OFF
          transition: "opacity 200ms",
        }}
      >
        {trueLabel}
      </SwitchLabel>

      {/* right label (falseLabel) */}
      <SwitchLabel
        style={{
          right: 8,
          opacity: value ? 0 : 1, // hide when ON
          transition: "opacity 200ms",
        }}
      >
        {falseLabel}
      </SwitchLabel>

      <StyledSwitch
        id={id}
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        sx={{
          width: totalWidth,
          "& .MuiSwitch-switchBase.Mui-checked": {
            transform: `translateX(${totalWidth - thumbWidth - 4}px)`,
          },
        }}
      />
    </SwitchContainer>
  );
};

export default ToggleWidget;
