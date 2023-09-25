import { reduxStore } from "@/redux/index";

export default function Page() {
  // 🌐 Get the data directly from the Redux store when server side
  const authState = reduxStore.getState().auth;
  const count = reduxStore.getState().count.value;
  return (
    <>
      <div className="flex items-center h-screen w-full">
        <div className="w-full bg-white rounded shadow-lg p-8 m-4 md:max-w-sm md:mx-auto">
          <span className="block w-full text-xl uppercase font-bold mb-4">
            Server side page
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
                value={
                  authState
                    ? `${authState.user?.firstName} ${authState.user?.lastName}`
                    : ""
                }
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
                value={authState ? `${authState.token}` : ""}
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
        </div>
      </div>
    </>
  );
}
