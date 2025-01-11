import { Suspense } from "react";
import Loading from "../loading/SkeletonForm";

/**
 * Page factory for NextJS pages with parameters in URL.
 * The factory returns an async React Functional Component that can be used as-is in a NextJS page.
 *
 * The TPageParams type of the component must match the directory structure and parameter names of the URL.
 *
 * Example:
 * For the URL .../reports/[version_id]/somepage
 *
 * `page.tsx` will just export defaultPageFactory(SomePage)
 * provided the props for the SomePage component match {version_id: number}.
 *
 * A couple of convenience interfaces have been provided here and are meant to be used for Props of the appropriate components:
 *
 * const SomePage: React.FC<HasFacilityId> = (...) => ...
 * const nextJsPage = defaultPageFactory(SomePage)
 */

export default function defaultPageFactory<TPageParams extends {}>(
  Component: React.FC<TPageParams>,
) {
  return async function Page(props: { params: TPageParams }) {
    return (
      <Suspense fallback={<Loading />}>
        <Component {...props.params} />
      </Suspense>
    );
  };
}
