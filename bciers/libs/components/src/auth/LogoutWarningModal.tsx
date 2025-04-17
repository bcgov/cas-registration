"use client";
import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export interface LogoutWarningModalProps {
  initialTimeLeft: number;
  onExtendSession: () => Promise<void>;
  onLogout: () => Promise<void>;
  showModal: boolean;
}

const LogoutWarningModal: React.FC<LogoutWarningModalProps> = ({
  initialTimeLeft,
  onExtendSession,
  onLogout,
  showModal,
}) => {
  const [countdown, setCountdown] = useState(Math.floor(initialTimeLeft));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout(); // Auto-logout when countdown reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onLogout]);

  // Convert seconds to MM:SS format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <Dialog
      id="session-expiry-modal"
      open={showModal}
      closeAfterTransition
      aria-labelledby="Session Expiring Soon"
      maxWidth="sm"
    >
      <DialogTitle className="bg-bc-bg-blue text-white p-5 flex text-lg font-bold">
        You will be logged out soon
      </DialogTitle>
      <DialogContent className="mt-5">
        <Typography>
          For your security, you will be automatically logged out if you are
          inactive for more than thirty minutes. Any unsaved changes will be
          lost.
        </Typography>
        <Typography className="mt-3">
          You will be logged out in{" "}
          <Typography component="span">{formatTime(countdown)}</Typography>
        </Typography>
        <Box className="flex justify-start gap-2 mt-4">
          <Button
            aria-label="Log out"
            variant="outlined"
            color="primary"
            onClick={onLogout}
          >
            Log Out
          </Button>
          <Button variant="contained" color="primary" onClick={onExtendSession}>
            Stay Logged In
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutWarningModal;
