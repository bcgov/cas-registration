"use client";

import { useState } from "react";
import { Box, Button } from "@mui/material";
import Modal from "@bciers/components/modal/Modal";
import React from "react";

const ChangeRegistrationPurposeModal = () => {
  const [modalState, setModalState] = useState("" as string);

  const resetFormData = () => {
    return;
  };

  const handleCloseModal = () => {
    setModalState("");
  };
  const handleConfirmChange = () => {
    resetFormData();
    setModalState("");
    return;
  };

  return (
    <Box>
      <Modal
        title="Confirmation"
        open={Boolean(modalState)}
        onClose={handleCloseModal}
      >
        <Box
          sx={{
            fontSize: "20px",
            minWidth: "100%",
            margin: "8px 0",
          }}
        >
          Are you sure you want to change your registration purpose? If you
          proceed, all of the form data you have entered will be lost.
        </Box>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "24px",
          }}
        >
          <Button
            onClick={handleCloseModal}
            color="secondary"
            variant="contained"
            aria-label="Cancel"
            sx={{ marginRight: "12px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmChange}
            color="primary"
            variant="contained"
            aria-label="Confirm"
          >
            Change registration purpose
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default ChangeRegistrationPurposeModal;
