"use client";

import { Button } from "@mui/material";

const DeselectAllButton: React.FC = () => {
  const deselectAll = () => {
    const checkboxes: NodeListOf<HTMLInputElement> = document.querySelectorAll(
      "input[type=checkbox]",
    );

    if (!checkboxes?.length) return;

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        setTimeout(() => {
          // needs setTimeout for somereason or else individual clicks don't get registered
          checkbox.click();
        }, 1);
      }
    });
  };

  return (
    <Button id={"deselectButton"} onClick={deselectAll} variant="contained">
      Deselect All
    </Button>
  );
};

export default DeselectAllButton;
