import {
  Tabs as MuiTabs,
  Tab as MuiTab,
  Box,
  TabsProps as MuiTabsProps,
} from "@mui/material";
import Link from "next/link";
import { BC_GOV_LINKS_COLOR } from "@bciers/styles/colors";

export interface TabItem {
  label: string;
  href: string;
}

export interface TabsProps extends Omit<MuiTabsProps, "children"> {
  tabs: TabItem[];
  activeTab: number;
}

export function Tabs({ tabs, activeTab, ...props }: TabsProps) {
  return (
    <Box sx={{ mt: "1rem" }}>
      <MuiTabs
        value={activeTab}
        {...props}
        sx={{
          "& .MuiTabs-indicator": {
            display: "none",
          },
          "& .MuiTab-root": {
            color: "#6B7280",
            textTransform: "none",
            fontSize: "20px",
            lineHeight: "24.2px",
            letterSpacing: "0%",
            padding: "0 1.5rem 0 0",
            minWidth: "auto",
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            "&.Mui-selected": {
              color: BC_GOV_LINKS_COLOR,
              fontWeight: 400,
              textDecoration: "underline",
              textDecorationStyle: "solid",
              textUnderlineOffset: "4px",
              textDecorationThickness: "1px",
              textDecorationColor: "rgba(26, 90, 150, 0.8)",
            },
          },
          ...props.sx,
        }}
      >
        {tabs.map((tab) => (
          <MuiTab
            key={tab.href}
            component={Link}
            href={tab.href}
            label={tab.label}
          />
        ))}
      </MuiTabs>
    </Box>
  );
}
