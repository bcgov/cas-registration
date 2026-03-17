import {
  Status,
  UserOperatorStatus,
  UserOperatorRoles,
} from "@bciers/utils/src/enums";
import { getToken } from "@bciers/actions";
import {
  AccessRequest,
  AccessRequestDataGridRow,
} from "@/administration/app/components/userOperators/types";

export default async function processAccessRequestData(
  accessRequests: AccessRequest[],
) {
  // Ensure accessRequests is an array before using map
  if (!Array.isArray(accessRequests)) {
    return { rows: [] };
  }

  const transformedAccessRequests = accessRequests.map((accessRequest) => {
    accessRequest.status = accessRequest.status
      ? UserOperatorStatus[
          accessRequest.status.toUpperCase() as keyof typeof UserOperatorStatus
        ]
      : UserOperatorStatus.PENDING;

    return accessRequest;
  });

  // 🤳Identify current admin user in the list
  const token = await getToken();
  const uid = token?.user_guid ?? "";
  const selfIndex = transformedAccessRequests.findIndex(
    (transformedAccessRequest) => {
      return transformedAccessRequest.user.user_guid.replace(/-/g, "") === uid;
    },
  );

  // Ensure selfIndex is within the valid range before modifying the array
  if (selfIndex !== -1 && selfIndex < transformedAccessRequests.length) {
    transformedAccessRequests[selfIndex].status = Status.MYSELF;
  }
  const rowData = transformedAccessRequests.map((accessRequest) => {
    const {
      id,
      user_friendly_id: userFriendlyId,
      role,
      status,
      user,
      operator,
    } = accessRequest;

    // If the user is pending, we want to default the access type dropdown to Reporter
    const userRole =
      role.toLowerCase() === UserOperatorRoles.PENDING
        ? UserOperatorRoles.REPORTER
        : role;

    return {
      id: id, // This unique ID is needed for DataGrid to work properly
      userFriendlyId: userFriendlyId,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      business: operator.legal_name,
      userRole: status === UserOperatorStatus.DECLINED ? "N/A" : userRole,
      status: status,
    };
  });

  return {
    rows: rowData as AccessRequestDataGridRow[],
  };
}
