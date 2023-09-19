"use client";

import Image from "next/legacy/image";
import LoginForm from "../Session/LoginForm";
import LogoutForm from "../Session/LogoutForm";
import { BaseNavigation } from "@button-inc/bcgov-theme/esm/Navigation";
import { BaseHeader } from "@button-inc/bcgov-theme/esm/Header";
import Grid from "@button-inc/bcgov-theme/Grid";

interface Props {
  isLoggedIn?: boolean;
  title?: string;
  user?: any;
}

const DEFAULT_MOBILE_BREAK_POINT = "900";

const Navigation: React.FC<Props> = ({
  isLoggedIn = true,
  title = "OBPS Registration App",
  user,
}) => {
  let rightSide = null;

  if (isLoggedIn) {
    rightSide = (
      <>
        <>
          <Grid className="name-display" justify="end">
            <Grid.Row>{user}</Grid.Row>
            <Grid.Row>{"fake email"}</Grid.Row>
          </Grid>
          <style jsx>{`
            :global(.name-display) {
              margin-right: 20px;
            }
          `}</style>
        </>
        <LogoutForm />
      </>
    );
  } else {
    rightSide = (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "1.25em",
        }}
      >
        <LoginForm />
      </div>
    );
  }

  return (
    <>
      <BaseNavigation>
        <BaseHeader>
          <BaseHeader.Group className="banner">
            {/*
              We don't want a front end navigation here,
              to ensure that a back-end redirect is performed when clicking on the banner image
            */}
            <a href={"/"}>
              <Image
                priority
                src="/img/BCID_CleanBC_rev_tagline_colour.svg"
                alt="logo for Province of British Columbia CleanBC"
                height={50}
                width={300}
              />
            </a>
          </BaseHeader.Group>
          <BaseHeader.Item collapse={DEFAULT_MOBILE_BREAK_POINT}>
            <h1>{title}</h1>
          </BaseHeader.Item>
          <BaseHeader.Group
            style={{
              marginLeft: "auto",
              marginBottom: "auto",
              marginTop: "auto",
            }}
          >
            {rightSide}
          </BaseHeader.Group>
        </BaseHeader>
      </BaseNavigation>
      <style jsx>{`
        h1 {
          font-weight: normal;
          margin-top: 10px;
        }
      `}</style>
    </>
  );
};

export default Navigation;
