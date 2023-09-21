import { store } from "@/redux/index";
import { useGetUsersQuery } from "@/redux/index";
export default function Profile() {
  // 🌐 Get the user data directly from the Redux store when server side
  const userData = store.getState().auth;

  // 🧰 Destructure the query function and states using useGetUsersQuery
  const { data, isLoading, error } = useGetUsersQuery(null);

  // Initialize the content variable with an empty div
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
          rtk query to users api
        </span>
        <div>
          <ol>
            {/* Map over the data and display user names */}
            {data?.map((data, index) => (
              <li key={index}>{`${data.firstName} ${data.lastName}`}</li>
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
            Logged in: server side page
          </span>
          <form className="mb-4" action="/" method="post">
            <div className="mb-4 md:w-full">
              <label htmlFor="email" className="block text-xs mb-1">
                Username
              </label>
              <input
                className="w-full border rounded p-2 outline-none focus:shadow-outline"
                type="text"
                readOnly
                value={
                  userData
                    ? `${userData.user?.firstName} ${userData.user?.lastName}`
                    : ""
                }
              />
            </div>
            <div className="mb-6 md:w-full">
              <label htmlFor="password" className="block text-xs mb-1">
                Token
              </label>
              <input
                className="w-full border rounded p-2 outline-none focus:shadow-outline"
                type="text"
                readOnly
                value={userData ? `${userData.token}` : ""}
              />
            </div>
          </form>
          <div>{content}</div>
        </div>
      </div>
    </>
  );
}
