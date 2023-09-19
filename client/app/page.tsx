/* Components */
import BCGovTypography from "./components/BCGovTypography";
import { Counter } from "./components/Counter/Counter";
import Footer from "./components/Layout/Footer";
import Navigation from "./components/Layout/Navigation";
import footerLinks from "./data/dashboardLinks/footerLinks";

export default function Page() {
  return (
    <>
      <h1>👉 Demo SSR Page with a...</h1>
      <Counter />
    </>
  );
}
