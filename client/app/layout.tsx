import { ReduxProvider } from "@/redux/provider";
import styles from "@/styles/layout.module.css";
import { NavClient } from "@/components/navigation/NavClient";
import { NavServer } from "@/components/navigation/NavServer";
import "@/styles/globals.css";

/*UI component that is shared between multiple pages in an application.
It allows us to define a common structure and appearance for a group of pages, reducing redundancy and promoting code reusability*/
export default function RootLayout(props: React.PropsWithChildren) {
  return (
    // Wrap the content in the ReduxProvider to provide access to Redux state
    <ReduxProvider>
      <html lang="en">
        <body>
          {/* Create a container with styles for layout */}
          {/* Main content area */}
          <section className={styles.container}>
            <NavClient />
            <NavServer />
            <main className={styles.main}>{props.children}</main>
          </section>
        </body>
      </html>
    </ReduxProvider>
  );
}
