"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  LoginResponse,
  useLoginMutation,
  RootState,
  setCredentials,
} from "@/redux/index";
import Profile from "@/components/user/Profile";

export default function Login() {
  // 🧰 Destructure the mutation function and states
  const [loginMutation, { isLoading, error }] = useLoginMutation();

  // 🚀 Get the custom typed dispatch function
  const dispatch = useDispatch();

  // 📝 Create state variables for form values
  const [email, setEmail] = useState("");
  // Narrow the type to FetchBaseQueryError
  const [password, setPassword] = useState("");

  // 🛡️ Get the user token from the Redux store
  const token = useSelector((state: RootState) => state.auth.token);

  // 🔑 use RTK Query mutation to call the login api
  const handleLogin = async () => {
    try {
      const response = await loginMutation({
        email, // Use the username state variable
        password, // Use the password state variable
      });

      if ("data" in response) {
        // Handle the success case
        const responseData: LoginResponse = response.data;
        // Dispatch the setCredentials action to store user and token in Redux store
        dispatch(
          setCredentials({
            user: responseData.user,
            token: responseData.token,
          })
        );
      } else {
        // Handle the RTK Query error (if available)
        if (error && typeof error === "object") {
          // Narrow the type to FetchBaseQueryError
          if ("status" in error) {
            // You can now access properties of FetchBaseQueryError
            const errMsg = JSON.stringify(error.data);
            console.error("RTK Query Error ❌:", error.status, errMsg);
          }
        }
      }
    } catch (error) {
      // Handle network or other unexpected errors
      console.error("Network Error 🌐:", error);
    }
  };

  return (
    <>
      {token ? ( // Check if the user is logged in
        <Profile /> // Display user profile SSR page
      ) : (
        <div className="flex items-center h-screen w-full">
          <div className="w-full bg-white rounded shadow-lg p-8 m-4 md:max-w-sm md:mx-auto">
            <span className="block w-full text-xl uppercase font-bold mb-4">
              Login: client side page
            </span>
            <form className="mb-4" action="/" method="post">
              <div className="mb-4 md:w-full">
                <label htmlFor="email" className="block text-xs mb-1">
                  Email
                </label>
                <input
                  className="w-full border rounded p-2 outline-none focus:shadow-outline"
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Enter Any Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
              </div>
              <div className="mb-6 md:w-full">
                <label htmlFor="password" className="block text-xs mb-1">
                  Password
                </label>
                <input
                  className="w-full border rounded p-2 outline-none focus:shadow-outline"
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Enter Any Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
              </div>
              <button
                className="bg-green-500 hover:bg-green-700 text-white uppercase text-sm font-semibold px-4 py-2 rounded"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? "Logging In..." : "Login 🔑"}
              </button>
            </form>
            {error ? (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                {"status" in error && error.status ? ( // Handle the RTK Query error (if available)
                  <div>
                    Error Status: {error.status}
                    <br />
                    Error Data: {JSON.stringify(error.data)}
                  </div>
                ) : (
                  <div>Error ❌</div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
