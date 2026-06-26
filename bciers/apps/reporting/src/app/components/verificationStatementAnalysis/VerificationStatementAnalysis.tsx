"use client";

import { Fragment, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";

interface Criterion {
  code: string;
  question: string;
  answer: string;
  note?: string | null;
}

const TOTAL_CRITERIA = 8;

export default function VerificationStatementAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [parseable, setParseable] = useState<boolean | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setErrorMsg(null);
    setCriteria([]);
    setParseable(null);
    setReason(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "/reporting/api/verification-statement-analysis-stream",
        { method: "POST", body: formData },
      );

      if (!response.ok || !response.body) {
        setErrorMsg(`Server error (${response.status}). Please try again.`);
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop()!;
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);
          if (event.type === "error") {
            setParseable(false);
            setReason(event.reason);
          } else if (event.type === "criterion") {
            setCriteria((prev) => [
              ...prev,
              {
                code: event.code,
                question: event.question,
                answer: event.answer,
                note: event.note,
              },
            ]);
          }
        }
      }
    } catch {
      setErrorMsg(
        "Failed to connect to the analysis service. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const skeletonsToShow =
    loading && parseable !== false ? TOTAL_CRITERIA - criteria.length : 0;

  return (
    <Box sx={{ width: "100%", maxWidth: 900 }}>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
        Verification Statement Analysis
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Button variant="outlined" component="label" disabled={loading}>
          Choose PDF
          <input
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setCriteria([]);
              setParseable(null);
              setErrorMsg(null);
            }}
          />
        </Button>

        {file && (
          <Typography variant="body2" color="text.secondary">
            {file.name}
          </Typography>
        )}

        <Button
          variant="contained"
          onClick={handleAnalyze}
          disabled={!file || loading}
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          {loading ? "Analyzing…" : "Analyze"}
        </Button>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {parseable === false && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {reason ??
            "This file could not be analyzed automatically; manual review is needed."}
        </Alert>
      )}

      {(criteria.length > 0 || skeletonsToShow > 0) && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {criteria.map((c) => (
            <CriterionCard key={c.code} criterion={c} />
          ))}
          {Array.from({ length: skeletonsToShow }).map((_, i) => (
            <CriterionSkeleton key={`sk-${i}`} />
          ))}
        </Box>
      )}
    </Box>
  );
}

// Parse "Label: Value" lines into structured rows. Lines without a colon in the
// first 55 characters are treated as plain content rows (e.g. V8/V10 raw findings).
function parseAnswer(answer: string): Array<{ label: string | null; value: string }> {
  return answer.split("\n").flatMap((line): Array<{ label: string | null; value: string }> => {
    if (!line.trim()) return [];
    const colonIdx = line.indexOf(": ");
    if (colonIdx > 0 && colonIdx < 55) {
      return [{ label: line.slice(0, colonIdx), value: line.slice(colonIdx + 2) }];
    }
    return [{ label: null, value: line }];
  });
}

function AnswerDisplay({ answer }: { answer: string }) {
  const rows = parseAnswer(answer);
  const hasLabels = rows.some((r) => r.label !== null);

  if (!hasLabels) {
    // Plain multi-line content (V8 findings, V10 appendix rows, simple one-liners)
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {rows.map((r, i) => (
          <Typography key={i} variant="body1">
            {r.value}
          </Typography>
        ))}
      </Box>
    );
  }

  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        display: "grid",
        gridTemplateColumns: "max-content 1fr",
        rowGap: 1,
        columnGap: 3,
        alignItems: "baseline",
      }}
    >
      {rows.map((r, i) =>
        r.label !== null ? (
          <Fragment key={i}>
            <Typography
              component="dt"
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "text.secondary",
                whiteSpace: "nowrap",
              }}
            >
              {r.label}
            </Typography>
            <Typography component="dd" variant="body1" sx={{ m: 0 }}>
              {r.value}
            </Typography>
          </Fragment>
        ) : (
          // Non-keyed plain row (e.g. "Missing: ..." summary line)
          <Typography
            key={i}
            variant="body2"
            sx={{ gridColumn: "1 / -1", color: "text.secondary", mt: 0.5 }}
          >
            {r.value}
          </Typography>
        ),
      )}
    </Box>
  );
}

function CriterionCard({ criterion: c }: { criterion: Criterion }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 3, animation: "fadeSlideIn 0.25s ease-out" }}
      data-testid={`criterion-${c.code}`}
    >
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Box
        sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}
      >
        <Chip
          label={c.code}
          size="small"
          color="primary"
          sx={{ fontWeight: 700, mt: 0.3, flexShrink: 0 }}
        />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
          {c.question}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: c.note ? 2 : 0 }}>
        <AnswerDisplay answer={c.answer} />
      </Box>

      {c.note && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "grey.300",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Note: {c.note}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

function CriterionSkeleton() {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Skeleton variant="rounded" width={40} height={24} />
        <Skeleton variant="text" width="60%" height={24} />
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="50%" />
    </Paper>
  );
}
