// Import the ReduxProvider from the Redux context provider
import { ReduxProvider } from "@/redux/provider";

// Import CSS modules for styling
import styles from "./styles/layout.module.css";

// Import global styles
import "./styles/globals.css";

// Define the RootLayout component
export default function RootLayout(props: React.PropsWithChildren) {
  return (
    // Wrap the content in the ReduxProvider to provide access to Redux state
    <ReduxProvider>
      <html lang="en">
        <body>
          {/* Create a container with styles for layout */}
          <section className={styles.container}>
            {/* Main content area */}
            <main className={styles.main}>{props.children}</main>
          </section>
        </body>
      </html>
    </ReduxProvider>
  );
}
