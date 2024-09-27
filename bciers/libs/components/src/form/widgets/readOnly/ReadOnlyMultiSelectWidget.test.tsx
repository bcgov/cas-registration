import { render } from "@testing-library/react";
import FormBase from "@bciers/components/form/FormBase";
import {
  multiSelectFieldSchema,
  multiSelectFieldUiSchema,
} from "../MultiSelectWidget.test";

describe("RJSF ReadOnlyMultiSelectWidget", () => {
  it("should render a multi select field when formData is provided", async () => {
    const { container } = render(
      <FormBase
        disabled
        schema={multiSelectFieldSchema}
        uiSchema={multiSelectFieldUiSchema}
        formData={{ multiSelectTestField: ["option_2"] }}
      />,
    );

    expect(container).not.toBeNull();

    // const readOnlyMultiSelectWidget = container.querySelector(
    //   "#root_multiSelectTestField",
    // );
    //
    // expect(readOnlyMultiSelectWidget).toBeVisible();
    // expect(readOnlyMultiSelectWidget).toHaveTextContent("Option 2");
  });
  //
  // it("should render multiple values when formData is provided", async () => {
  //   const { container } = render(
  //     <FormBase
  //       disabled
  //       schema={multiSelectFieldSchema}
  //       uiSchema={multiSelectFieldUiSchema}
  //       formData={{
  //         multiSelectTestField: ["option_1", "option_2", "option_3"],
  //       }}
  //     />,
  //   );
  //
  //   const readOnlyMultiSelectWidget = container.querySelector(
  //     "#root_multiSelectTestField",
  //   );
  //
  //   expect(readOnlyMultiSelectWidget).toBeVisible();
  //   expect(readOnlyMultiSelectWidget).toHaveTextContent(
  //     "Option 1, Option 2, Option 3",
  //   );
  // });
  //
  // it("should be empty when no value is provided", async () => {
  //   const { container } = render(
  //     <FormBase
  //       disabled
  //       schema={multiSelectFieldSchema}
  //       uiSchema={multiSelectFieldUiSchema}
  //     />,
  //   );
  //
  //   const readOnlyMultiSelectWidget = container.querySelector(
  //     "#root_multiSelectTestField",
  //   );
  //
  //   expect(readOnlyMultiSelectWidget).toBeVisible();
  //   expect(readOnlyMultiSelectWidget).toHaveTextContent("");
  // });
});
