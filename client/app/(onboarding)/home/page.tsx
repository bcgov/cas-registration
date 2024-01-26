"use client";

/*
📚
In the app directory, nested folders are normally mapped to URL paths.
However, you can mark a folder as a Route Group to prevent the folder from being included in the route's URL path.
This allows you to organize your route segments and project files into logical groups without affecting the URL path structure, (useful in dynamic BreadCrumbs)
e.g. app\(onboarding)\home maps to route: http://localhost:3000/home
*/

export default function Page() {
  return (
    <>
      <p>
        Welcome to the B.C. Industrial Emissions Reporting System (BCIERS), a
        web application for industrial operators to participate in the B.C.
        Output-Based Pricing System (B.C. OBPS).
      </p>
    </>
  );
}
