# 🤖 AI-Driven User Story & Technical Execution Generator

This document outlines the architecture, setup, and testing procedures for the automated system that bridges high-level business requirements and technical execution using architecture-aware AI (orchestrated with GitHub Actions, Repomix context harvesting, and Google Gemini API).

---

## 📖 Overview & Objectives

The goal of this pipeline is to eliminate manual translation overhead by instantly transforming raw business ideas into precise, architecture-aware user stories, BDD acceptance criteria, and technical execution checklists.

---

## 🏗️ Architecture Layers

1. **Intake (GitHub Issue Templates):**
   - Standardized markdown issue template located in `.github/ISSUE_TEMPLATE/ai-user-story-template.md` allows users to input raw requirements.
2. **Automation Pipeline (`.github/workflows/generate-user-story.yaml`):**
   - Triggered automatically when a new issue with the `AI User Story` label is opened.
   - Refreshes codebase context files, and invokes the user story generation script.
3. **Knowledge Baseline (Repomix Context Harvesting):**
   - Repomix bundles active repository code into self-documenting markdown files stored in `.docs/`.
   - Naming convention: `context-source-*.md`.
4. **AI Processing & Orchestration (`scripts/generate-user-story.js`):**
   - Powered by the `@google/genai` SDK using a strict "Expert Agile Product Manager & Senior Tech Lead" system instruction.
   - Implements robust model fallback chains (handling 503/429 transient errors with exponential backoff) and safety token slicing (`MAX_CONTEXT_LENGTH = 12000`).
5. **Hand-Off:**
   - The script uses the GitHub REST API to overwrite the originating issue's raw requirement with the finalized, structured markdown user story and technical execution checklist directly in the issue body.

---

## 🧪 Testing Procedures Without Merging

### Method 1: Direct Feature Branch Testing on GitHub

1. Push workflow files,and scripts.
2. Navigate to the repository on GitHub and switch the branch dropdown to this spike branch.
3. Click **AI User Story Generator**—the template picker modal will render the _ai-user-story-template_ template.
4. Submit a test issue to verify the GitHub Actions runner fires correctly against the branch code.

### Method 2: Local Terminal Simulation

To test prompt output and fallback logic locally without waiting for cloud runners:

```bash
# 1. Generate fresh local context snapshots
npm run context:all

# 2. Export test variables and execute the script
export GEMINI_API_KEY="your-actual-api-key"
export ISSUE_BODY="We need to update BCIERS to persist, track, and display FAA interest payments across database schemas and frontend invoices."

node scripts/generate-user-story.js

```
