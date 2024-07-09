import Link from "next/link";

const ActionCellFactory = ({
  href,
  replace,
  className,
  cellText,
}: {
  href: string;
  replace: boolean;
  className: string;
  cellText: string;
}) => {
  return () => {
    const renderCell = () => {
      return (
        <div>
          <Link className={className} href={href} replace={replace}>
            {cellText}
          </Link>
        </div>
      );
    };

    return renderCell;
  };
};

export default ActionCellFactory;
