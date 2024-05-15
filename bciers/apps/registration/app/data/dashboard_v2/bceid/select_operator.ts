import Inbox from "@/app/components/icons/Inbox";

const selectOperator = {
  title: "Select Operator",
  icon: Inbox,
  content: "View or update your operator information",
  links: [
    {
      href: "/dashboard/select-operator",
      notification: "industryOperator",
    },
  ],
};

export default selectOperator;
