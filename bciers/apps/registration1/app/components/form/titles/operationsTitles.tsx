import { bcObpsLink } from "@bciers/utils/src/urls";

export const PointOfContactTitle = (
  <>
    Please provide information about the <b>point of contact</b> of the B.C.
    OBPS Regulated Operation ID application.
  </>
);

export const OptInOperationTitle = (
  <div className="max-w-2xl">
    Operations within regulated sectors that emit less than 10,000 tonnes CO2e
    per year may voluntarily opt-in to the B.C. OBPS.
    <br />
    <br />
    Operators of industrial operations that intend to apply to be an opted-in
    operation must submit an application form by email which is available on our
    website.
    <br />
    <br />
    Operations that emit greater than 10,000 tonnes CO2e per year are required
    to participate and are not considered opt ins.
    <br />
    <br />
    Further information and opt-in application forms can be found on the &nbsp;
    <a href={bcObpsLink} target="_blank" rel="noopener noreferrer">
      B.C. OBPS website
    </a>
    .
  </div>
);

export const StatutoryDeclarationDisclaimerTitle = (
  <>
    <b>Please note:</b>
    <br />
    <ul className="mt-0">
      <li>
        the information in this application is being collected for registration
        of the operation under GGIRCA and may be disclosed to the Ministry of
        Finance for the administration and enforcement of the Carbon Tax Act.
      </li>
      <li>
        the BC OBPS Regulated Operation ID (BORO ID) will be required for
        claiming exemption from paying carbon tax on fuel that is subject to an
        OBPS compliance obligation. BORO IDs used for claiming the exemption
        will be disclosed to fuel suppliers.
      </li>
    </ul>
  </>
);

export const StatutoryDeclarationUploadFieldTitle = (
  <>
    Statutory Declaration
    <br />
    <span className="font-normal">
      (Download{" "}
      <a
        href="https://www2.gov.bc.ca/assets/gov/environment/climate-change/ind/obps/forms/boro_id_statutory_declaration_form.pdf"
        target="_blank"
        rel="noopener noreferrer"
      >
        template
      </a>
      )
    </span>
  </>
);
