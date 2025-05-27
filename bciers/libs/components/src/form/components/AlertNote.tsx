import { Paper } from "@mui/material";
import { ReactNode, FC } from "react";
import { AlertIcon } from "@bciers/components/icons";

interface AlertNoteProps {
  children: ReactNode;
  icon?: ReactNode;
}

const AlertNote: FC<AlertNoteProps> = ({
  children,
  icon = <AlertIcon width="25" height="25" />,
}) => {
  return (
    <Paper className="p-[16px] mb-[10px] bg-bc-light-blue text-bc-text">
      <div className="flex items-center gap-2">
        <div>{icon}</div>
        <p className="my-0 ml-[10px]">{children}</p>
      </div>
    </Paper>
  );
};

export default AlertNote;
