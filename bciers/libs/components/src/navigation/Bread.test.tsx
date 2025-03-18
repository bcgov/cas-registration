import { render, screen } from "@testing-library/react";
import { usePathname, useSearchParams } from "@bciers/testConfig/mocks";
import Bread from "./Bread";

// Utility function to set up mocks based on the URL
const setupMocks = (url: string) => {
  const [pathname, searchParams] = url.split("?");
  usePathname.mockReturnValue(pathname);
  useSearchParams.mockReturnValue(new URLSearchParams(searchParams));
};

describe("The Breadcrumb component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const testCases = [
    {
      url: "http://localhost:3000/administration/select-operator/confirm/685d581b-5698-411f-ae00-de1d97334a71?title=Alpha%20Enterprises",
      expectedBreadcrumbs: [
        "Dashboard",
        "Administration",
        "Select Operator",
        "Alpha Enterprises",
      ],
    },
    {
      url: "http://localhost:3000/administration/select-operator/received/request-access/685d581b-5698-411f-ae00-de1d97334a71?title=Alpha%20Enterprises",
      expectedBreadcrumbs: [
        "Dashboard",
        "Administration",
        "Select Operator",
        "Alpha Enterprises",
      ],
    },
    {
      url: "http://localhost:3000/administration/contacts",
      expectedBreadcrumbs: ["Dashboard", "Administration", "Contacts"],
    },
    {
      url: "http://localhost:3000/administration/contacts/add-contact",
      expectedBreadcrumbs: [
        "Dashboard",
        "Administration",
        "Contacts",
        "Add Contact",
      ],
    },
    {
      url: "http://localhost:3000/administration/contacts/10?contacts_title=Henry%20Ives",
      expectedBreadcrumbs: [
        "Dashboard",
        "Administration",
        "Contacts",
        "Henry Ives",
      ],
    },
    {
      url: "http://localhost:3000/administration/operations",
      expectedBreadcrumbs: ["Dashboard", "Administration", "Operations"],
    },
    {
      url: "http://localhost:3000/administration/operations/002d5a9e-32a6-4191-938c-2c02bfec592d?operations_title=Operation+2",
      expectedBreadcrumbs: [
        "Dashboard",
        "Administration",
        "Operations",
        "Operation 2",
      ],
    },
    {
      url: "http://localhost:3000/administration/operations/002d5a9e-32a6-4191-938c-2c02bfec592d/facilities?operations_title=Operation+2",
      expectedBreadcrumbs: [
        "Dashboard",
        "Administration",
        "Operations",
        "Operation 2",
        "Facilities",
      ],
    },
    {
      url: "http://localhost:3000/administration/operations/002d5a9e-32a6-4191-938c-2c02bfec592d/facilities/f486f2fb-62ed-438d-bb3e-0819b51e3aeb?operations_title=Operation%202&facilities_title=Facility%201",
      expectedBreadcrumbs: [
        "Dashboard",
        "Administration",
        "Operations",
        "Operation 2",
        "Facilities",
        "Facility 1",
      ],
    },
    {
      url: "http://localhost:3000/registration/register-an-operation",
      expectedBreadcrumbs: [
        "Dashboard",
        "Registration",
        "Register An Operation",
      ],
    },
    {
      url: "http://localhost:3000/registration/register-an-operation/2",
      expectedBreadcrumbs: [
        "Dashboard",
        "Registration",
        "Register An Operation",
      ],
    },
    {
      url: "http://localhost:3000/reporting/reports",
      expectedBreadcrumbs: ["Dashboard", "Reporting", "Reports"],
    },
    {
      url: "http://localhost:3000/reporting/reports/1/review-operation-information",
      expectedBreadcrumbs: [
        "Dashboard",
        "Reporting",
        "Reports",
        "Review Operation Information",
      ],
    },
    {
      url: "http://localhost:3000/reporting/reports/1/facilities/f486f2fb-62ed-438d-bb3e-0819b51e3aff/activities",
      expectedBreadcrumbs: ["Dashboard", "Reporting", "Reports", "Activities"],
    },
  ];

  testCases.forEach(({ url, expectedBreadcrumbs }) => {
    it(`should render breadcrumbs for URL: ${url}`, () => {
      setupMocks(url);

      render(
        <Bread
          separator=">"
          capitalizeLinks={true}
          defaultLinks={[{ label: "Dashboard", href: "/" }]}
        />,
      );

      expectedBreadcrumbs.forEach((breadcrumb) => {
        expect(screen.getByText(breadcrumb)).toBeVisible();
      });
    });
  });
});
