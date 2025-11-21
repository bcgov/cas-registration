"use client";

import { Button } from "@mui/material";
import { DateWidget } from "../form/widgets";
import { CookiesProvider, useCookies } from "react-cookie";
import { useRouter } from "next/navigation";

const MockTimePicker: React.FC = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["mock-time"]);
  const router = useRouter();

  const dateWidgetProps: any = {
    value: cookies["mock-time"],
    onChange: (d: string) => {
      setCookie("mock-time", d);
      router.refresh();
    },
  };

  const onClear = () => {
    removeCookie("mock-time");
    router.refresh();
  };

  return (
    <>
      <DateWidget {...dateWidgetProps} />
      <Button variant="contained" className="bg-bc-bg-blue" onClick={onClear}>
        Clear
      </Button>
    </>
  );
};

const WithCookiesProvider = () => (
  <CookiesProvider>
    <MockTimePicker />
  </CookiesProvider>
);

export default WithCookiesProvider;
