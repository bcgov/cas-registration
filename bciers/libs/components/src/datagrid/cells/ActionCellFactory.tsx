import React from "react";
import Link from "next/link";
import { GridRenderCellParams } from "@mui/x-data-grid";
import Tooltip from "@mui/material/Tooltip";

const ActionCellFactory = ({
  generateHref,
  cellText,
  useWindowLocation = false,
  IconComponent,
  openInNewTab = false,
  tooltipText,
}: {
  generateHref: (params: GridRenderCellParams) => string;
  cellText: string;
  useWindowLocation?: boolean;
  IconComponent?: JSX.Element;
  openInNewTab?: boolean;
  tooltipText?: string;
}) => {
  const renderCell = (params: GridRenderCellParams) => {
    const href = generateHref(params);
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (openInNewTab) {
        // open in a new tab instead of changing window.location
        window.open(href, "_blank", "noopener,noreferrer");
      } else {
        // Use this to get around issues with shared datagrids and links to other apps/zones
        // ie registration app to administration app
        window.location.href = href;
      }
    };
    return (
      <Link
        className="action-cell-text"
        onClick={useWindowLocation ? handleClick : undefined}
        href={href}
      >
        {tooltipText ? (
          <Tooltip className="flex align-center" title={tooltipText}>
            <>
              {cellText}
              {IconComponent}
            </>
          </Tooltip>
        ) : (
          <>
            {cellText}
            {IconComponent}
          </>
        )}
      </Link>
    );
  };
  return renderCell;
};

export default ActionCellFactory;
