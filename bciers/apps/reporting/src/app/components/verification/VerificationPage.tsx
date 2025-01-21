import { getReportVerification } from "@reporting/src/app/utils/getReportVerification";
import { getReportFacilityList } from "@reporting/src/app/utils/getReportFacilityList";
import { createVerificationSchema } from "@reporting/src/app/components/verification/createVerificationSchema";
import VerificationForm from "@reporting/src/app/components/verification/VerificationForm";
import {
  ActivePage,
  getSignOffAndSubmitSteps,
} from "@reporting/src/app/components/taskList/5_signOffSubmit";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";

// import { verificationSchema } from "@reporting/src/data/jsonSchema/verification/verification";
export default async function VerificationPage({
  version_id,
}: HasReportVersion) {
  // Determine operationType based on reportOperation
  // 🚀 Fetch the operation associated with the specified version ID
  const reportOperation = await getReportingOperation(version_id);
  const operationType =
    reportOperation &&
    reportOperation.report_operation.operation_type ===
      "Single Facility Operation"
      ? "SFO"
      : "LFO";

  // 🚀 Fetch initial form data
  const initialData = (await getReportVerification(version_id)) || {};

  // 🔄 Add properties conditionally based on operationType
  if (operationType === "LFO") {
    // Add the visit_names  property
    initialData.visit_names = (initialData.report_verification_visits || [])
      .filter((visit: { is_other_visit: boolean }) => !visit.is_other_visit)
      .map((visit: { visit_name: string }) => visit.visit_name);
    if (
      (initialData.report_verification_visits || []).some(
        (visit: { is_other_visit: boolean }) => visit.is_other_visit,
      )
    ) {
      initialData.visit_names.push("Other");
    }
    // Add the visit_types property
    initialData.visit_types = (initialData.report_verification_visits || [])
      .filter(
        (visit: { is_other_visit: boolean; visit_name: string }) =>
          !visit.is_other_visit && visit.visit_name !== "None",
      )
      .map((visit: { visit_name: string; visit_type: string }) => ({
        visit_name: visit.visit_name,
        visit_type: visit.visit_type,
      }));

    // Add the visit_others property
    initialData.visit_others = (
      initialData.report_verification_visits || []
    ).some((visit: { is_other_visit: boolean }) => visit.is_other_visit)
      ? (initialData.report_verification_visits || [])
          .filter((visit: { is_other_visit: boolean }) => visit.is_other_visit)
          .map(
            (visit: {
              visit_name: string;
              visit_coordinates: string;
              visit_type: string;
            }) => ({
              visit_name: visit.visit_name,
              visit_coordinates: visit.visit_coordinates,
              visit_type: visit.visit_type,
            }),
          )
      : [{}];
  } else {
    const visit = initialData.report_verification_visits?.[0];
    // Add the visit_names  property
    if (visit) {
      if (visit.is_other_visit) {
        initialData.visit_names = "Other";
      } else {
        initialData.visit_names = visit.visit_name;
      }
      // Add the visit_others property
      if (visit && !visit.is_other_visit && visit.visit_name !== "None") {
        initialData.visit_types = visit.visit_type;
      } else {
        initialData.visit_types = undefined;
      }
      // Add the visit_others property
      if (visit && visit.is_other_visit) {
        initialData.visit_others = [
          {
            visit_name: visit.visit_name,
            visit_coordinates: visit.visit_coordinates,
            visit_type: visit.visit_type,
          },
        ];
      } else {
        initialData.visit_others = [{}];
      }
    } else {
      initialData.visit_names = undefined;
      initialData.visit_types = undefined;
      initialData.visit_others = [{}];
    }
  }

  // 🚀 Fetch the list of facilities associated with the specified version ID
  const facilityList = await getReportFacilityList(version_id);

  // Create schema with dynamic facility list for operation type
  const verificationSchema = createVerificationSchema(
    facilityList.facilities,
    operationType,
  );

  //🔍 Check if reports need verification
  const needsVerification = await getReportNeedsVerification(version_id);
  const taskListElements = await getSignOffAndSubmitSteps(
    version_id,
    ActivePage.Verification,
    needsVerification,
  );

  // Render the verification form
  return (
    <>
      <VerificationForm
        version_id={version_id}
        operationType={operationType}
        verificationSchema={verificationSchema}
        initialData={initialData}
        taskListElements={taskListElements}
      />
    </>
  );
}
