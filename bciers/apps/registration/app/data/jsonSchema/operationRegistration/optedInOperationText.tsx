import {
  bcObpsLink,
  readinessConsiderationsLink,
  actLink,
  naicsLink,
  ggerrLink,
} from "@bciers/utils/src/urls";

const optedInOperationPreface = (
  <div>
    Complete the following fields to apply to be an Opt-in Operation in the B.C.
    OBPS. Ensure that you have read through{" "}
    <a href={bcObpsLink} target="_blank">
      our website
    </a>{" "}
    and{" "}
    <a href={readinessConsiderationsLink} target="_blank">
      Readiness Considerations
    </a>{" "}
    prior to applying.
  </div>
);

const meetsSection3EmissionsRequirementsText = (
  <span>
    Does this operation have emissions that are attributable for the purposes of
    section 3 of{" "}
    <a href={actLink} target="_blank">
      the Act
    </a>
    ?
  </span>
);

const meetsEntireOperationRequirementsText = (
  <span>
    Designation as an opt-in can only be granted to an entire operation (i.e.
    not a part or certain segment of an operation). Do you confirm that the
    operation applying for this designation is an entire operation?
  </span>
);

const meetsSection6EmissionsRequirementsText = (
  <span>
    Does this operation have emissions that are attributable for the purposes of
    section 6 of{" "}
    <a href={actLink} target="_blank">
      the Act
    </a>
    ?
  </span>
);

// using underscore between numbers made ESLint throw an error
const meetsNaicsCode1122562ClassificationRequirementsText = (
  <span>
    Is this operation&rsquo;s primary economic activity classified by the
    following{" "}
    <a href={naicsLink} target="_blank">
      NAICS Code - 11, 22, or 562?
    </a>
  </span>
);

const meetsProducingGgerScheduleA1RegulatedProductText = (
  <span>
    Does this operation produce a regulated product listed in Table 2 of
    Schedule A.1 of{" "}
    <a href={ggerrLink} target="_blank">
      the GGERR
    </a>
    ?
  </span>
);

const meetsReportingAndRegulatedObligationsText = (
  <span>
    Is this operation capable of fulfilling the obligations of a reporting
    operation and a regulated operation under{" "}
    <a href={actLink} target="_blank">
      the Act
    </a>{" "}
    and the regulations?
  </span>
);

const meetsNotificationToDirectorOnCriteriaChangeText = (
  <span>
    Will the operator notify the Director as soon as possible if this operation
    ceases to meet any of the criteria for the designation of the operation as a
    reporting operation and a regulated operation?
  </span>
);

export {
  optedInOperationPreface,
  meetsSection3EmissionsRequirementsText,
  meetsEntireOperationRequirementsText,
  meetsSection6EmissionsRequirementsText,
  meetsNaicsCode1122562ClassificationRequirementsText,
  meetsProducingGgerScheduleA1RegulatedProductText,
  meetsReportingAndRegulatedObligationsText,
  meetsNotificationToDirectorOnCriteriaChangeText,
};
