import { ReduxProvider } from "@/redux/provider";
import ReduxReset from "@/components/redux/Reset";
import styles from "@/styles/layout.module.css";
import { NavClient } from "@/components/navigation/NavClient";
import { NavServer } from "@/components/navigation/NavServer";
import "@/styles/globals.css";
import { reduxStore, resetCount } from "@/redux/index";

/*UI component that is shared between multiple pages in an application. 
It allows us to define a common structure and appearance for a group of pages, reducing redundancy and promoting code reusability*/
export default function RootLayout(props: React.PropsWithChildren) {
  return (
    // Wrap the content in the ReduxProvider to provide access to Redux state
    <ReduxProvider>
      <html lang="en">
        <body>
          {/* Add the ReduxReset to clear the store to prevent data leakage potentially caused by server side direct access to the redux store */}
          <ReduxReset />
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
