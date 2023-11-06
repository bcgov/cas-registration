import Box from "@mui/material/Box";

import { ReactNode } from "react";

type MainProps = {
  children: ReactNode;
};

const Main = ({ children }: MainProps) => {
  return (
    <Box
      component="main"
      sx={{
        width: "100%",
        minWidth: "100%",
        minHeight: "100%",
        maxWidth: "1536px",
        margin: {
          xs: "260px auto 180px auto",
          md: "180px auto 80px auto",
        },
        padding: "0 12px",
      }}
    >
      {children}
    </Box>
  );
};

export default Main;
