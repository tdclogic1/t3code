import { describe, expect, it } from "vitest";

import {
  BUSINESS_FUNCTION_CATALOG,
  CORE_BUSINESS_FUNCTIONS,
  SUGGESTED_BUSINESS_FUNCTIONS,
  TOTAL_BUSINESS_FUNCTIONS,
} from "./businessFunctionCatalog";

describe("BUSINESS_FUNCTION_CATALOG", () => {
  it("contains the requested core function layer plus suggested additions", () => {
    expect(TOTAL_BUSINESS_FUNCTIONS).toBe(14);
    expect(CORE_BUSINESS_FUNCTIONS).toHaveLength(8);
    expect(SUGGESTED_BUSINESS_FUNCTIONS.length).toBeGreaterThanOrEqual(5);
  });

  it("provides a task backlog for every major function", () => {
    expect(
      BUSINESS_FUNCTION_CATALOG.every(
        (category) => category.tasks.length >= 6 && category.workflowTracks.length >= 4,
      ),
    ).toBe(true);
  });
});
