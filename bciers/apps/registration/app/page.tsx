"use client";

import Main from "@bciers/components/layout/Main";

// Will remove this before merging, just leaving it in for PR review
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";

const section1: RJSFSchema = {
  type: "object",
  title: "Section 1",
  required: ["first_name", "last_name"],
  properties: {
    first_name: {
      type: "string",
      title: "First name",
    },
    last_name: {
      type: "string",
      title: "Last name",
    },
  },
};

const section2: RJSFSchema = {
  type: "object",
  title: "Section 2",
  required: ["phone", "email"],
  properties: {
    phone: {
      type: "string",
      title: "Phone",
      format: "phone",
    },
    email: {
      type: "string",
      title: "Email",
      format: "email",
    },
  },
};

const section3: RJSFSchema = {
  type: "object",
  title: "Section 3",
  required: ["address", "postal_code"],
  properties: {
    address: {
      type: "string",
      title: "Address",
    },
    postal_code: {
      type: "string",
      title: "Postal code",
      format: "postal-code",
    },
  },
};

const schema: RJSFSchema = {
  type: "object",
  required: ["section1", "section2", "section3"],
  properties: {
    section1,
    section2,
    section3,
  },
};

const uiSchema: UiSchema = {
  "ui:FieldTemplate": SectionFieldTemplate,
  "ui: options": {
    label: false,
  },
  section1: {
    "ui:FieldTemplate": SectionFieldTemplate,
  },
  section2: {
    "ui:FieldTemplate": SectionFieldTemplate,
    phone: {
      "ui:widget": "PhoneWidget",
    },
    email: {
      "ui:widget": "EmailWidget",
    },
  },
  section3: {
    "ui:FieldTemplate": SectionFieldTemplate,
    postal_code: {
      "ui:widget": "PostalCodeWidget",
    },
  },
};

export default function Page() {
  // Main will be moved into a child layout component once we set up the routes
  return (
    <Main
      sx={{
        margin: {
          xs: "140px auto 180px auto",
          md: "80px auto 80px auto",
        },
      }}
    >
      <h1>Registration Part II</h1>
      {/* Added a large bottom margin to test task list onClick smooth scroll */}
      <div className="mb-[50vh]">
        <SingleStepTaskListForm
          schema={schema}
          uiSchema={uiSchema}
          formData={{}}
          onSubmit={async (data) => console.log(data)}
          onCancel={() => console.log("cancelled")}
        />
      </div>
    </Main>
  );
}
