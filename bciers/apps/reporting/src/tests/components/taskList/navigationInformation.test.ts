import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import { pageFactories } from "@reporting/src/app/components/taskList/taskListPages/pageFactories";
import { reportingFlows } from "@reporting/src/app/components/taskList/reportingFlows";
import {
  HeaderStep,
  ReportingFlow,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";

vi.mock(
  "@reporting/src/app/components/taskList/taskListPages/pageFactories",
  () => ({
    pageFactories: {
      TestPreviousPage: vi
        .fn()
        .mockReturnValue({ element: { previous: true, link: "previouspage" } }),
      TestNextPage: vi
        .fn()
        .mockReturnValue({ element: { next: true, link: "nextpage" } }),
      TestPage: vi.fn().mockReturnValue({ element: { page1: true } }),
      TestPage2: vi.fn().mockReturnValue({ element: { page2: true } }),
      TestPage3: vi.fn().mockReturnValue({ element: { page3: true } }),
    },
  }),
);

vi.mock("@reporting/src/app/components/taskList/reportingFlows", () => ({
  reportingFlows: {
    TestFlow: {
      TestHeader: ["TestPage", "TestPage2", "TestPage3"],
    },
  },
  getFlow: () => "TestFlow" as ReportingFlow,
}));

describe("The getNavigationInformation function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Builds the tasklist for the specified header with default back and continue urls", async () => {
    const navInfo = await getNavigationInformation(
      "TestHeader" as HeaderStep,
      "TestPage" as ReportingPage,
      1,
      "1",
      {},
    );

    expect(navInfo).toEqual({
      taskList: [{ page1: true }, { page2: true }, { page3: true }],
      backUrl: "/reports",
      continueUrl: "/reports",
      headerSteps: ["TestHeader"],
      headerStepIndex: 0,
    });
  });
  it("Finds the next and previous page in the current header", async () => {
    (pageFactories as any).TestPage = vi
      .fn()
      .mockReturnValue({ element: { link: "linkpage1" } });

    (pageFactories as any).TestPage3 = vi
      .fn()
      .mockReturnValue({ element: { link: "linkpage3" } });

    const navInfo = await getNavigationInformation(
      "TestHeader" as HeaderStep,
      "TestPage2" as ReportingPage,
      1,
      "1",
      {},
    );

    expect(navInfo.backUrl).toEqual("linkpage1");
    expect(navInfo.continueUrl).toEqual("linkpage3");
  });
  it("Finds the next and previous page link within the nested elements", async () => {
    (pageFactories as any).TestPage = vi.fn().mockReturnValue({
      element: {
        elements: [{ link: "previous-first" }, { link: "previous-last" }],
      },
    });

    (pageFactories as any).TestPage3 = vi.fn().mockReturnValue({
      element: { elements: [{ link: "next-first" }, { link: "next-last" }] },
    });

    const navInfo = await getNavigationInformation(
      "TestHeader" as HeaderStep,
      "TestPage2" as ReportingPage,
      1,
      "1",
      {},
    );

    expect(navInfo.backUrl).toEqual("previous-last");
    expect(navInfo.continueUrl).toEqual("next-first");
  });
  it("Finds the next and previous page in the next and previous headers", async () => {
    (reportingFlows as any).TestFlow = {
      PreviousHeader: ["TestPreviousPage"],
      TestHeader: ["TestPage"],
      NextHeader: ["TestNextPage"],
    };

    const navInfo = await getNavigationInformation(
      "TestHeader" as HeaderStep,
      "TestPage" as ReportingPage,
      1,
      "1",
      {},
    );
    expect(navInfo.backUrl).toEqual("previouspage");
    expect(navInfo.continueUrl).toEqual("nextpage");
  });
  it("Throws an error if the page is not found in the flow", async () => {
    await expect(() =>
      getNavigationInformation(
        "TestHeader" as HeaderStep,
        "NonexistantPage" as ReportingPage,
        1,
        "1",
        {},
      ),
    ).rejects.toThrowError(
      "Page NonexistantPage was not found in this reporting flow, unable to generate the appropriate tasklist and navigation.",
    );
  });
  it("Returns the list of headers and the proper index", async () => {
    (reportingFlows as any).TestFlow = {
      PreviousHeader: ["TestPreviousPage"],
      TestHeader: ["TestPage"],
      NextHeader: ["TestNextPage"],
    };

    const navInfo = await getNavigationInformation(
      "TestHeader" as HeaderStep,
      "TestPage" as ReportingPage,
      1,
      "1",
      {},
    );

    expect(navInfo.headerSteps).toEqual([
      "PreviousHeader",
      "TestHeader",
      "NextHeader",
    ]);
    expect(navInfo.headerStepIndex).toEqual(1);
  });
});
