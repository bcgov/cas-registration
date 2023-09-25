"use client";
import {
  selectCount,
  selectUserToken,
  selectUser,
  selectUserData,
  useSelector,
} from "@/redux/index";

export default function Page() {
  // 🎯 Get Redux selector functions that retrieves specific data from the Redux store
  const count = useSelector(selectCount);
  const token = useSelector(selectUserToken) || "";
  const user = useSelector(selectUser);
  const users = useSelector(selectUserData);

  // Load user data into a content div
  let content = <div></div>;
  if (users) {
    // If data is available, update content to display the fetched user data
    content = (
      <>
        <span className="block w-full text-xl uppercase font-bold mb-4">
          State of user from selectUserData hook
        </span>
        <div>
          <ol>
            {/* Map over the data and display user names */}
            {users.map((u, index) => (
              <li key={index}>{`${u.firstName} ${u.lastName}`}</li>
            ))}
          </ol>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center h-screen w-full">
        <div className="w-full bg-white rounded shadow-lg p-8 m-4 md:max-w-sm md:mx-auto">
          <span className="block w-full text-xl uppercase font-bold mb-4">
            Client side page
          </span>
          <form className="mb-4" action="/" method="post">
            <div className="mb-4 md:w-full">
              <label htmlFor="email" className="block text-xs mb-1">
                User Name
              </label>
              <input
                className="w-full border rounded p-2 outline-none focus:shadow-outline"
                type="text"
                readOnly
                value={user ? `${user.firstName} ${user.lastName}` : ""}
              />
            </div>
            <div className="mb-4 md:w-full">
              <label htmlFor="email" className="block text-xs mb-1">
                User Token
              </label>
              <input
                className="w-full border rounded p-2 outline-none focus:shadow-outline"
                type="text"
                readOnly
                value={token}
              />
            </div>
            <div className="mb-4 md:w-full">
              <label htmlFor="email" className="block text-xs mb-1">
                Count
              </label>
              <input
                className="w-full border rounded p-2 outline-none focus:shadow-outline"
                type="text"
                readOnly
                value={count}
              />
            </div>
          </form>
          <div>{content}</div>
        </div>
      </div>
    </>
  );
}
