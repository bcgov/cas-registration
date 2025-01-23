import { ArrayFieldTemplateProps } from "@rjsf/utils";
import Link from "next/link";

const PlacesAssignedFieldTemplate = ({
  items,
  formContext,
}: ArrayFieldTemplateProps) => {
  if (items.length < 1) {
    return <div>None</div>;
  }
  return (
    <div className="flex min-w-full flex-col">
      {items?.map((item) => {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { role_name, operation_name, operation_id } =
          item.children.props.formData;
        if (!role_name || !operation_name || !operation_id) {
          throw new Error(`Invalid places assigned data`);
        }
        return (
          <div key={item.key} className="w-full px-[14px] py-4 items-center">
            {role_name} -{" "}
            <Link
              href={`/operations/${operation_id}?operations_title=${operation_name}&from_contacts=true`}
            >
              {operation_name}
            </Link>
          </div>
        );
      })}
      {!formContext.userRole.includes("cas") && (
        <div className="w-full px-[14px] py-4 items-center">
          <b>Note:</b> You cannot delete this contact unless you replace them
          with other contact(s) in the place(s) above.
        </div>
      )}
    </div>
  );
};

export default PlacesAssignedFieldTemplate;
