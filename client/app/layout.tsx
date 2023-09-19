/* Components */
import { ReduxProvider } from "@/redux/provider";
import { Nav } from "./components/Nav";

/* Instruments */
import styles from "./styles/layout.module.css";
import "./styles/globals.css";

export default function RootLayout(props: React.PropsWithChildren) {
  return (
    <ReduxProvider>
      <html lang="en">
        <body>
          <section className={styles.container}>
            <Nav />
            <main className={styles.main}>{props.children}</main>
          </section>
        </body>
      </html>
    </ReduxProvider>
  );
}
