import { WidgetProps } from "@rjsf/utils";
import { useState } from "react";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const ReadOnlyComplianceEmissionFormula: React.FC<WidgetProps> = ({
  id,
  value,
  registry,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const handleClick = () => setOpen(!open);
  console.log(registry.formContext);
  const {
    emissions_attributable_for_compliance, // total
    emissions_attributable_for_reporting, // already have
    // cannot currently be allocated to emissions, refer to bc_obps/reporting/service/report_emission_allocation_service.py line 104
    // npnc_emissions,
  } = registry.formContext;

  const excluded_emissions_by_fuels = (
    Object.values(
      // 10, 11, 12
      registry.formContext.emission_summary_data.fuel_excluded,
    ) as number[]
  ).reduce((sum, val) => sum + val, 0);

  const fugitive_emissions =
    registry.formContext.emission_summary_data.emission_categories.fugitive;
  const non_useful_venting_emissions =
    registry.formContext.emission_summary_data.emission_categories
      .venting_non_useful;

  return (
    <div id={id} className="block w-full">
      <div
        className="hover:bg-bc-bg-hover"
        style={{ display: "flex", alignItems: "center" }}
        onClick={handleClick}
      >
        <CalculateOutlinedIcon />
        <span className=""> How was this calculated? </span>
        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </div>
      {open && (
        <div
          className="border-solid rounded-md border-bc-link-blue"
          style={{ padding: "10px", marginTop: "5px" }}
        >
          {/* top box */}
          <div className="bg-bc-bg-grey p-2 mb-2">
            <div className="font-bold">
              Emissions attributable for compliance{" "}
            </div>
            <div>
              = emissions attributable for reporting - excluded emissions by
              fuels - non-useful venting emissions - fugitive emissions -
              Remaining NPNC (NPNC emissions - emissions excluded by fuel,
              non-useful venting, fugitive)
            </div>
            <div>
              = {emissions_attributable_for_reporting ?? 0} -{" "}
              {excluded_emissions_by_fuels ?? 0} -{" "}
              {non_useful_venting_emissions ?? 0} - {fugitive_emissions ?? 0}{" "}
              {/* - ({npnc_emissions ?? 0}) */}- 0 (cannot currently be
              allocated to emissions (NPNC emissions))
            </div>
            <div className="font-bold">
              = {emissions_attributable_for_compliance} tCO2e
            </div>
          </div>

          {/* emissions attributable for reporting */}
          {/* <div>
            <div className="font-bold">Emissions attributable for reporting </div>
            <div>
              header
            </div>
            -
          </div> */}

          {/* Excluded emissions by fuels */}
          {/* <div>
            <div className="font-bold">Excluded emissions by fuels </div>
            <div>
              header
            </div>
            -
          </div> */}

          {/* Non-useful venting */}
          {/* <div>
            <div className="font-bold">Non-useful venting </div>
            <div>
              header
            </div>
            -
          </div> */}

          {/* Fugitive emissions */}
          {/* <div>
            <div className="font-bold">Fugitive emissions</div>
            <div>
              header
            </div>
            -
          </div> */}

          {/* Remaining NPNC */}
          {/* <div>
            <div className="font-bold">Remaining NPNC </div>
            <div>
              header
            </div>
            -
          </div> */}
        </div>
      )}
    </div>
  );
};

export default ReadOnlyComplianceEmissionFormula;
