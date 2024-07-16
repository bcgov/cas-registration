"use client";

import { Button, Grid } from "@mui/material";
import { signIn } from "next-auth/react";
import Main from "@bciers/components/layout/Main";
// eslint-disable-next-line import/extensions
import Logo from "@bciers/img/src/BCID_CleanBC_rev_tagline_colour.svg";
import Image from "next/image";

import TaskList from "@bciers/components/form/components/TaskList";

export default function Index() {
  const handleIdirLogin = () => {
    signIn("keycloak", undefined, { kc_idp_hint: "idir" });
  };

  const handleBceidLogin = () => {
    signIn("keycloak", undefined, { kc_idp_hint: "bceidbusiness" });
  };

  const items = [
    {
      section: "test",
      title: "object 1",
    },
    {
      section: "test",
      title: "object 2",
    },
    { section: "test2", title: "aaa" },
  ];
  const status = {
    test: true,
    test2: false,
  };

  return (
    <Main>
      <Image src={Logo} alt="testing" width="200" height="43" />
      <TaskList taskListItems={items} taskListItemStatus={status}></TaskList>
    </Main>
  );
}
