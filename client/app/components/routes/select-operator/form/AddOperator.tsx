import UserOperatorForm from "@/app/components/form/UserOperatorForm";
import { userOperatorSchema } from "@/app/utils/jsonSchema/userOperator";

export default async function UserOperator() {
  return (
    <section className="text-center my-20 text-2xl flex flex-col gap-3">
      <UserOperatorForm schema={userOperatorSchema} />
    </section>
  );
}
