// eslint-disable-next-line import/no-extraneous-dependencies
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { selectComboboxOption } from "@bciers/testConfig/helpers/selectComboboxOption";

// Helper function to fill mandatory fields
export const fillMandatoryFields = async (
  formFields: { label: string; type: string; key: string }[],
  formData: Record<string, string | number | boolean>,
) => {
  for (const { label, type, key } of formFields) {
    const value = formData[key as keyof typeof formData];

    switch (type) {
      case "text":
        await userEvent.type(
          screen.getByLabelText(new RegExp(label, "i")),
          value as string,
        );
        break;
      case "combobox":
        await selectComboboxOption(new RegExp(label, "i"), value as string);
        break;
      case "radio":
        const radioButton = screen.getByRole("radio", {
          name: value as string,
        });
        await userEvent.click(radioButton);
        break;
      default:
        break;
    }
  }
};
