import { describe, it, expect } from "vitest";
import { handleVerificationData } from "@reporting/src/app/utils/verification/handleVerificationData";

describe("handleVerificationData", () => {
  it("should remove 'None' if other selections are made", () => {
    const data = {
      visit_names: ["None", "Facility 1"],
      visit_types: [],
      visit_others: [],
    };
    const result = handleVerificationData(data, "default");
    expect(result.visit_names).toEqual(["Facility 1"]);
  });

  it("should lock to 'None' and clear other fields if only 'None' is selected", () => {
    const data = {
      visit_names: ["None"],
      visit_types: [{ visit_name: "Old" }],
      visit_others: [{ key: "value" }],
    };
    const result = handleVerificationData(data, "default");
    expect(result.visit_names).toEqual(["None"]);
    expect(result.visit_types).toEqual([]);
    expect(result.visit_others).toEqual([{}]);
  });

  it("should enforce maxItem=1 for 'SFO' operation type", () => {
    const data = {
      visit_names: ["Facility 1", "Facility 2"],
      visit_types: [],
      visit_others: [],
    };
    const result = handleVerificationData(data, "SFO");
    expect(result.visit_names).toEqual(["Facility 2"]); // Last selected should be retained
  });

  it("should update visit_types based on visit_names", () => {
    const data = {
      visit_names: ["Facility 1", "Facility 2"],
      visit_types: [],
      visit_others: [],
    };
    const result = handleVerificationData(data, "default");
    expect(result.visit_types).toEqual([
      { visit_name: "Facility 1", visit_type: "" },
      { visit_name: "Facility 2", visit_type: "" },
    ]);
  });

  it("should preserve existing visit_types if present", () => {
    const data = {
      visit_names: ["Facility 1"],
      visit_types: [{ visit_name: "Facility 1", visit_type: "In-Person" }],
      visit_others: [],
    };
    const result = handleVerificationData(data, "default");
    expect(result.visit_types).toEqual([
      { visit_name: "Facility 1", visit_type: "In-Person" },
    ]);
  });

  it("should set visit_types to empty if only 'None' is selected", () => {
    const data = {
      visit_names: ["None"],
      visit_types: [{ visit_name: "Facility 1" }],
      visit_others: [],
    };
    const result = handleVerificationData(data, "default");
    expect(result.visit_types).toEqual([]);
  });

  it("should clear visit_others if 'Other' is not selected", () => {
    const data = {
      visit_names: ["Facility 1"],
      visit_types: [],
      visit_others: [{ visit_name: "Other Visit" }],
    };
    const result = handleVerificationData(data, "default");
    expect(result.visit_others).toEqual([{}]);
  });

  it("should retain visit_others if 'Other' is selected", () => {
    const data = {
      visit_names: ["Other"],
      visit_types: [],
      visit_others: [{ visit_name: "Other Visit" }],
    };
    const result = handleVerificationData(data, "default");
    expect(result.visit_others).toEqual([{ visit_name: "Other Visit" }]);
  });
});
