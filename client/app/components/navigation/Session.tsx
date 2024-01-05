import Login from "@/app/components/navigation/Login";
import Profile from "@/app/components/navigation/Profile";
import { useSession } from "next-auth/react";
import { getUserFullName } from "@/app/utils/getUserFullName";

// 🏗️ Component to manage session based navigation
export default function Session() {
  // 👤 Use NextAuth.js hook to get information about the user's session
  //  Destructuring assignment from data property of the object returned by useSession()
  const { data: session, status } = useSession();

  const profileName = getUserFullName(session);

  if (status === "loading") {
    //👇️ Handle loading state (e.g., show a loading spinner).
    return <div>Loading...</div>;
  } else if (!session) {
    //👇️ Handle unauthenticated state (e.g., show a "Sign In" button).
    return <Login />;
  } else {
    //👇️ Handle authenticated state (e.g., display user information).
    // You can access the user session data through the 'session' variable.
    return <Profile name={profileName} />;
  }
}
