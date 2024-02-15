"use client";

import {
  FrontEndRoles,
  OperatorStatus,
  UserOperatorStatus,
} from "@/app/utils/enums";
import reportAProblemTile from "@/app/data/dashboard/report_a_problem.json";
import bceidSelectOperatorTile from "@/app/data/dashboard/bceid/select_operator.json";
import bceidMyOperatorTile from "@/app/data/dashboard/bceid/my_operator.json";
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
  "My Operator": Inbox,
  "My Operations": Layers,
  Operators: Inbox,
  "Select Operator": Inbox,
  Operations: Layers,
  "Report a Problem": Wrench,
  Users: Users,
  "User Access Management": Users,
};

const userOperatorNotifications = (operatorStatus: string | undefined) => {
  let notifications = 0;
  if (!operatorStatus || operatorStatus === OperatorStatus.DRAFT) {
    notifications++;
  }
  return notifications;
};

// notificationMap is used to retrieve the notification count for each type of notification
// set the notification type in the links array of the Tile JSON file
const notificationMap = {
  operator: userOperatorNotifications,
  // Add Operations and User notification functions here
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
                links.map((link, i) => {
                  const notificationType = link?.notification;

                  // Get the notification count for the current tile using the notificationMap
                  const notificationCount =
                    notificationMap[
                      notificationType as keyof typeof notificationMap
                    ]?.(operatorStatus) || 0;

                  const isNotification = notificationCount > 0;

                  return (
                    <a
                      key={i}
                      href={link.href}
                      className={`flex items-center mt-6 no-underline ${
                        isNotification && "font-bold"
                      }`}
                    >
                      {notificationType ? (
                        <>
                          {isNotification && (
                            <span className="mr-2">
                              <Notification />
                            </span>
                          )}
                          {`${notificationCount} pending action(s) required`}
                        </>
                      ) : (
                        link.title
                      )}
                    </a>
                  );
                })}
            </div>
          );
        })}
    </section>
  );
}
