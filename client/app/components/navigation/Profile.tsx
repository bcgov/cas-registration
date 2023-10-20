import Link from "@mui/material/Link";

export default function Profile() {
  return (
    <>
      <Link
        href="/dashboard/profile"
        sx={{ color: "white", marginRight: "10px" }}
      >
        User
      </Link>
      <Link href="/" sx={{ color: "white" }}>
        Log out
      </Link>
    </>
  );
}
