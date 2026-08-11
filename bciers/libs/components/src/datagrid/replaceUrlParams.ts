/**
 * Writes grid state (sort, page, column search) into the URL.
 *
 * App Router has no shallow routing, so this goes through the History API directly
 * rather than the Next router.
 *
 * Writes that wouldn't change the URL are skipped, which matters for more than
 * tidiness: every `replaceState` rewrites the current history entry, and one landing
 * while Next is still committing a `router.push` drops that navigation — the user
 * clicks a link or a Continue button and simply stays on the page. The grid's sort,
 * pagination, and column-search handlers all fire once while they initialize, so
 * without this guard a grid spends its first few hundred milliseconds able to
 * swallow whatever navigation the user triggers.
 *
 * Also keeps a params-less URL clean (`/path`, not `/path?`), so an empty write is
 * correctly recognized as a no-op.
 */
export const replaceUrlParams = (params: URLSearchParams) => {
  // window.location.pathname includes `/registration` unlike usePathname
  const pathName = window.location.pathname;
  const query = params.toString();
  const nextUrl = query ? `${pathName}?${query}` : pathName;

  if (nextUrl === `${pathName}${window.location.search}`) return;

  window.history.replaceState({}, "", nextUrl);
};

/**
 * Reads the params currently in the browser's address bar.
 *
 * This deliberately reads `window.location` rather than `useSearchParams()`. The grid
 * writes the URL with `replaceUrlParams`, which Next's router does not observe, so
 * `useSearchParams()` keeps returning whatever the page was rendered with and goes
 * stale the moment the user sorts, pages, or searches.
 */
export const getLiveSearchParams = () =>
  new URLSearchParams(window.location.search);
