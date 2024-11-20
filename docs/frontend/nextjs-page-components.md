# NextJS Page factory

### Description

`defaultPageFactory` is a convenience factory to build NextJS pages automatically.<br>
It takes a component to be rendered by a page, and wraps it in an async, server-side component that we can use in each of our pages.

### Usage

the factory takes a react component as a parameter. Its `Props` interface should have an item for each

Example:
for the file:

```
/src/app/bceidbusiness/industry_user/reports/[version_id]/facilities/[facility_id]/somepage/page.tsx
```

The component is expected to be:

```ts
# PageComponent.tsx
interface Props {
  version_id: ...
  facility_id: ...
}

export default PageComponent: React.FC<Props> = ...
```

Then the usage will be:

```ts
# /src/app/bceidbusiness/industry_user/reports/[version_id]/facilities/[facility_id]/somepage/page.tsx
import PageComponent from "...";

export default defaultPageFactory(PageComponent);
```

### Extending types

Note:
A couple of interfaces `HasVersionId` and `HasFacilityId` have been provided, more could be added.<br>
The defaultPageFactory uses generic typing to resolve the props passed to the children and won't enforce specific interfaces to be implemented, but for consistency, it would be advisable that all page components under the same URL requirements shared the same interface.
A future update might make those interfaces mandatory.
