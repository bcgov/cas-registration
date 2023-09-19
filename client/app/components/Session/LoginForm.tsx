import React from "react";
import { Button } from "@button-inc/bcgov-theme";

const LoginForm: React.FC = () => {
  return (
    <>
      <form id="login-buttons" action={"/login"} method="post">
        <Button type="submit" variant={"secondary"}></Button>
      </form>
      <style jsx>{`
        #login-buttons {
          margin: 0px;
        }
      `}</style>
    </>
  );
};

export default LoginForm;
