import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonGrid";
import FormComponent from "../../comp/FormComponent";
import { getGasTypes, getMethodologies, getMethodologyFields } from '../../utils/actions'
import {useState} from 'react'


export default async function FormTest() {
  const gasTypeQuery = await getGasTypes();
  const methodologyQuery = await getMethodologies();
  const methodologyFieldsQuery = await getMethodologyFields();

  return (
    <>
      <Suspense fallback={<Loading />}>
        <FormComponent gasTypes={gasTypeQuery} methodologies={methodologyQuery} methodologyFields={methodologyFieldsQuery}/>
      </Suspense>
    </>
  );
}
