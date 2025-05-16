// Calls the list grid component with the fetched data

import AttachmentsListGrid from "@reporting/src/app/components/attachments/attachmentsList/AttachmentsListGrid";
import AttachmentsListPage from "@reporting/src/app/components/attachments/attachmentsList/AttachmentsListPage";
import getAttachmentsList from "@reporting/src/app/utils/getAttachmentsList";
import { render } from "@testing-library/react";

vi.mock(
  "@reporting/src/app/components/attachments/attachmentsList/AttachmentsListGrid",
  () => ({
    default: vi.fn(),
  }),
);

vi.mock("@reporting/src/app/utils/getAttachmentsList", () => ({
  default: vi.fn(),
}));

const mockAttachmentsForm = AttachmentsListGrid as unknown as ReturnType<
  typeof vi.fn
>;

const mockGetAttachmentsList = getAttachmentsList as unknown as ReturnType<
  typeof vi.fn
>;

describe("the AttachmentsListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the list grid component with the fetched data and the search params from next", async () => {
    const mockSearchParams: any = { mock: true };
    const mockInitialData = { initial: true };
    mockGetAttachmentsList.mockResolvedValue(mockInitialData);

    const Page = await AttachmentsListPage({ searchParams: mockSearchParams });
    render(Page);

    expect(mockGetAttachmentsList).toHaveBeenCalledWith(mockSearchParams);
    expect(mockAttachmentsForm).toHaveBeenCalledWith(
      { initialData: mockInitialData },
      {},
    );
  });
});
