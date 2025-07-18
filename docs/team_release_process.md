# Team Release Schedule & Process

This document describes the non-technical process our team has decided upon for scheduling and performing releases. This is different from the technical [Release Documentation](./devops/release.md) that describes how to create a release with release-it.

## Process

- Our release cadence targets every second Wednesday as the date to create a release & push it to the test environment.
- In the days leading up to that Wednesday, the PO, with assistance from developers will work to review tickets in the 'Pending PO Approval' column of our sprint board & move them to 'Approved by PO or Dev' if the work meets the acceptance criteria and is free of bugs.
- If a ticket is deemed to be incomplete or has a bug. The PO will make a judgement call:
  - If the issue with the ticket is minor enough that it can be included in the release & the issue can be addressed after the release has made it to test, then a new tech debt or bug ticket will be created & linked to the original ticket to cover what needs to be done.
  - If the issue with the ticket is not acceptable to be made part of a release & addressed later then the ticket will be moved back into the 'In Progress' column of the sprint board, flagged as 'Blocking Release' & made a high priority to fix as it is disrupting the release cadence.
- When there are no tickets left in 'Pending PO Approval' & no tickets with 'Blocking Release' exist, then a release of the app can be cut follwing the [Release Documentation](./devops/release.md).
- The release should be deployed to our TEST environment & all tickets in our sprint board that were part of the release should be tagged with the version number.
- After user acceptance testing has been performed in the TEST environment, the release can be deployed to the PROD environment.
