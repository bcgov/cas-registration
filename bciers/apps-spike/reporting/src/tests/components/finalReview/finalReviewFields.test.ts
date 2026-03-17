import { productionDataFields } from "@reporting/src/app/components/finalReview/finalReviewFields";

describe("productionDataFields", () => {
  const alwaysPresentKeys = [
    "unit",
    "annual_production",
    "production_methodology",
    "storage_quantity_start_of_period",
    "storage_quantity_end_of_period",
    "quantity_sold_during_period",
    "quantity_throughput_during_period",
  ];

  it("always includes all non-partial-year fields regardless of product data", () => {
    const product = {
      product: "Test Product",
      production_data_apr_dec: null,
      production_data_jan_mar: null,
    };

    const fields = productionDataFields(product);
    const fieldKeys = fields
      .filter((f: any) => f.key !== undefined)
      .map((f: any) => f.key);

    alwaysPresentKeys.forEach((key) => {
      expect(fieldKeys).toContain(key);
    });
  });

  it("always includes all non-partial-year fields when called with no arguments", () => {
    const fields = productionDataFields();
    const fieldKeys = fields
      .filter((f: any) => f.key !== undefined)
      .map((f: any) => f.key);

    alwaysPresentKeys.forEach((key) => {
      expect(fieldKeys).toContain(key);
    });
  });

  it("excludes production_data_apr_dec when its value is null", () => {
    const product = {
      product: "Test Product",
      production_data_apr_dec: null,
      production_data_jan_mar: 500,
    };

    const fields = productionDataFields(product);
    const fieldKeys = fields
      .filter((f: any) => f.key !== undefined)
      .map((f: any) => f.key);

    expect(fieldKeys).not.toContain("production_data_apr_dec");
  });

  it("excludes production_data_jan_mar when its value is null", () => {
    const product = {
      product: "Test Product",
      production_data_apr_dec: 1000,
      production_data_jan_mar: null,
    };

    const fields = productionDataFields(product);
    const fieldKeys = fields
      .filter((f: any) => f.key !== undefined)
      .map((f: any) => f.key);

    expect(fieldKeys).not.toContain("production_data_jan_mar");
  });

  it("excludes both partial-year fields when both values are null", () => {
    const product = {
      product: "Test Product",
      production_data_apr_dec: null,
      production_data_jan_mar: null,
    };

    const fields = productionDataFields(product);
    const fieldKeys = fields
      .filter((f: any) => f.key !== undefined)
      .map((f: any) => f.key);

    expect(fieldKeys).not.toContain("production_data_apr_dec");
    expect(fieldKeys).not.toContain("production_data_jan_mar");
  });

  it("includes production_data_apr_dec when its value is not null", () => {
    const product = {
      product: "Test Product",
      production_data_apr_dec: 1000,
      production_data_jan_mar: null,
    };

    const fields = productionDataFields(product);
    const fieldKeys = fields
      .filter((f: any) => f.key !== undefined)
      .map((f: any) => f.key);

    expect(fieldKeys).toContain("production_data_apr_dec");
  });

  it("includes production_data_jan_mar when its value is not null", () => {
    const product = {
      product: "Test Product",
      production_data_apr_dec: null,
      production_data_jan_mar: 500,
    };

    const fields = productionDataFields(product);
    const fieldKeys = fields
      .filter((f: any) => f.key !== undefined)
      .map((f: any) => f.key);

    expect(fieldKeys).toContain("production_data_jan_mar");
  });

  it("excludes partial-year fields when their values are undefined (key absent from product)", () => {
    const product = {
      product: "Test Product",
      // production_data_apr_dec and production_data_jan_mar are not present
    };

    const fields = productionDataFields(product);
    const fieldKeys = fields
      .filter((f: any) => f.key !== undefined)
      .map((f: any) => f.key);

    expect(fieldKeys).not.toContain("production_data_apr_dec");
    expect(fieldKeys).not.toContain("production_data_jan_mar");
  });

  it("includes a heading entry for the product name", () => {
    const product = { product: "Cement" };

    const fields = productionDataFields(product);
    const headings = fields
      .filter((f: any) => f.heading !== undefined)
      .map((f: any) => f.heading);

    expect(headings).toContain("Cement");
  });
});
