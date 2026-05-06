import {
  ArrayFieldTemplateProps,
  ArrayFieldItemTemplateProps,
} from "@rjsf/utils";
import Link from "next/link";

export function PlacesAssignedFieldItemTemplate(
  props: ArrayFieldItemTemplateProps,
) {
  const { children, itemKey } = props;
  const formData = (children as any).props.formData;
  const { role_name, operation_name, operation_id } = formData || {};
  if (!role_name || !operation_name || !operation_id) {
    throw new Error(`Invalid places assigned data`);
  }
  return (
    <div key={itemKey} className="w-full px-[14px] py-4 items-center">
      {role_name} -{" "}
      <Link
        href={`/operations/${operation_id}?operations_title=${operation_name}&from_contacts=true`}
      >
        {operation_name}
      </Link>
    </div>
  );
}

export function PlacesAssignedFieldTemplate(props: ArrayFieldTemplateProps) {
  const { items, registry } = props;
  if (items.length < 1) {
    return <div className="w-full px-[14px] py-4 items-center">None</div>;
  }
  return (
    <div className="flex min-w-full flex-col">
      {items}
      {!registry.formContext.userRole.includes("cas") && (
        <div className="w-full px-[14px] py-4 items-center">
          <b>Note:</b> You cannot delete this contact unless you replace them
          with other contact(s) in the place(s) above.
        </div>
      )}
    </div>
  );
}

export default PlacesAssignedFieldTemplate;
