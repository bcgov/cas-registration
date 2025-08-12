import { WidgetProps } from "@rjsf/utils/lib/types";
import dayjs from "dayjs";

const formatDate = (value: string) => {
  if (typeof value === "string" && dayjs(value).isValid()) {
    return dayjs(value).format("MMM DD, YYYY");
  }
  return null;
};

const ReadOnlyDateWidget: React.FC<WidgetProps> = ({ id, value }) => {
  const formattedDate = formatDate(value);

  return (
    <div id={id} className="read-only-widget">
      {formattedDate}
    </div>
  );
};
export default ReadOnlyDateWidget;
