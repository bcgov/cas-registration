import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles";

interface Props {
  classNames?: string;
  style?: any;
  label: string;
}
export const TitleRow = ({ classNames, style, label }: Props) => {
  return (
    <div
      style={{
        width: "100%",
        marginTop: "0",
        marginBottom: "10px",
        color: BC_GOV_BACKGROUND_COLOR_BLUE,
        fontSize: "16px",
        fontWeight: "normal",
        ...style,
      }}
      className={classNames || ""}
    >
      {label}
    </div>
  );
};
