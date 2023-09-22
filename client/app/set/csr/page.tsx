"use client";
import {
  countSlice,
  useGetUsersQuery,
  useSelector,
  useDispatch,
  selectCount,
} from "@/redux";

import Login from "@/components/auth/Login";
import styles from "../count.module.css";

export default function Page() {
  const dispatch = useDispatch();
  const count = useSelector(selectCount);

  // 🧰 Destructure the query function and states using useGetUsersQuery
  const { data, isLoading, error } = useGetUsersQuery(null);

  // Load user data into a content div
  let content = <div></div>;
  // Check if data is currently loading
  if (isLoading) {
    // If data is loading, update content to display a loading message
    content = <div>🚀 Loading data... </div>;
  }
  // Check if an error occurred
  if (error) {
    // If an error occurred, update content to display an error message
    content = <div>Something went wrong, Please retry after some time</div>;
  }
  // Check if data has been successfully fetched
  if (data) {
    // If data is available, update content to display the fetched user data
    content = (
      <>
        <span className="block w-full text-xl uppercase font-bold mb-4">
          State for user set with useGetUsersQuery hook
        </span>
        <div>
          <ol>
            {/* Map over the data and display user names */}
            {data.map((d, index) => (
              <li key={index}>{`${d.firstName} ${d.lastName}`}</li>
            ))}
          </ol>
        </div>
      </>
    );
  }

  return (
    <>
      <div>{content}</div>

      <div className={styles.row}>
        <span className="block w-full text-xl uppercase font-bold mb-4">
          State for count:
        </span>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={() => dispatch(countSlice.actions.decrement())}
        >
          -
        </button>
        <span className={styles.value}>{count}</span>
        <button
          className={styles.button}
          aria-label="Increment value"
          onClick={() => dispatch(countSlice.actions.increment())}
        >
          +
        </button>
      </div>

      <Login />
    </>
  );
}
