import Link from "next/link";
const FacilitiesActionCell = () => {
  const renderCell = () => {
    return (
      <div>
        {/* 🔗 Add link with href query parameter with row's descriptive text*/}
        <Link
          className="no-underline text-bc-link-blue whitespace-normal"
          href="#"
          replace={true}
        >
          View Details
        </Link>
      </div>
    );
  };

  return renderCell;
};

export default FacilitiesActionCell;
