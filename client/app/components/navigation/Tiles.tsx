"use client";

import {
  FrontEndRoles,
  OperatorStatus,
  UserOperatorStatus,
} from "@/app/utils/enums";
import reportAProblemTile from "@/app/data/dashboard/report_a_problem.json";
import bceidSelectOperatorTile from "@/app/data/dashboard/bceid/select_operator.json";
import bceidMyOperatorTile from "@/app/data/dashboard/bceid/my_operator.json";
import bceidMyOperatorDraftTile from "@/app/data/dashboard/bceid/my_operator_draft.json";
import bceidOperationsTile from "@/app/data/dashboard/bceid/operations.json";
import bceidUsersTile from "@/app/data/dashboard/bceid/users.json";
import idirOperatorsTile from "@/app/data/dashboard/idir/operators.json";
import idirOperationsTile from "@/app/data/dashboard/idir/operations.json";
import idirUsersTile from "@/app/data/dashboard/idir/users.json";
import Inbox from "@/app/components/icons/Inbox";
import Layers from "@/app/components/icons/Layers";
import Notification from "@/app/components/icons/Notification";
import Users from "@/app/components/icons/Users";
import Wrench from "@/app/components/icons/Wrench";

// 📐 type for ContentItem used to build dashboard content tiles
type ContentItem = {
  title: string;
  content: string;
  links?: { title: string; href: string; notification?: string }[];
};

const iconsMap: Record<string, any> = {
  Operators: Inbox,
  "Select Operator": Inbox,
  Operations: Layers,
  "Report a Problem": Wrench,
  Users: Users,
};

export default function Tiles({
  role,
  operatorStatus,
  userOperatorStatus,
}: {
  role: string;
  operatorStatus: string;
  userOperatorStatus: string;
}) {
  let contents: ContentItem[] | null = null;
  switch (role) {
    case FrontEndRoles.CAS_ADMIN:
      contents = [
        ...idirOperatorsTile,
        ...idirOperationsTile,
        ...idirUsersTile,
        ...reportAProblemTile,
      ];

      break;
    case FrontEndRoles.CAS_ANALYST:
      contents = [
        ...idirOperatorsTile,
        ...idirOperationsTile,
        ...reportAProblemTile,
      ];
      break;
    case FrontEndRoles.INDUSTRY_USER_ADMIN:
      if (userOperatorStatus === UserOperatorStatus.APPROVED) {
        if (
          operatorStatus === OperatorStatus.PENDING ||
          operatorStatus === OperatorStatus.APPROVED
        ) {
          contents = [
            ...bceidMyOperatorTile,
            ...bceidOperationsTile,
            ...bceidUsersTile,
            ...reportAProblemTile,
          ];
        } else if (operatorStatus === OperatorStatus.DRAFT) {
          contents = [
            ...bceidMyOperatorDraftTile,
            ...bceidOperationsTile,
            ...bceidUsersTile,
            ...reportAProblemTile,
          ];
        } else {
          contents = [...bceidSelectOperatorTile, ...reportAProblemTile];
        }
        break;
      }
    case FrontEndRoles.INDUSTRY_USER:
      if (userOperatorStatus === UserOperatorStatus.APPROVED) {
        if (
          operatorStatus === OperatorStatus.PENDING ||
          operatorStatus === OperatorStatus.APPROVED
        ) {
          contents = [
            ...bceidMyOperatorTile,
            ...bceidOperationsTile,
            ...reportAProblemTile,
          ];
        }
      } else {
        contents = [...bceidSelectOperatorTile, ...reportAProblemTile];
      }
      break;
  }

  return (
    <section className="flex flex-wrap gap-x-16 lg:gap-x-24 gap-y-16 mt-4">
      {contents &&
        contents.map((content) => {
          const { title, links } = content;
          return (
            <div
              key={title}
              className="dashboard-tile-container hover:box-shadow-tile hover:transition-shadow"
            >
              <h2 className="flex items-center m-0">
                {iconsMap[title]?.()}
                <div className="ml-2">{content.title}</div>
              </h2>

              <p className="mt-6 mb-0">{content.content}</p>
              {typeof links === "object" &&
                links.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    className={`flex items-center mt-6 no-underline ${
                      link.notification && "font-bold"
                    }`}
                  >
                    {link?.notification && (
                      <span className="mr-2">
                        <Notification />
                      </span>
                    )}
                    {link.title}
                  </a>
                ))}
            </div>
          );
        })}
    </section>
  );
}
