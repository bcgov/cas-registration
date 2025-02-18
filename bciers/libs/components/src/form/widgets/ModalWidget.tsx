"use client";

import { TextField } from "@mui/material";
import { WidgetProps } from "@rjsf/utils/lib/types";
import {
  DARK_GREY_BG_COLOR,
  BC_GOV_SEMANTICS_RED,
} from "@bciers/styles/colors";
import { useState } from "react";
import SelectWidget from "./SelectWidget";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import ComboBox from "./ComboBox";

const ModalWidget: React.FC<WidgetProps> = (props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [pendingPurpose, setPendingPurpose] = useState("");
  console.log("props.value", props.value);
  const [confirmedPurpose, setConfirmedPupose] = useState(
    props.value || undefined,
  );

  const handleChange = (e: any, option: any) => {
    setModalIsOpen(true);
    setConfirmedPupose(undefined);
    setPendingPurpose(e);
    console.log("e", e);
    props.onChange(confirmedPurpose || pendingPurpose);
    console.log("option", option);
  };

  const cancelRegistrationPurposeChange = () => {
    // setPendingChangeRegistrationPurpose("");
    // handleSelectedPurposeChange({section1:{registration_purpose: }})
    setModalIsOpen(false);
  };

  const confirmRegistrationPurposeChange = () => {
    // if (pendingChangeRegistrationPurpose !== "") {
    //   setSelectedPurpose(pendingChangeRegistrationPurpose);
    // }
    // setPendingChangeRegistrationPurpose("");
    setConfirmedPupose(pendingPurpose);
    setModalIsOpen(false);
  };

  return (
    <>
      <SimpleModal
        title="Confirmation"
        open={modalIsOpen}
        onCancel={cancelRegistrationPurposeChange}
        onConfirm={confirmRegistrationPurposeChange}
        confirmText="Change registration purpose"
      >
        Are you sure you want to change your registration purpose? If you
        proceed, all of the form data you have entered will be lost.
      </SimpleModal>

      <ComboBox {...props} onChange={handleChange} value={confirmedPurpose} />
    </>
  );
};
export default ModalWidget;
