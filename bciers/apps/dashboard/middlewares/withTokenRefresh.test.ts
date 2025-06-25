import { encode, getToken } from "next-auth/jwt";
import { withTokenRefreshMiddleware } from "./withTokenRefresh";
import { NextResponse } from "next/server";

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
  encode: vi.fn(),
}));
vi.mock("next/server", async (importOriginal) => {
  const original: any = await importOriginal();

  return {
    ...original,
    NextResponse: {
      redirect: original.NextResponse.redirect,
      next: vi.fn(),
    },
  };
});

const mockGetToken = getToken as ReturnType<typeof vi.fn>;
const mockEncode = encode as ReturnType<typeof vi.fn>;
const mockNextResponseNext = NextResponse.next as ReturnType<typeof vi.fn>;

describe("The withTokenRefresh middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("Returns an unchanged NextResponse if no JWT", async () => {
    mockGetToken.mockReturnValue(undefined);
    mockNextResponseNext.mockReturnValue({ test: 1 });

    const middlewareUnderTest = withTokenRefreshMiddleware(vi.fn());
    const request = {};

    const response = await middlewareUnderTest(request as any, {} as any);

    expect(response).toEqual({ test: 1 });
  });
  it("Returns an unchanged NextResponse if the token doesn't need refreshing", async () => {
    mockGetToken.mockReturnValue({ expires_at: Date.now() / 1000 + 10000 });
    mockNextResponseNext.mockReturnValue({ test: 2 });

    const middlewareUnderTest = withTokenRefreshMiddleware(vi.fn());
    const request = {};

    const response = await middlewareUnderTest(request as any, {} as any);

    expect(response).toEqual({ test: 2 });
  });
  it("Signs out the user if the token refresh fails", async () => {
    mockGetToken.mockReturnValue({ expires_at: 10000 });

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            error: "Unauthorized",
          }),
      }),
    ) as any;

    const middlewareUnderTest = withTokenRefreshMiddleware(vi.fn());
    const request = {
      url: "http://example.com/some-path",
      cookies: {
        getAll: vi
          .fn()
          .mockReturnValue([
            { name: "next-auth.session-token.to-delete" },
            { name: "to-keep" },
          ]),
      },
    };

    const response = await middlewareUnderTest(request as any, {} as any);

    // Temporary redirect
    expect(response?.status).toEqual(307);
    expect(response?.headers.get("Location")).toEqual(
      "http://example.com/onboarding",
    );
  });
  it("Encodes a JWT with the new tokens", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: "new_access",
            refresh_token: "new_refresh",
          }),
      }),
    ) as any;

    mockEncode.mockReturnValue("encoded token");
    mockGetToken.mockReturnValue({ expires_at: 10000 });

    const mockSetCookies = vi.fn();
    const mockNextResponse = { cookies: { set: mockSetCookies } };
    mockNextResponseNext.mockReturnValue(mockNextResponse);

    const middlewareUnderTest = withTokenRefreshMiddleware(vi.fn());
    const request = {};

    const response = await middlewareUnderTest(request as any, {} as any);

    expect(mockEncode.mock.calls[0][0].token.access_token).toEqual(
      "new_access",
    );
    expect(mockEncode.mock.calls[0][0].token.refresh_token).toEqual(
      "new_refresh",
    );

    expect(mockSetCookies).toHaveBeenCalledWith(
      "authjs.session-token.0",
      "encoded token",
      {
        httpOnly: true,
        maxAge: 1800,
        sameSite: "strict",
        secure: undefined,
      },
    );

    expect(response).toEqual(mockNextResponse);
  });
});
