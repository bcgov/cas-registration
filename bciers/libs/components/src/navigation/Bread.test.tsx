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
      url: "http://localhost:3000/administration/contacts",
      expectedBreadcrumbs: ["Home", "Administration", "Contacts"],
    },
    {
      url: "http://localhost:3000/administration/contacts/add-contact",
      expectedBreadcrumbs: [
        "Home",
        "Administration",
        "Contacts",
        "Add Contact",
      ],
    },
    {
      url: "http://localhost:3000/administration/contacts/10?contacts_title=Henry%20Ives",
      expectedBreadcrumbs: ["Home", "Administration", "Contacts", "Henry Ives"],
    },
    {
      url: "http://localhost:3000/administration/operations",
      expectedBreadcrumbs: ["Home", "Administration", "Operations"],
    },
    {
      url: "http://localhost:3000/administration/operations/002d5a9e-32a6-4191-938c-2c02bfec592d?operations_title=Operation+2",
      expectedBreadcrumbs: [
        "Home",
        "Administration",
        "Operations",
        "Operation 2",
      ],
    },
    {
      url: "http://localhost:3000/administration/operations/002d5a9e-32a6-4191-938c-2c02bfec592d/facilities?operations_title=Operation+2",
      expectedBreadcrumbs: [
        "Home",
        "Administration",
        "Operations",
        "Operation 2",
      ],
    },
    {
      url: "http://localhost:3000/administration/operations/002d5a9e-32a6-4191-938c-2c02bfec592d/facilities/f486f2fb-62ed-438d-bb3e-0819b51e3aeb?operations_title=Operation%202&facilities_title=Facility%201",
      expectedBreadcrumbs: [
        "Home",
        "Administration",
        "Operations",
        "Operation 2",
        "Facility 1",
      ],
    },
    {
      url: "http://localhost:3000/registration/register-an-operation",
      expectedBreadcrumbs: ["Home", "Registration", "Register An Operation"],
    },
    {
      url: "http://localhost:3000/registration/register-an-operation/2",
      expectedBreadcrumbs: ["Home", "Registration", "Register An Operation"],
    },
  ];

  testCases.forEach(({ url, expectedBreadcrumbs }) => {
    it(`should render breadcrumbs for URL: ${url}`, () => {
      setupMocks(url);

      render(
        <Bread
          separator=">"
          capitalizeLinks={true}
          defaultLinks={[{ label: "Home", href: "/" }]}
        />,
      );

      expectedBreadcrumbs.forEach((breadcrumb) => {
        expect(screen.getByText(breadcrumb)).toBeVisible();
      });
    });
  });
});
