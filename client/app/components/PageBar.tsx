import { AppBar, Toolbar, Typography } from "@mui/material";

interface BarProps {
  label: JSX.Element;
}

const PageBar: React.FC<BarProps> = ({ label }) => {
  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "primary.light" }}
      enableColorOnDark
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {label}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default PageBar;
