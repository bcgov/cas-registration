"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Profile from "@bciers/components/navigation/Profile";
// eslint-disable-next-line import/extensions
import Logo from "@bciers/img/src/BCID_CleanBC_rev_tagline_colour.svg";
import HelpDrawer from "./HelpDrawer";

export default function Header() {
  const { data: session } = useSession();

  const bgColour =
    process.env.NODE_ENV === "development"
      ? "bg-bc-development-pink"
      : "bg-bc-primary-blue";

  return (
    <header className={`relative w-full`}>
      <div
        className={`${bgColour} relative left-1/2 transform -translate-x-1/2 w-screen max-w-none`}
      >
        <div className={`max-w-page mx-auto padding-page py-3 h-fit text-lg`}>
          <div className="flex items-center w-full">
            <Link href="/" passHref>
              <Image
                src={Logo}
                alt="Logo for Province of British Columbia CleanBC"
                width="200"
                height="43"
              />
            </Link>
            <h1 className="text-white font-bold cursor-default ml-6 flex-grow text-xs p-1 sm:text-xl md:text-[28px] md:p-0">
              B.C. Industrial Emissions Reporting System
            </h1>
            <div className="hidden md:flex">
              <HelpDrawer />
              {/* 👇️ Authentication content for laptop & desktop */}
              {session && <Profile />}
            </div>
          </div>
          <div className="flex justify-start md:hidden">
            <HelpDrawer />
            {/* 👇️ Authentication content for mobile & tablet */}
            {session && <Profile />}
          </div>
        </div>
      </div>
    </header>
  );
}
