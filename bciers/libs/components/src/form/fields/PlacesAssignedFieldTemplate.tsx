import { ArrayFieldTemplateProps } from "@rjsf/utils";
import Link from "next/link";

const PlacesAssignedFieldTemplate = ({ items }: ArrayFieldTemplateProps) => {
  if (items.length < 1) {
    return <div>None</div>;
  }
  return (
    <div className="flex min-w-full flex-col">
      {items?.map((item) => {
        const formData = item.children.props.formData;
        if (
          !formData.role_name ||
          !formData.operation_name ||
          !formData.operation_id
        ) {
          throw new Error(`Invalid places assigned data`);
        }
        return (
          <div key={item.key} className="w-full px-[14px] py-4 items-center">
            {formData.role_name} -{" "}
            <Link
              href={`/operations/${formData.operation_id}?operations_title=${formData.operation_name}&from_contacts=true`}
            >
              {formData.operation_name}
            </Link>
          </div>
        );
      })}
      <div className="w-full px-[14px] py-4 items-center">
        <b>Note:</b> You cannot delete this contact unless you replace them with
        other contact(s) in the place(s) above.
      </div>
    </div>
  );
};

export default PlacesAssignedFieldTemplate;
