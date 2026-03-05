import { NextURL } from "next/dist/server/web/next-url";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { instance, mock, reset, when } from "ts-mockito";
import proxy from "../proxy";
import { getToken } from "@bciers/testConfig/mocks";
import { mockBaseToken } from "@bciers/testConfig/data/tokens";

const domain = "https://localhost:3000";
const mockedRequest: NextRequest = mock(NextRequest);
vi.spyOn(NextResponse, "redirect");
vi.spyOn(NextResponse, "rewrite");
const mockNextFetchEvent: NextFetchEvent = mock(NextFetchEvent);

describe("withAuthorizationAdmin proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    reset(mockedRequest);
  });

  it("redirects to the onboarding page if the user is not authenticated", async () => {
    // The user tries to access the operations page
    const nextUrl = new NextURL(`${domain}/administration/operations`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    const result = await proxy(instance(mockedRequest), mockNextFetchEvent);
    expect(NextResponse.redirect).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL("/onboarding", domain),
    );
    expect(result?.status).toBe(307);
  });

  it("calls NextProxy if the user is authenticated and the path is in the authenticated allow list", async () => {
    getToken.mockResolvedValue(mockBaseToken);
    const nextUrl = new NextURL(`${domain}/administration/profile`);

    when(mockedRequest.nextUrl).thenReturn(nextUrl);
    when(mockedRequest.url).thenReturn(domain);

    const result = await proxy(instance(mockedRequest), mockNextFetchEvent);
    expect(result?.status).toBe(200);
  });
});
