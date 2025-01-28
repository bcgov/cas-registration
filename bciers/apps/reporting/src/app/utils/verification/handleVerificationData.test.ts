import { describe, it, expect } from "vitest";
import { handleVerificationData } from "@reporting/src/app/utils/verification/handleVerificationData";

describe("handleVerificationData", () => {
  it("should lock selection to 'None' and clear other fields if only 'None' is selected", () => {
    const input = {
      visit_names: ["None"],
      visit_types: [{ visit_name: "Test", visit_type: "A" }],
      visit_others: [{ visit_name: "Other" }],
    };
    const result = handleVerificationData(input, "LFO");
    expect(result.visit_names).toEqual(["None"]);
    expect(result.visit_types).toEqual([]);
    expect(result.visit_others).toEqual([{}]);
  });

  it("should remove 'None' if other selections are made", () => {
    const input = {
      visit_names: ["None", "Facility A"],
      visit_types: [],
      visit_others: [],
    };
    const result = handleVerificationData(input, "LFO");
    expect(result.visit_names).toEqual(["Facility A"]);
  });

  it("should enforce only one selection for 'SFO', keeping the last selected value", () => {
    const input = {
      visit_names: ["Facility A", "Facility B"],
      visit_types: [],
      visit_others: [],
    };
    const result = handleVerificationData(input, "SFO");
    expect(result.visit_names).toEqual(["Facility B"]);
  });

  it("should clear visit types and visit others when 'None' is the last selected for 'SFO'", () => {
    const input = {
      visit_names: ["Facility A", "None"],
      visit_types: [{ visit_name: "Facility A", visit_type: "A" }],
      visit_others: [{ visit_name: "Other" }],
    };
    const result = handleVerificationData(input, "SFO");
    expect(result.visit_names).toEqual(["None"]);
    expect(result.visit_types).toEqual([]);
    expect(result.visit_others).toEqual([{}]);
  });

  it("should correctly update visit_types excluding 'Other' and 'None'", () => {
    const input = {
      visit_names: ["Facility A", "Other", "None"],
      visit_types: [],
      visit_others: [],
    };
    const result = handleVerificationData(input, "LFO");
    expect(result.visit_types).toEqual([
      { visit_name: "Facility A", visit_type: "" },
    ]);
  });
});
