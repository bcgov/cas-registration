import { reduxStore, setCredentials, increment } from "@/redux/index";
import styles from "../count.module.css";

export default function Page() {
  // mock user
  const auth = {
    user: { firstName: "SSR FN", lastName: "LN" },
    token: "SSRTOKEN",
  };
  // Convert the auth object to a JSON string
  const authString = JSON.stringify(auth);

  // 🌐 Direct store access server side
  reduxStore.dispatch(increment());
  reduxStore.dispatch(setCredentials(auth));
  return (
    <>
      <div className={styles.row}>Auth state set to {authString}</div>
      <div className={styles.row}>Count set to 1</div>
    </>
  );
}
