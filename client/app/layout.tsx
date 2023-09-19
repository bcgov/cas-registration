/* Components */
import { ReduxProvider } from "@/redux/provider";
import { Nav } from "./components/Nav";

/* Instruments */
import styles from "./styles/layout.module.css";
import "./styles/globals.css";
import Navigation from "./components/Layout/Navigation";
import Footer from "./components/Layout/Footer";
import footerLinks from "./data/dashboardLinks/footerLinks";
import BCGovTypography from "./components/BCGovTypography";

export default function RootLayout(props: React.PropsWithChildren) {
  return (
    <ReduxProvider>
      <html lang="en">
        <body>
          <section className={styles.container}>
            <Navigation user="Fred Penner" />
            <BCGovTypography />
            <main className={styles.main}>{props.children}</main>
          </section>
          <Footer links={footerLinks} />
        </body>
      </html>
    </ReduxProvider>
  );
}
