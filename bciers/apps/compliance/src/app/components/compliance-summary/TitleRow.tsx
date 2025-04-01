import { Box } from "@mui/material";

interface Props {
  classNames?: string;
  style?: any;
  label: string;
}
export const TitleRow = ({ classNames, style, label }: Props) => {
  return (
    <Box
      style={style}
      className={`w-full my-8 text-bc-bg-blue text-base font-normal mt-0 mb-2.5 typography-body2 ${classNames}`}
    >
      {label}
    </Box>
  );
};
