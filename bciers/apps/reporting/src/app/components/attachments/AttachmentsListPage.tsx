import { List, ListItem } from "@mui/material";
import getAttachmentsList from "../../utils/getAttachmentsList";

type Attachment = {
  operator: string;
  operation: string;
  report_version_id: number;
  attachment_id: number;
  attachment_type: string;
  attachment_name: string;
};

const AttachmentsListPage: React.FC = async () => {
  const data: Attachment[] = await getAttachmentsList();

  return (
    <div>
      <h1>Attachments:</h1>
      <List dense={true}>
        {data.map((a, index) => (
          <ListItem key={index}>{a.operation}</ListItem>
        ))}
      </List>
    </div>
  );
};

export default AttachmentsListPage;
