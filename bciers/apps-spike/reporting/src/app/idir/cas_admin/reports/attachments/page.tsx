import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import AttachmentsListPage from "@reporting/src/app/components/attachments/attachmentsList/AttachmentsListPage";
import ReportsBasePage from "@reporting/src/app/components/operations/ReportsBasePage";
import { AttachmentsSearchParams } from "@reporting/src/app/utils/getAttachmentsList";

function ReportsPage({
  searchParams,
}: {
  searchParams: AttachmentsSearchParams;
}) {
  return (
    <ReportsBasePage activeTab={2}>
      <div className="flex flex-col">
        <AttachmentsListPage searchParams={searchParams || {}} />
      </div>
    </ReportsBasePage>
  );
}
export default defaultPageFactory(ReportsPage);
