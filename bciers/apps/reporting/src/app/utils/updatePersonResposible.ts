import { actionHandler } from "@bciers/actions";

export const updatePersonResponsible = async (
  reportVerionId: number,
  contact_id: number | null, // Allow null for cases where no contact_id is provided
) => {
  // Prepare the payload
  const body = {
    contact_id,
  };

  return await actionHandler(
    `reporting/${reportVerionId}`,
    "PATCH",
    `/reports/${reportVerionId}`,
    {
      body: JSON.stringify(body),
    },
  );
};
