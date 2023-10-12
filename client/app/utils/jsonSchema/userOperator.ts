import { RJSFSchema } from "@rjsf/utils";

export const userOperatorSchema: RJSFSchema = {
  type: "object",
  properties: {
    "Step 1. User Information": {
      type: "object",
      properties: {
        "User Information": {
          type: "object",
          required: [
            "first_name",
            "last_name",
            "position_title",
            "street_address",
            "municipality",
            "postal_code",
            "email",
            "phone_number",
            "province",
            "role",
            "file",
          ],
          properties: {
            first_name: { type: "string", title: "First Name" },
            last_name: { type: "string", title: "Last Name" },
            position_title: { type: "string", title: "Position Title" },
            street_address: { type: "string", title: "Mailing Address" },
            municipality: { type: "string", title: "Municipality" },
            postal_code: { type: "string", title: "Postal Code" },
            email: { type: "string", title: "Email Address" },
            phone_number: { type: "string", title: "Phone Number" },
            province: { type: "string", title: "Province" },
            role: {
              title: "Are you a senior officer of the operator?",
              enum: ["Yes", "No"],
              default: "Yes",
            },
            file: {
              title: "Signed Statutory Declaration",
              type: "string",
              format: "data-url",
            },
          },
          allOf: [
            {
              if: {
                properties: {
                  role: {
                    const: "No",
                  },
                },
              },
              then: {
                properties: {
                  "If user is not senior officer (SO) - Ignore this section if you selected 'Yes'":
                    {
                      type: "object",
                      required: [
                        "Are you an operation representative of the operator?",
                        "Proof of authority of operation representative from a SO",
                        "first_name",
                        "last_name",
                        "position_title",
                        "street_address",
                        "municipality",
                        "province",
                        "postal_code",
                        "email",
                        "phone_number",
                      ],
                      properties: {
                        "Are you an operation representative of the operator?":
                          {
                            //FIXME: which db field is this?
                            type: "boolean",
                            // enum: ["Yes", "No"],
                          },
                        "Proof of authority of operation representative from a SO":
                          {
                            //FIXME: which db field is this?
                            type: "string",
                            format: "data-url",
                          },
                        first_name: {
                          type: "string",
                          title: "SO First Name",
                        },
                        last_name: {
                          type: "string",
                          title: "SO Last Name",
                        },
                        position_title: {
                          type: "string",
                          title: "SO Position Title",
                        },
                        street_address: {
                          type: "string",
                          title: "SO Mailing Address",
                        },
                        municipality: {
                          type: "string",
                          title: "SO Municipality",
                        },
                        province: {
                          type: "string",
                          title: "SO Province",
                        },
                        postal_code: {
                          type: "string",
                          title: "SO Postal Code",
                        },
                        email: {
                          type: "string",
                          title: "SO Email Address",
                        },
                        phone_number: {
                          type: "string",
                          title: "SO Phone Number",
                        },
                      },
                      allOf: [
                        {
                          if: {
                            properties: {
                              "Are you an operation representative of the operator?":
                                {
                                  const: true,
                                  // const: "No",
                                },
                            },
                          },
                          then: {
                            properties: {
                              "If user is not operation representative (OR) - Ignore this section if you selected 'Yes'":
                                {
                                  type: "object",
                                  required: [
                                    "Proof of authority of operation representative from a OR",
                                    "first_name",
                                    "last_name",
                                    "position_title",
                                    "street_address",
                                    "municipality",
                                    "province",
                                    "postal_code",
                                    "email",
                                    "phone_number",
                                  ],
                                  properties: {
                                    "Proof of authority of operation representative from a OR":
                                      {
                                        //FIXME: which db field is this?
                                        type: "string",
                                        format: "data-url",
                                      },
                                    first_name: {
                                      type: "string",
                                      title: "OR First Name",
                                    },
                                    last_name: {
                                      type: "string",
                                      title: "OR Last Name",
                                    },
                                    position_title: {
                                      type: "string",
                                      title: "OR Position Title",
                                    },
                                    street_address: {
                                      type: "string",
                                      title: "OR Mailing Address",
                                    },
                                    municipality: {
                                      type: "string",
                                      title: "OR Municipality",
                                    },
                                    province: {
                                      type: "string",
                                      title: "OR Province",
                                    },
                                    postal_code: {
                                      type: "string",
                                      title: "OR Postal Code",
                                    },
                                    email: {
                                      type: "string",
                                      title: "OR Email Address",
                                    },
                                    phone_number: {
                                      type: "string",
                                      title: "OR Phone Number",
                                    },
                                  },
                                },
                            },
                          },
                        },
                      ],
                    },
                  // "If user is not operation representative (OR) - Ignore this section if you selected 'Yes'":
                  //   {
                  //     type: "object",
                  //     properties: {
                  //       "Proof of authority of operation representative from a OR":
                  //         {
                  //           //FIXME: which db field is this?
                  //           type: "string",
                  //           format: "data-url",
                  //         },
                  //       first_name: {
                  //         type: "string",
                  //         title: "OR First Name",
                  //       },
                  //       last_name: {
                  //         type: "string",
                  //         title: "OR Last Name",
                  //       },
                  //       position_title: {
                  //         type: "string",
                  //         title: "OR Position Title",
                  //       },
                  //       street_address: {
                  //         type: "string",
                  //         title: "OR Mailing Address",
                  //       },
                  //       municipality: {
                  //         type: "string",
                  //         title: "OR Municipality",
                  //       },
                  //       province: {
                  //         type: "string",
                  //         title: "OR Province",
                  //       },
                  //       postal_code: {
                  //         type: "string",
                  //         title: "OR Postal Code",
                  //       },
                  //       email: {
                  //         type: "string",
                  //         title: "OR Email Address",
                  //       },
                  //       phone_number: {
                  //         type: "string",
                  //         title: "OR Phone Number",
                  //       },
                  //     },
                  //   },
                },
              },
            },
          ],
        },
      },
    },
    // "Step 2. Operator Information": {
    //   type: "object",
    //   properties: {
    //     "Operator Information": {
    //       type: "object",
    //       required: [
    //         "legal_name",
    //         "trade_name",
    //         "cra_business_number",
    //         "bc_corporate_registry_number",
    //         "duns_number",
    //         "business_structure",
    //         "physical_street_address",
    //         "physical_municipality",
    //         "physical_province",
    //         "physical_postal_code",
    //         "mailing_street_address",
    //         "mailing_municipality",
    //         "mailing_province",
    //         "mailing_postal_code",
    //         "website",
    //         "bceid",
    //       ],
    //       properties: {
    //         legal_name: { type: "string", title: "Legal Name" },
    //         trade_name: { type: "string", title: "Trade Name" },
    //         cra_business_number: {
    //           type: "string",
    //           title: "CRA Business Number",
    //         },
    //         bc_corporate_registry_number: {
    //           type: "string",
    //           title: "BC Corporate Registry Number",
    //         },
    //         duns_number: {
    //           type: "string",
    //           title: "Dun & Bradstreet D-U-N-S Number",
    //         },
    //         business_structure: {
    //           type: "string",
    //           title: "Business Structure",
    //         },
    //         physical_street_address: {
    //           type: "string",
    //           title: "Physical Address (PA)",
    //         },
    //         physical_municipality: {
    //           type: "string",
    //           title: "PA Municipality",
    //         },
    //         physical_province: {
    //           type: "string",
    //           title: "PA Province",
    //         },
    //         physical_postal_code: {
    //           type: "string",
    //           title: "PA Postal Code",
    //         },
    //         mailing_street_address: {
    //           type: "string",
    //           title: "Mailing Address (MA)",
    //         },
    //         mailing_municipality: {
    //           type: "string",
    //           title: "MA Municipality",
    //         },
    //         mailing_province: {
    //           type: "string",
    //           title: "MA Province",
    //         },
    //         mailing_postal_code: {
    //           type: "string",
    //           title: "MA Postal Code",
    //         },
    //         website: { type: "string", title: "Website" },
    //         bceid: { type: "string", title: "BCeID" },
    //         "Does the operator have a parent company?": {
    //           //FIXME: which db field is this?
    //           // FIXME: Is this a radio button? wireframe shows a text field
    //           enum: ["Yes", "No"],
    //           default: "Yes",
    //         },
    //         compliance_entity: {
    //           title: "Legal Name of compliance entity",
    //           type: "string", //FIXME: we need a list of compliance entities
    //         },
    //       },
    //       allOf: [
    //         // {
    //         //   if: {
    //         //     properties: {
    //         //       "Does the operator have a parent company?": {
    //         //         const: "Yes",
    //         //       },
    //         //     },
    //         //   },
    //         //   then: {
    //         //     properties: {},
    //         //   },
    //         // },
    //         {
    //           if: {
    //             properties: {
    //               "Does the operator have a parent company?": {
    //                 const: "No",
    //               },
    //             },
    //           },
    //           then: {
    //             properties: {
    //               "If operator has parent company (PC) - Ignore this section if you selected 'Yes'":
    //                 {
    //                   type: "object",
    //                   properties: {
    //                     legal_name: {
    //                       // FIXME: List of PC legal names?!
    //                       type: "string",
    //                       title: "PC Legal Name",
    //                     },
    //                     trade_name: {
    //                       type: "string",
    //                       title: "PC Trade Name",
    //                     },
    //                     cra_business_number: {
    //                       type: "string",
    //                       title: "PC CRA Business Number",
    //                     },
    //                     bc_corporate_registry_number: {
    //                       type: "string",
    //                       title: "PC BC Corporate Registry Number",
    //                     },
    //                     duns_number: {
    //                       type: "string",
    //                       title: "PC Dun & Bradstreet D-U-N-S Number",
    //                     },
    //                     business_structure: {
    //                       type: "string",
    //                       title: "PC Business Structure",
    //                     },
    //                     physical_street_address: {
    //                       type: "string",
    //                       title: "PC Physical Address",
    //                     },
    //                     physical_municipality: {
    //                       type: "string",
    //                       title: "PC PA Municipality",
    //                     },
    //                     physical_province: {
    //                       type: "string",
    //                       title: "PC PA Province",
    //                     },
    //                     physical_postal_code: {
    //                       type: "string",
    //                       title: "PC PA Postal Code",
    //                     },
    //                     mailing_street_address: {
    //                       type: "string",
    //                       title: "PC Mailing Address",
    //                     },
    //                     mailing_municipality: {
    //                       type: "string",
    //                       title: "PC MA Municipality",
    //                     },
    //                     mailing_province: {
    //                       type: "string",
    //                       title: "PC MA Province",
    //                     },
    //                     mailing_postal_code: {
    //                       type: "string",
    //                       title: "PC MA Postal Code",
    //                     },
    //                     website: { type: "string", title: "PC Website" },
    //                     percentage_owned_by_parent_company: {
    //                       type: "number",
    //                       title: "Percentage of ownership of operator",
    //                     },
    //                   },
    //                 },
    //             },
    //           },
    //         },
    //       ],
    //     },
    //   },
    // },
  },
};

export const userOperatorUiSchema = {};
