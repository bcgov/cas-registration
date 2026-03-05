import { describe, it, expect } from "vitest";
import { extendVerificationData } from "@reporting/src/app/utils/verification/extendVerificationData";

describe("extendVerificationData", () => {
  it("should handle an empty initial data object", () => {
    const result = extendVerificationData({});
    expect(result.visit_names).toEqual([]);
    expect(result.visit_types).toEqual([]);
    expect(result.visit_others).toEqual([{}]);
  });

  it("should correctly map visit_names from report_verification_visits", () => {
    const input = {
      report_verification_visits: [
        { visit_name: "Facility A", is_other_visit: false },
        { visit_name: "Facility B", is_other_visit: false },
      ],
    };
    const result = extendVerificationData(input);
    expect(result.visit_names).toEqual(["Facility A", "Facility B"]);
  });

  it("should add 'Other' to visit_names if any visit has is_other_visit true", () => {
    const input = {
      report_verification_visits: [
        { visit_name: "Facility A", is_other_visit: false },
        { visit_name: "Custom Location", is_other_visit: true },
      ],
    };
    const result = extendVerificationData(input);
    expect(result.visit_names).toContain("Other");
  });

  it("should correctly map visit_types excluding 'None' and other visits", () => {
    const input = {
      report_verification_visits: [
        {
          visit_name: "Facility A",
          visit_type: "Type 1",
          is_other_visit: false,
        },
        { visit_name: "None", visit_type: "Type 2", is_other_visit: false },
      ],
    };
    const result = extendVerificationData(input);
    expect(result.visit_types).toEqual([
      { visit_name: "Facility A", visit_type: "Type 1" },
    ]);
  });

  it("should populate visit_others correctly when is_other_visit is true", () => {
    const input = {
      report_verification_visits: [
        {
          visit_name: "Custom Location",
          visit_coordinates: "123,456",
          visit_type: "Special",
          is_other_visit: true,
        },
      ],
    };
    const result = extendVerificationData(input);
    expect(result.visit_others).toEqual([
      {
        visit_name: "Custom Location",
        visit_coordinates: "123,456",
        visit_type: "Special",
      },
    ]);
  });

  it("should return visit_others as [{}] when no other visits exist", () => {
    const input = {
      report_verification_visits: [
        { visit_name: "Facility A", is_other_visit: false },
      ],
    };
    const result = extendVerificationData(input);
    expect(result.visit_others).toEqual([{}]);
  });
});
