"use client";

import { DateWidget } from "../form/widgets";
import { CookiesProvider, useCookies } from "react-cookie";

const MockTimePicker: React.FC = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["mock-time"]);

  return (
    <>
      <DateWidget
        id="test"
        name="test"
        schema={{}}
        value={cookies["mock-time"]}
        options={{}}
        onBlur={() => {}}
        onChange={(d) => {
          setCookie("mock-time", d);
        }}
        onFocus={() => {}}
        label="test"
        registry={{} as any}
      />
      <button onClick={() => removeCookie("mock-time")}>Clear</button>
    </>
  );
};

const Stuff = () => (
  <CookiesProvider>
    <MockTimePicker />
  </CookiesProvider>
);

export default Stuff;
