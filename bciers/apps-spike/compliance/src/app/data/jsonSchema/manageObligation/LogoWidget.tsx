import Image from "next/image";

import logo from "@bciers/img/src/BCID_CleanBC_rev_tagline_colour.svg";

export const LogoWidget = () => {
  return (
    <div className="w-full mt-[50px] mb-[40px]">
      <Image src={logo} alt="BC Clean BC Logo" width={234} height={50} />
    </div>
  );
};
