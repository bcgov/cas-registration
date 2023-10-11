import { AppBar, Toolbar, Typography } from "@mui/material";

interface BarProps {
  label: JSX.Element;
}

const PageBar: React.FC<BarProps> = ({ label }) => {
  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {label}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default PageBar;
