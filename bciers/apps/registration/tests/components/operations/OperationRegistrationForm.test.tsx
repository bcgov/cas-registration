import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import { useSession, useParams, useRouter } from "@bciers/testConfig/mocks";
import { QueryParams, Router } from "@bciers/testConfig/types";
import { operationRegistrationSchema } from "apps/registration/app/data/jsonSchema/operationRegistration";
import OperationRegistrationForm from "apps/registration/app/components/operations/OperationRegistrationForm";
import { createOperationRegistrationSchema } from "apps/registration/app/components/operations/OperationRegistrationPage";

const regulatedProducts = [
  { id: 1, name: "BC-specific refinery complexity throughput" },
  { id: 2, name: "Cement equivalent" },
];

const mockSchema = createOperationRegistrationSchema(
  operationRegistrationSchema,
  regulatedProducts,
);

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

describe("the OperationRegistrationForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the OperationRegistrationForm component", async () => {
    useRouter.mockReturnValue({
      query: {
        formSection: "1",
        operation: "create",
      },
    } as Router);

    useParams.mockReturnValue({
      formSection: "1",
      operation: "create",
    } as QueryParams);

    render(<OperationRegistrationForm schema={mockSchema} formData={{}} />);

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Registration Purpose",
    );
  });
});
