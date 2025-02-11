import {
  fetchOperationsPageData,
  getBusinessStructures,
  getCurrentUsersOperations,
  getNaicsCodes,
  getRegistrationPurposes,
  getRegulatedProducts,
  getReportingActivities,
} from "../mocks";
import { getContacts } from "@/administration/tests/components/contacts/mocks";
import { Apps } from "../../../../libs/utils/src/enums";

const fetchFormEnums = (app: Apps) => {
  if (app === Apps.ADMINISTRATION) {
    // Naics codes
    getNaicsCodes.mockResolvedValue([
      {
        id: 1,
        naics_code: "211110",
        naics_description: "Oil and gas extraction (except oil sands)",
      },
      {
        id: 2,
        naics_code: "212114",
        naics_description: "Bituminous coal mining",
      },
    ]);
    // Reporting activities
    getReportingActivities.mockResolvedValue([
      {
        id: 1,
        name: "General stationary combustion excluding line tracing",
        applicable_to: "all",
      },
      {
        id: 2,
        name: "Fuel combustion by mobile equipment",
        applicable_to: "sfo",
      },
    ]);

    // Business structures
    getBusinessStructures.mockResolvedValue([
      { name: "General Partnership" },
      { name: "BC Corporation" },
    ]);

    // Regulated products
    getRegulatedProducts.mockResolvedValue([
      { id: 1, name: "BC-specific refinery complexity throughput" },
      { id: 2, name: "Cement equivalent" },
    ]);

    // Contacts
    getContacts.mockResolvedValue({
      items: [
        {
          id: 1,
          first_name: "Ivy",
          last_name: "Jones",
          email: "ivy.jones@example.com",
        },
        {
          id: 2,
          first_name: "Jack",
          last_name: "King",
          email: "jack.king@example.com",
        },
      ],
      count: 2,
    });

    // Registration purposes
    getRegistrationPurposes.mockResolvedValue([
      "Potential Reporting Operation",
      "Reporting Operation",
      "Opted-in Operation",
    ]);
  }
  if (app === Apps.REGISTRATION) {
    // Regulated products
    getRegulatedProducts.mockResolvedValueOnce([
      { id: 1, name: "BC-specific refinery complexity throughput" },
      { id: 2, name: "Cement equivalent" },
    ]);
    // Purposes
    getRegistrationPurposes.mockResolvedValueOnce([
      "Reporting Operation",
      "Potential Reporting Operation",
      "OBPS Regulated Operation",
      "Opted-in Operation",
      "New Entrant Operation",
      "Electricity Import Operation",
    ]);
    // Naics codes
    getNaicsCodes.mockResolvedValueOnce([
      {
        id: 1,
        naics_code: "211110",
        naics_description: "Oil and gas extraction (except oil sands)",
      },
      {
        id: 2,
        naics_code: "212114",
        naics_description: "Bituminous coal mining",
      },
    ]);
    // Reporting activities
    getReportingActivities.mockResolvedValueOnce([
      { id: 1, name: "Ammonia production" },
      { id: 2, name: "Cement production" },
    ]);
    // Business structures
    getBusinessStructures.mockResolvedValueOnce([
      { name: "General Partnership" },
      { name: "BC Corporation" },
    ]);

    // used in the registration form to population the select operation dropdown
    getCurrentUsersOperations.mockResolvedValueOnce([
      { id: "uuid1", name: "Operation 1" },
      { id: "uuid2", name: "Operation 2" },
      {
        id: "b974a7fc-ff63-41aa-9d57-509ebe2553a4",
        name: "Existing Operation",
      },
    ]);

    // brianna is this right? it could also be getCurrentUsersOperations
    // this is used in transfer form
    fetchOperationsPageData.mockResolvedValueOnce([
      { id: "uuid1", name: "Operation 1" },
      { id: "uuid2", name: "Operation 2" },
      {
        id: "b974a7fc-ff63-41aa-9d57-509ebe2553a4",
        name: "Existing Operation",
      },
    ]);
  }
};
export default fetchFormEnums;
