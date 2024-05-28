import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonGrid";
import FormComponent from "../../comp/FormComponent";
import { getGasTypes, getMethodologyFields } from '../../utils/actions'


export default async function FormTest() {
  const gasTypeQuery = await getGasTypes();
  const methodologyQuery = await getMethodologyFields();
  console.log('m:',methodologyQuery)
  console.log('g',gasTypeQuery)
  return (
    <>
      <Suspense fallback={<Loading />}>
        <FormComponent gasTypes={gasTypeQuery} methodologies={methodologyQuery} />
      </Suspense>
    </>
  );
}
