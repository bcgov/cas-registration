import Link from "next/link";

const OperatorsActionCell = () => {
  const renderCell = () => {
    const actionText = "View Details";
    return (
      <div>
        {/* 🔗 Add link with href query parameter with row's descriptive text*/}
        <Link
          className="action-cell-text"
          href={{
            pathname: "tbd/for1699",
          }}
        >
          {actionText}
        </Link>
      </div>
    );
  };

  return renderCell;
};

export default OperatorsActionCell;
