// This file configures the initialization of Raygun on the server.
// The config you add here will be used whenever the server handles a request.
// POC for replacing Sentry with Raygun.
// Import the raygun wrapper module for server-side error reporting
// This can be used in getStaticProps/getServerSideProps/server actions
import { raygun } from "../../../raygun";

// Example: You can use raygun.send() in server-side functions
// if (raygun) {
//   raygun.send(new Error("Server error"), {}, { app: "reporting" });
// }
