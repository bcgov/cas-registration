import TextField from "@mui/material/Input";

const HeaderSearchCell = ({
  onChange,
}: {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  params: any;
}) => {
  return (
    <div className="w-full flex items-center background-black">
      <TextField
        className="w-full px-2 py-1"
        placeholder="Search"
        onChange={onChange}
        type="text"
        sx={{
          backgroundColor: "white",
        }}
      />
    </div>
  );
};

export default HeaderSearchCell;
