const optedInOperationPreface = (
  <div>
    Complete the following fields to apply to be an Opt-in Operation in the B.C.
    OBPS. Ensure that you have read through{" "}
    <a
      href="https://www2.gov.bc.ca/gov/content/environment/climate-change/industry/bc-output-based-pricing-system"
      target="_blank"
    >
      our website
    </a>{" "}
    and{" "}
    <a
      href="https://www2.gov.bc.ca/assets/gov/environment/climate-change/ind/obps/guidance/readiness_considerations_for_opted-in_operations.pdf"
      target="_blank"
    >
      Readiness Considerations
    </a>{" "}
    prior to applying.
  </div>
);

const hasEmissionsForSection3Text = (
  <span>
    Does this operation have emissions that are attributable for the purposes of
    section 3 of{" "}
    <a
      href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01"
      target="_blank"
    >
      the Act
    </a>
    ?
  </span>
);

const isEntireOperationOptedInForDesignationText = (
  <span>
    Designation as an opt-in can only be granted to an entire operation (i.e.
    not a part or certain segment of an operation). Do you confirm that the
    operation applying for this designation is an entire operation?
  </span>
);

const hasEmissionsForSection6Text = (
  <span>
    Does this operation have emissions that are attributable for the purposes of
    section 6 of{" "}
    <a
      href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01"
      target="_blank"
    >
      the Act
    </a>
    ?
  </span>
);

const primaryEconomicActivityText = (
  <span>
    Is this operation&rsquo;s primary economic activity classified by the
    following{" "}
    <a
      href="https://www.statcan.gc.ca/en/subjects/standard/naics/2022/v1/index"
      target="_blank"
    >
      NAICS Code - 11, 22, or 562?
    </a>
  </span>
);

const producesRegulatedProductInGgerrText = (
  <span>
    Does this operation produce a regulated product listed in Table 1 of
    Schedule A.1 of{" "}
    <a
      href="https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015"
      target="_blank"
    >
      the GGERR
    </a>
    ?
  </span>
);

const isCapableOfFulfillingReportingAndRegulatedObligationsText = (
  <span>
    Is this operation capable of fulfilling the obligations of a reporting
    operation and a regulated operation under the{" "}
    <a
      href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01"
      target="_blank"
    >
      Act
    </a>{" "}
    and the regulations?
  </span>
);

const willNotifyDirectorIfCriteriaNotMetText = (
  <span>
    Will the operator notify the Director as soon as possible if this operation
    ceases to meet any of the criteria for the designation of the operation as a
    reporting operation and a regulated operation?
  </span>
);

export {
  optedInOperationPreface,
  hasEmissionsForSection3Text,
  isEntireOperationOptedInForDesignationText,
  hasEmissionsForSection6Text,
  primaryEconomicActivityText,
  producesRegulatedProductInGgerrText,
  isCapableOfFulfillingReportingAndRegulatedObligationsText,
  willNotifyDirectorIfCriteriaNotMetText,
};
