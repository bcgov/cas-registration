import { NextRequest, NextResponse } from "next/server";

/**
 * A NextRequest that can carry a per-request rule context.
 */
export interface ContextAwareNextRequest<
  TContext extends object = Record<string, unknown>,
> extends NextRequest {
  __ctx?: TContext;
}

/**
 * A single permission rule: determines applicability, validates access,
 * and—if invalid—returns a redirect response.
 */
export type PermissionRule<TContext extends object> = {
  name: string;
  isApplicable: (
    request: NextRequest,
    id?: number,
    context?: TContext,
  ) => boolean | Promise<boolean>;
  validate: (
    id?: number,
    request?: NextRequest,
    context?: TContext,
  ) => boolean | Promise<boolean>;
  redirect: (
    id: number | undefined,
    request: ContextAwareNextRequest<TContext>,
  ) => NextResponse;
};

/**
 * Configuration for a rule runner instance.
 */
export type RunnerOptions<TContext extends object> = {
  /**
   * Pull the numeric resource identifier (e.g., CRV id) from a pathname.
   * Return undefined if there is no id in this path.
   */
  extractId: (pathname: string) => number | undefined;

  /**
   * Construct a fresh context object for this request.
   * Will be attached to request.__ctx for downstream rules/redirects.
   */
  createContext: () => TContext;

  /**
   * The ordered list of rules to evaluate.
   * The first applicable rule whose validate() returns false will trigger redirect().
   */
  rules: PermissionRule<TContext>[];

  /**
   * Fallback redirect if an error occurs while evaluating rules.
   */
  onErrorRedirect: (request: NextRequest) => NextResponse;
};

/**
 * Evaluate a set of permission rules for a given request.
 * Returns a NextResponse (redirect) if access should be denied, or null to continue.
 */
export async function runPermissionRules<TContext extends object>(
  request: ContextAwareNextRequest<TContext>,
  { extractId, createContext, rules, onErrorRedirect }: RunnerOptions<TContext>,
): Promise<NextResponse | null> {
  try {
    const { pathname } = request.nextUrl;
    const id = extractId(pathname) ?? undefined;

    // Create and attach per-request context once so rules & redirects can share it.
    const context = createContext();
    request.__ctx = context;

    for (const rule of rules) {
      // Short-circuit on the first applicable rule
      if (await rule.isApplicable(request, id, context)) {
        const isValid = await rule.validate(id, request, context);
        if (!isValid) {
          return rule.redirect(id, request);
        }
      }
    }

    // No redirects required → allow downstream middleware/handler to proceed
    return null;
  } catch (err) {
    // Keep a breadcrumb in server logs; still return a deterministic redirect
    console.error("RuleRunner error:", err);
    return onErrorRedirect(request);
  }
}

/**
 * Helper to create a redirect function for a rule.
 * If a resolver returns undefined, or no redirectTargetById is found,
 * falls back to the provided fallbackPath.
 */
export const makeRuleRedirect =
  <TContext extends object>(
    fallbackPath: string,
    resolver?: (id: number, ctx: TContext) => string | undefined,
  ) =>
  (id: number | undefined, request: ContextAwareNextRequest<TContext>) => {
    const ctx = request.__ctx;
    const fallback = () =>
      NextResponse.redirect(new URL(fallbackPath, request.url));

    if (typeof id !== "number" || !ctx) return fallback();

    const target = resolver?.(id, ctx) ?? (ctx as any).redirectTargetById?.[id];
    if (!target) return fallback();

    return NextResponse.redirect(
      new URL(`${fallbackPath}/${id}/${target}`, request.url),
    );
  };
