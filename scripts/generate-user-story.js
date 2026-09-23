import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Iterates through an array of models, attempting retries with exponential backoff
 * before falling back to the next model in the chain.
 */
async function generateWithModelFallbackArray(
  basePayload,
  modelsArray = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
  ],
  maxRetriesPerModel = 3
) {
  for (const model of modelsArray) {
    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        console.log(
          `Trying model: [${model}] (Attempt ${attempt}/${maxRetriesPerModel})`
        );
        return await ai.models.generateContent({
          ...basePayload,
          model: model,
        });
      } catch (error) {
        const isTransient = error.status === 503 || error.status === 429;

        if (isTransient && attempt < maxRetriesPerModel) {
          const delay = attempt * 5000;
          console.warn(
            `Model ${model} encountered status ${error.status}. Retrying in ${
              delay / 1000
            }s...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else if (
          model === modelsArray[modelsArray.length - 1] &&
          attempt === maxRetriesPerModel
        ) {
          // Exhausted all retries on the final model in the array
          throw error;
        } else {
          console.warn(
            `Model ${model} failed or exhausted retries. Falling back to next model in chain...`
          );
          break; // Exit inner retry loop to move to the next model
        }
      }
    }
  }
}

async function run() {
  try {
    const businessRequirement =
      process.env.ISSUE_BODY || "No requirement provided.";

    // Codebase context files (truncated to prevent token exhaustion)
    const MAX_CONTEXT_LENGTH = 12000;

    const readContextFile = (filePath) => {
      return fs.existsSync(filePath)
        ? fs.readFileSync(filePath, "utf8").slice(0, MAX_CONTEXT_LENGTH)
        : "";
    };

    const databaseContext = readContextFile(
      ".docs/context-source-database-schema.md"
    );
    const backendContext = readContextFile(
      ".docs/context-source-backend-services.md"
    );
    const frontendContext = readContextFile(
      ".docs/context-source-frontend-components.md"
    );
    const testContext = readContextFile(
      ".docs/context-source-test-framework.md"
    );

    const response = await generateWithModelFallbackArray({
      config: {
        systemInstruction: `You are an expert Agile Product Manager and Senior Tech Lead. You have deep knowledge of our application's architecture based on the codebase files provided.

Behavior: Whenever a raw requirement sentence or feature idea is provided, you will automatically transform it into a comprehensive User Story and generate a specific development implementation checklist based on the existing codebase.

Output Format:
Always structure your response exactly like this:

📖 User Story
As a [Persona], I want to [Action], so that [Value/Benefit].

✅ Acceptance Criteria
1. [Scenario Title]

Given [Context/Setup]
When [Action taken by user]
Then [Expected outcome] (Repeat for 3-5 scenarios)

🛠️ Development Checklist
Frontend / UI: [Specific components to create/update, routing changes, or state management updates]
Backend / API: [Specific endpoints, controllers, or services to build/modify]
Database / Models: [Required schema changes, new tables, or ORM model updates]
Testing: [Specific unit or integration tests needed]

⚠️ Technical / UX Notes
[Dependencies, edge cases, security considerations, or potential impacts on existing features found in the codebase]`,
      },
      contents: [
        {
          text: `Here is the codebase context:\n\n--- DATABASE CONTEXT ---\n${databaseContext}\n\n--- BACKEND CONTEXT ---\n${backendContext}\n\n--- FRONTEND CONTEXT ---\n${frontendContext}\n\n--- TEST FRAMEWORK CONTEXT ---\n${testContext}`,
        },
        {
          text: `Transform the following business requirement into the required format: \n\n"${businessRequirement}"`,
        },
      ],
    });

    if (response && response.text) {
      console.log(response.text);
    } else {
      console.error(
        "Error: Received an empty or filtered response from Gemini."
      );
      process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

run();
