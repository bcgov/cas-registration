import React, { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";

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
 *
 * Supports two styles:
 * 1) Fullscreen async page (default): wraps the whole component in Suspense with default <Loading />.
 * 2) Content-first streaming: provide `options.header` to render immediate content outside Suspense,
 *    while `Component` renders inside Suspense (use `options.fallback` to customize).
 */

type DefaultSearchParams = Record<string, string | number | undefined>;

type DefaultPageFactoryOptions<TPageParams extends object> = {
  /**
   * Optional header that always renders immediately (outside Suspense).
   * Useful for Note/title/instructions that should show while the body suspends.
   */
  header?: React.FC<TPageParams & { searchParams?: DefaultSearchParams }>;
  /**
   * Optional Suspense fallback for the body. Defaults to <Loading />.
   */
  fallback?: React.ReactNode;
};

export default function defaultPageFactory<
  TPageParams extends object = Record<string, never>,
>(
  Component: React.FC<TPageParams & { searchParams?: DefaultSearchParams }>,
  options?: DefaultPageFactoryOptions<TPageParams>,
) {
  return async function Page({
    params,
    searchParams,
  }: {
    params: Promise<TPageParams>;
    searchParams?: Promise<DefaultSearchParams>;
  }) {
    const resolvedParams = await params;
    const resolvedSearchParams = searchParams ? await searchParams : undefined;

    const props = {
      ...resolvedParams,
      searchParams: resolvedSearchParams,
    } as TPageParams & { searchParams?: DefaultSearchParams };

    const Header = options?.header;
    const fallback = options?.fallback ?? <Loading />;

    return (
      <>
        {Header ? <Header {...props} /> : null}
        <Suspense fallback={fallback}>
          <Component {...props} />
        </Suspense>
      </>
    );
  };
}
