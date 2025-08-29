import getAttachmentsList, {
  AttachmentsSearchParams,
} from "@reporting/src/app/utils/getAttachmentsList";
import AttachmentsListGrid from "./AttachmentsListGrid";

export type Attachment = {
  id: number;
  operator: string;
  operation: string;
  report_version_id: number;
  attachment_type: string;
  attachment_name: string;
};

interface Props {
  searchParams: AttachmentsSearchParams;
}

const AttachmentsListPage: React.FC<Props> = async ({ searchParams }) => {
  const data = await getAttachmentsList(searchParams);

  return <AttachmentsListGrid initialData={data} />;
};

export default AttachmentsListPage;
