import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center text-bc-gov-links-color">
      <h2>Not found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">Return Home</Link>
    </div>
  );
};

export default NotFound;
