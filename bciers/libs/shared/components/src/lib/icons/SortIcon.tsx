interface SortIconProps {
  topFill?: string;
  bottomFill?: string;
}

const SortIcon = ({ topFill, bottomFill }: SortIconProps) => {
  return (
    <svg
      width="10"
      height="15"
      viewBox="0 0 10 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.32714 5.86914L0.672861 5.86914C0.0741596 5.86914 -0.225192 5.12087 0.198608 4.68235L4.52407 0.203175C4.78642 -0.0682907 5.21358 -0.0682907 5.47593 0.203175L9.80139 4.68235C10.2252 5.12087 9.92584 5.86914 9.32714 5.86914Z"
        fill={topFill || "white"}
      />
      <path
        d="M0.672861 9.13086H9.32714C9.92584 9.13086 10.2252 9.87913 9.80139 10.3176L5.47593 14.7968C5.21358 15.0683 4.78642 15.0683 4.52407 14.7968L0.198608 10.3176C-0.225193 9.87913 0.0741586 9.13086 0.672861 9.13086Z"
        fill={bottomFill || "white"}
      />
    </svg>
  );
};

export default SortIcon;
