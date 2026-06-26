"use client";

import { Alert, Button, TextField } from "@mui/material";
import postLlmChat from "@reporting/src/app/utils/postLlmChat";
import { useState } from "react";

interface Props {
  verificationStatementFilePath: string;
}

const SubmittedVerificationStatementSection: React.FC<Props> = ({
  verificationStatementFilePath,
}) => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileName = verificationStatementFilePath.split("/").pop();
  const fileUrl = `file://${verificationStatementFilePath}`;

  const handleSubmit = async () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setError("Enter a prompt before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const llmResponse = await postLlmChat(
        trimmedPrompt,
        verificationStatementFilePath,
      );

      if (typeof llmResponse === "object" && llmResponse?.error) {
        setError(llmResponse.error);
        setResponse("");
        return;
      }

      if (typeof llmResponse === "string") {
        setResponse(llmResponse);
      } else if (llmResponse === null || llmResponse === undefined) {
        setResponse("");
      } else {
        setResponse(JSON.stringify(llmResponse, null, 2));
      }
    } catch (_error) {
      setError(
        "The request did not complete. It may have timed out before the server returned a response.",
      );
      setResponse("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mb-6">
      <div className="w-full form-group field field-object form-heading-label flex items-center">
        <div className="form-heading text-xl font-bold">
          Verification Statement
        </div>
      </div>
      <div className="flex flex-col gap-4 max-w-4xl">
        <TextField
          fullWidth
          label="Prompt"
          multiline
          minRows={4}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          disabled={isSubmitting}
        />
        <div>
          <Button
            variant="outlined"
            component="a"
            href={fileUrl}
            download={fileName}
            sx={{ mr: 2 }}
          >
            Download Verification Statement PDF
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
        <TextField
          fullWidth
          label="Attached file"
          value={verificationStatementFilePath}
          InputProps={{ readOnly: true }}
        />
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          fullWidth
          label="Response"
          multiline
          minRows={6}
          value={response}
          InputProps={{ readOnly: true }}
        />
        <Alert
          fullWidth
          severity="warning"
          >
            <i>Disclaimer</i>: AI results are non-deterministic — results may vary. Verify and don't trust.
        </Alert>
      </div>
    </section>
  );
};

export default SubmittedVerificationStatementSection;
