interface Props {
  classNames?: string;
  style?: any;
  label: string;
  value: string;
}

export const InfoRow = ({ classNames, label, value, style }: Props) => {
  return (
    <div
      className={classNames || ""}
      style={{
        width: "100%",
        display: "flex",
        marginBottom: "10px",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: "16px",
          width: "240px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: "16px",
          textAlign: "right",
          marginLeft: "10px",
        }}
      >
        {value}
      </div>
    </div>
  );
};
