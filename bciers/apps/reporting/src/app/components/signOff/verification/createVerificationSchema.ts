import { RJSFSchema } from "@rjsf/utils";
import { verificationSchema } from "@reporting/src/data/jsonSchema/signOff/verification/verification";
import { getReportFacilityList } from "@reporting/src/app/utils/getReportFacilityList";

export const createVerificationSchema = async (
  version_id: number, // The version ID to retrieve the facility list for
): Promise<RJSFSchema> => {
  try {
    // Retrieve a local copy of the base verification schema based on operation type
    const localSchema = verificationSchema;
    // Fetch the list of facilities associated with the specified version ID
    const reportFacilities = await getReportFacilityList(version_id);
    if (reportFacilities?.error) {
      throw new Error(
        `Unable to find report facility information for version ID: ${version_id}.`,
      );
    }
    // Get facilities list and append "Other" and "None" options
    const facilitiesEnum = [
      ...(reportFacilities?.facilities || []),
      "Other",
      "None",
    ];

    // Dynamically populate the "visited_facilities" field's enum with the retrieved facilities
    (localSchema.properties?.visit_name as any).enum = facilitiesEnum;

    // Return the customized schema.
    return localSchema;
  } catch (error) {
    throw error;
  }
};
