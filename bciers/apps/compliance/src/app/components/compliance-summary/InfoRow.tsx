import { Box } from "@mui/material";

interface Props {
  classNames?: string;
  style?: any;
  label: string;
  value: string;
}

export const InfoRow = ({ classNames, label, value, style }: Props) => {
  return (
    <Box className={`w-full flex mb-2.5 ${classNames}`} style={style}>
      <Box className="flex items-center text-sm w-60">{label}</Box>
      <Box className="flex items-center text-sm text-right ml-2.5">{value}</Box>
    </Box>
  );
};
