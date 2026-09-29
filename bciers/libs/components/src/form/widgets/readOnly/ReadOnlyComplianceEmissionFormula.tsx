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

  const formula_table_data = registry.formContext.formula_explanation_data;

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
          {/* simply every kind of emission */}

          {/* Excluded emissions by fuels */}
          <div className="mt-4 mb-3">
            <div className="font-bold text-xl">Excluded emissions by fuels </div>
            <div className="flex w-full font-bold">
              <div className="flex-1">Activity</div>
              <div className="flex-1">Source Type</div>
              <div className="flex-1">Fuel Name</div>
              <div className="flex-1">Emissions</div>
            </div>

            {formula_table_data.excluded_emissions.map((item: any, index: number) => (
              <div key={index} className="flex w-full mt-2">
                <div className="flex-1">{item.activity ?? "-"}</div>
                <div className="flex-1">{item.source_type ?? "-"}</div>
                <div className="flex-1">{item.fuel_type ?? "-"}</div>
                <div className="flex-1">{item.emission ?? "-"}</div>
              </div>
            ))}
          </div>

          {/* Non-useful venting */}
          <div className="mt-4 mb-3">
            <div className="font-bold text-xl">Non-useful venting </div>
            <div className="flex w-full font-bold">
              <div className="flex-1">Activity</div>
              <div className="flex-1">Source Type</div>
              <div className="flex-1">Fuel Name</div>
              <div className="flex-1">Emissions</div>
            </div>

            {formula_table_data.venting_non_useful.map((item: any, index: number) => (
              <div key={index} className="flex w-full mt-2">
                <div className="flex-1">{item.activity ?? "-"}</div>
                <div className="flex-1">{item.source_type ?? "-"}</div>
                <div className="flex-1">{item.fuel_type ?? "-"}</div>
                <div className="flex-1">{item.emission ?? "-"}</div>
              </div>
            ))}
          </div>

          {/* Fugitive emissions */}
          <div className="mt-4 mb-3">
            <div className="font-bold text-xl">Fugitive emissions </div>
            <div className="flex w-full font-bold">
              <div className="flex-1">Activity</div>
              <div className="flex-1">Source Type</div>
              <div className="flex-1">Fuel Name</div>
              <div className="flex-1">Emissions</div>
            </div>

            {formula_table_data.fugitive.map((item: any, index: number) => (
              <div key={index} className="flex w-full mt-2">
                <div className="flex-1">{item.activity ?? "-"}</div>
                <div className="flex-1">{item.source_type ?? "-"}</div>
                <div className="flex-1">{item.fuel_type ?? "-"}</div>
                <div className="flex-1">{item.emission ?? "-"}</div>
              </div>
            ))}
          </div>

          {/* Remaining NPNC */}
          <div className="mt-4 mb-3">
            <div className="font-bold text-xl">Remaining NPNC </div>
            <div className="flex w-full font-bold">
              <div className="flex-1">Activity</div>
              <div className="flex-1">Source Type</div>
              <div className="flex-1">Fuel Name</div>
              <div className="flex-1">Emissions</div>
            </div>

            <div className="flex w-full mt-2">
              <p className="flex-1 text-red-500">Cannot currently be allocated to emissions</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadOnlyComplianceEmissionFormula;
