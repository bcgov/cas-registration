import Inbox from "@/app/components/icons/Inbox";

const myOperator = {
  title: "My Operator",
  icon: Inbox,
  content:
    "View or update your operator information, which needs to be complete before applying for BORO ID's",
  links: [
    {
      href: "/dashboard/select-operator",
      notification: "industryOperator",
    },
  ],
};

export default myOperator;
