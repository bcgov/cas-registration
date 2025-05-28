import {
  Tabs as MuiTabs,
  Tab as MuiTab,
  TabsProps as MuiTabsProps,
} from "@mui/material";
import Link from "next/link";
import {
  BC_GOV_COMPONENTS_GREY,
  BC_GOV_LINKS_COLOR,
} from "@bciers/styles/colors";

export interface TabItem {
  label: string;
  href: string;
}

export interface TabsProps extends Omit<MuiTabsProps, "children"> {
  tabs: TabItem[];
  activeTab: number;
}

export function Tabs({ tabs, activeTab, ...props }: Readonly<TabsProps>) {
  return (
    <div className="mt-4">
      <MuiTabs
        value={activeTab}
        {...props}
        sx={{
          "& .MuiTabs-indicator": {
            display: "none",
          },
          "& .MuiTab-root": {
            color: BC_GOV_COMPONENTS_GREY,
            textTransform: "none",
            fontSize: "20px",
            padding: "0 1.5rem 0 0",
            fontFamily: "Inter, sans-serif",
            "&.Mui-selected": {
              color: BC_GOV_LINKS_COLOR,
              fontWeight: 400,
              textDecoration: "underline",
              textUnderlineOffset: "4px",
            },
          },
          ...props.sx,
        }}
        aria-label="compliance navigation tabs"
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
    </div>
  );
}
