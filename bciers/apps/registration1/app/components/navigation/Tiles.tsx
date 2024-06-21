"use client";

import {
  FrontEndRoles,
  OperatorStatus,
  UserOperatorStatus,
} from "@bciers/utils/enums";
import reportAProblemTile from "@/app/data/dashboard/report_a_problem.json";
import bceidSelectOperatorTile from "@/app/data/dashboard/bceid/select_operator.json";
import bceidMyOperatorTile from "@/app/data/dashboard/bceid/my_operator.json";
import bceidOperationsTile from "@/app/data/dashboard/bceid/operations.json";
import bceidUsersTile from "@/app/data/dashboard/bceid/users.json";
import idirOperatorsTile from "@/app/data/dashboard/idir/operators.json";
import idirOperationsTile from "@/app/data/dashboard/idir/operations.json";
import idirUsersTile from "@/app/data/dashboard/idir/users.json";
import Inbox from "@bciers/components/icons/Inbox";
import Layers from "@bciers/components/icons/Layers";
import NotificationIcon from "@bciers/components/icons/Notification";
import Users from "@bciers/components/icons/Users";
import Wrench from "@bciers/components/icons/Wrench";
import { IconMap, Notification, NotificationMap } from "./types";

// 📐 type for ContentItem used to build dashboard content tiles
type ContentItem = {
  title: string;
  icon: string;
  content: string;
  links?: { title?: string; href: string; notification?: string }[];
};

const iconMap: IconMap = {
  Inbox,
  Layers,
  Wrench,
  Users,
};

const industryUserOperatorNotifications = (
  operatorStatus: string | undefined,
) => {
  let notifications = 0;
  if (!operatorStatus || operatorStatus === OperatorStatus.DRAFT) {
    notifications++;
  }
  return {
    count: notifications,
    message: `${notifications} pending action(s) required`,
  } as Notification;
};

// notificationMap is used to retrieve the notification count for each type of notification
// The key is the href of the link and the value is a function that returns a Notification object
const notificationMap: NotificationMap = {
  industryOperator: industryUserOperatorNotifications,
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
      if (
        userOperatorStatus === UserOperatorStatus.APPROVED &&
        (operatorStatus === OperatorStatus.PENDING ||
          operatorStatus === OperatorStatus.APPROVED)
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
    case FrontEndRoles.INDUSTRY_USER:
      if (
        userOperatorStatus === UserOperatorStatus.APPROVED &&
        (operatorStatus === OperatorStatus.PENDING ||
          operatorStatus === OperatorStatus.APPROVED)
      ) {
        contents = [
          ...bceidMyOperatorTile,
          ...bceidOperationsTile,
          ...reportAProblemTile,
        ];
      } else {
        contents = [...bceidSelectOperatorTile, ...reportAProblemTile];
      }
      break;
  }

  return (
    <section className="flex flex-wrap gap-x-16 lg:gap-x-24 gap-y-16 mt-4">
      {contents &&
        contents.map((content) => {
          const { icon, links, title } = content;
          return (
            <div key={title} className="dashboard-tile-container">
              <h2 className="flex items-center m-0">
                {iconMap[icon as keyof IconMap]}
                <div className="ml-2">{content.title}</div>
              </h2>

              <p className="mt-6 mb-0">{content.content}</p>
              {typeof links === "object" &&
                links.map((link, i) => {
                  const isLinkNotification =
                    link.notification && link.notification in notificationMap;

                  // Get the notification message for the current tile using the notificationMap
                  const notification =
                    isLinkNotification &&
                    (notificationMap[
                      link.notification as keyof NotificationMap
                    ]?.(operatorStatus) as Notification);

                  const isNotification = notification && notification.count > 0;

                  return (
                    <a
                      key={i}
                      href={link.href}
                      id={`${title.split(" ").join("-")}-link`}
                      className={`flex items-center mt-6 no-underline ${
                        isNotification && "font-bold"
                      }`}
                    >
                      {isLinkNotification ? (
                        <>
                          {isNotification && (
                            <span className="mr-2">
                              <NotificationIcon />
                            </span>
                          )}
                          {notification && notification.message}
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
