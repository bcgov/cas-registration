import { WidgetProps } from "@rjsf/utils/lib/types";
import * as React from "react";
import { styled } from "@mui/material/styles";
import Switch, { SwitchProps } from "@mui/material/Switch";

const StyledSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 54,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(28px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: 0,
        "&::after": {
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='16px' width='24px'><text x='0' y='15' fill='white' font-family='Arial, Helvetica, sans-serif' font-size='12'>Yes</text></svg>")`,
          left: 6,
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
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.secondary.dark,
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    "&::before, &::after": {
      content: '""',
      position: "absolute",
      top: "12px",
      transform: "translateY(-60%)",
      width: 24,
      height: 16,
    },
    "&::after": {
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='16px' width='24px'><text x='0' y='15' fill='white' font-family='Arial, Helvetica, sans-serif' font-size='12'>No</text></svg>")`,
      right: 2,
    },
  },
}));

const ToggleWidget: React.FC<WidgetProps> = ({
  disabled,
  id,
  onChange,
  value,
}) => {
  return (
    <StyledSwitch
      id={id}
      checked={value}
      onChange={(event: { target: { checked: boolean } }) =>
        onChange(event.target.checked)
      }
      disabled={disabled}
      sx={{
        ".MuiSwitch-track": {},
        "& .MuiSwitch-switchBase": {
          "&.Mui-checked": {
            "+ .MuiSwitch-track": {},
          },
        },
      }}
    />
  );
};

export default ToggleWidget;
