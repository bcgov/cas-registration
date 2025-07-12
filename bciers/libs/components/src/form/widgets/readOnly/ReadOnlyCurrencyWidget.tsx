import { WidgetProps } from "@rjsf/utils";

const ReadOnlyCurrencyWidget: React.FC<WidgetProps> = ({ id, value }) => {
  const formatted = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(value ?? 0);

  return (
    <div id={id} className="read-only-widget">
      {formatted}
    </div>
  );
};

export default ReadOnlyCurrencyWidget;
