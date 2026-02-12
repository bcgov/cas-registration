-- Auto-generated e2e fixture dump. Do not edit manually.
-- Regenerate with: python manage.py generate_e2e_fixture_dump

TRUNCATE TABLE erc.address, erc.bc_greenhouse_gas_id, erc.bc_obps_regulated_operation, erc.closure_event, erc.closure_event_facilities, erc.compliance_earned_credit, erc.compliance_obligation, erc.compliance_penalty, erc.compliance_penalty_accrual, erc.compliance_penalty_rate, erc.compliance_report, erc.compliance_report_version, erc.compliance_report_version_manual_handling, erc.configuration_element_reporting_fields, erc.contact, erc.document, erc.elicensing_adjustment, erc.elicensing_client_operator, erc.elicensing_interest_rate, erc.elicensing_invoice, erc.elicensing_line_item, erc.elicensing_payment, erc.facility, erc.facility_designated_operation_timeline, erc.facility_report, erc.facility_report_activities, erc.facility_snapshot, erc.facility_well_authorization_numbers, erc.multiple_operator, erc.operation, erc.operation_activities, erc.operation_contacts, erc.operation_designated_operator_timeline, erc.operation_regulated_products, erc.operator, erc.opted_in_operation_detail, erc.parent_operator, erc.partner_operator, erc.report, erc.report_activity, erc.report_additional_data, erc.report_attachment, erc.report_attachment_confirmation, erc.report_compliance_summary, erc.report_compliance_summary_product, erc.report_electricity_import_data, erc.report_emission, erc.report_emission_allocation, erc.report_emission_emission_categories, erc.report_fuel, erc.report_methodology, erc.report_new_entrant, erc.report_new_entrant_emission, erc.report_new_entrant_production, erc.report_non_attributable_emissions, erc.report_non_attributable_emissions_gas_type, erc.report_operation, erc.report_operation_activities, erc.report_operation_regulated_products, erc.report_operation_representative, erc.report_person_responsible, erc.report_product, erc.report_product_emission_allocation, erc.report_raw_activity_data, erc.report_sign_off, erc.report_source_type, erc.report_unit, erc.report_verification, erc.report_verification_visit, erc.report_version, erc.restart_event, erc.restart_event_facilities, erc.temporary_shutdown_event, erc.temporary_shutdown_event_facilities, erc.transfer_event, erc.transfer_event_facilities, erc.user_operator, erc.well_authorization_number, erc_history.activity_history, erc_history.address_history, erc_history.app_role_history, erc_history.bc_greenhouse_gas_id_history, erc_history.bc_obps_regulated_operation_history, erc_history.business_role_history, erc_history.business_structure_history, erc_history.closure_event_history, erc_history.compliance_earned_credit_history, erc_history.compliance_obligation_history, erc_history.contact_history, erc_history.document_history, erc_history.document_type_history, erc_history.facility_designated_operation_timeline_history, erc_history.facility_history, erc_history.facility_snapshot_history, erc_history.multiple_operator_history, erc_history.naics_code_history, erc_history.operation_designated_operator_timeline_history, erc_history.operation_history, erc_history.operator_history, erc_history.opted_in_operation_detail_history, erc_history.parent_operator_history, erc_history.partner_operator_history, erc_history.regulated_product_history, erc_history.restart_event_history, erc_history.temporary_shutdown_event_history, erc_history.transfer_event_history, erc_history.user_history, erc_history.user_operator_history, erc_history.well_authorization_number_history RESTART IDENTITY CASCADE;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

INSERT INTO erc.address VALUES (1, '568 Wonky St', 'Villaville', 'BC', 'H0H 0H0');
INSERT INTO erc.address VALUES (2, '456 Elm St', 'Townsville', 'BC', 'X0Y 1Z0');
INSERT INTO erc.address VALUES (3, '123 Main St', 'City', 'ON', 'A1B 2C3');
INSERT INTO erc.address VALUES (4, '789 Oak St', 'Village', 'BC', 'M2N 3P4');
INSERT INTO erc.address VALUES (5, '101 Maple St', 'Hamlet', 'QC', 'H3Z 2Y7');
INSERT INTO erc.address VALUES (6, '202 Pine St', 'Borough', 'AB', 'T5K 1P2');
INSERT INTO erc.address VALUES (7, '303 Cedar St', 'Metropolis', 'ON', 'M4B 1B3');
INSERT INTO erc.address VALUES (8, '404 Birch St', 'Uptown', 'BC', 'V6B 2W3');
INSERT INTO erc.address VALUES (9, '505 Spruce St', 'Downtown', 'ON', 'K1A 0B1');
INSERT INTO erc.address VALUES (10, '606 Fir St', 'Suburbia', 'QC', 'G1V 4N7');
INSERT INTO erc.address VALUES (11, '707 Willow St', 'Riverside', 'MB', 'R3C 4A5');
INSERT INTO erc.address VALUES (12, '808 Poplar St', 'Lakeside', 'NS', 'B3H 2Y9');
INSERT INTO erc.address VALUES (13, '909 Aspen St', 'Hillside', 'NB', 'E3B 1A1');
INSERT INTO erc.address VALUES (14, '1010 Redwood St', 'Seaside', 'PE', 'C1A 7N8');
INSERT INTO erc.address VALUES (15, '1111 Chestnut St', 'Mountainview', 'NL', 'A1C 5H7');
INSERT INTO erc.address VALUES (16, '1212 Walnut St', 'Forestville', 'SK', 'S7K 3R5');
INSERT INTO erc.address VALUES (17, '1313 Hickory St', 'Prairie', 'MB', 'R2C 4A6');
INSERT INTO erc.address VALUES (18, '1414 Sycamore St', 'Baytown', 'ON', 'L4W 5N8');
INSERT INTO erc.address VALUES (19, '1515 Magnolia St', 'Harbor', 'BC', 'V8W 1N4');
INSERT INTO erc.address VALUES (20, '1616 Dogwood St', 'Cove', 'QC', 'J4Z 2Y8');
INSERT INTO erc.address VALUES (21, '1717 Alder St', 'Grove', 'ON', 'N2L 3G1');
INSERT INTO erc.address VALUES (22, 'Incomplete address', 'Grove', NULL, NULL);

INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990005', '2023-10-13 08:27:00-07', 'For Operation 1', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990004', '2023-10-13 08:27:00-07', 'For Operation 2', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990003', '2023-10-13 08:27:00-07', 'For Operation 3', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990001', '2023-10-13 08:27:00-07', 'For Operation 5', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219999999', '2023-10-13 08:27:00-07', 'For Operation 6', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990006', '2023-10-13 08:27:00-07', 'For Operation 7', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990007', '2023-10-13 08:27:00-07', 'For Operation 8', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990008', '2023-10-13 08:27:00-07', 'For Operation 9', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990009', '2023-10-13 08:27:00-07', 'For Operation 10', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990010', '2023-10-13 08:27:00-07', 'For Operation 11', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990011', '2023-10-13 08:27:00-07', 'For Operation 12', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990012', '2023-10-13 08:27:00-07', 'For Operation 13', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990013', '2023-10-13 08:27:00-07', 'For Operation 14', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990014', '2023-10-13 08:27:00-07', 'For Operation 15', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990015', '2023-10-13 08:27:00-07', 'For Operation 16', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990016', '2023-10-13 08:27:00-07', 'For Operation 17', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990017', '2023-10-13 08:27:00-07', 'For Operation 18', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990018', '2023-10-13 08:27:00-07', 'For Operation 19', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990019', '2023-10-13 08:27:00-07', 'For Operation 20', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990020', '2023-10-13 08:27:00-07', 'For Operation 21', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990021', '2023-10-13 08:27:00-07', 'For Operation 22', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990022', '2023-10-13 08:27:00-07', 'For Operation 23', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('23219990023', '2023-10-13 08:27:00-07', 'For Operation 24', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990006', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990007', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990008', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990009', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990010', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990011', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990012', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990013', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990014', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990015', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990016', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990017', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990018', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990019', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990020', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990021', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990022', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990023', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990024', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990025', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990027', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990999', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990028', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990029', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990030', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990031', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990032', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990033', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990034', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990035', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990036', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990037', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990038', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990039', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990040', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990041', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990042', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990043', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990044', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990045', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990046', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990047', '2024-10-31 08:27:00-07', '', NULL);
INSERT INTO erc.bc_greenhouse_gas_id VALUES ('13219990048', '2024-10-31 08:27:00-07', '', NULL);

INSERT INTO erc.bc_obps_regulated_operation VALUES ('23-0001', '2023-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0003', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0004', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0005', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0006', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0007', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0008', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0009', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0010', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0011', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0012', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0013', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0014', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0015', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0016', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0017', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0018', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0019', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0020', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);
INSERT INTO erc.bc_obps_regulated_operation VALUES ('24-0021', '2024-10-13 08:27:00-07', 'Test comment', 'Active', NULL);

INSERT INTO erc.operator VALUES ('2026-02-11 16:58:53.306652-08', NULL, NULL, '00000000-0000-0000-0000-000000000000', 'BCGOV - name from admin', NULL, '123456787', NULL, 'abc1234569', NULL, 'Approved', NULL, 'Sole Proprietorship', NULL, NULL, NULL, NULL);
INSERT INTO erc.operator VALUES ('2026-02-11 16:58:53.306652-08', NULL, NULL, '685d581b-5698-411f-ae00-de1d97334a71', 'Alpha Enterprises - name from admin', NULL, '123456789', NULL, 'abc1234567', NULL, 'Approved', NULL, 'Sole Proprietorship', NULL, NULL, NULL, NULL);
INSERT INTO erc.operator VALUES ('2026-02-11 16:58:53.306652-08', NULL, NULL, '4242ea9d-b917-4129-93c2-db00b7451051', 'Bravo Technologies - has parTNER operator - name from admin', 'Bravo Technologies', '987654321', NULL, 'def1234567', NULL, 'Approved', NULL, 'General Partnership', NULL, 3, 4, NULL);
INSERT INTO erc.operator VALUES ('2026-02-11 16:58:53.306652-08', NULL, NULL, '438eff6c-d2e7-40ab-8220-29d3a86ef314', 'Charlie Solutions - name from admin', NULL, '987654322', NULL, 'ghi1234567', NULL, 'Approved', NULL, 'BC Corporation', NULL, 4, NULL, NULL);
INSERT INTO erc.operator VALUES ('2026-02-11 16:58:53.306652-08', NULL, NULL, '7e8b72dc-4196-427f-a553-7879748139e1', 'Delta Innovations - name from admin', NULL, '987654323', NULL, 'jkl1234567', NULL, 'Approved', NULL, 'BC Corporation', NULL, 4, NULL, NULL);
INSERT INTO erc.operator VALUES ('2026-02-11 16:58:53.306652-08', NULL, NULL, '4c1010c1-55ca-485d-84bd-6d975fd0af90', 'Echo Systems - name from admin', NULL, '987654324', NULL, 'mno1234567', NULL, 'Approved', NULL, 'BC Corporation', NULL, 4, NULL, NULL);
INSERT INTO erc.operator VALUES ('2026-02-11 16:58:53.306652-08', NULL, NULL, '5712ee05-5f3b-4822-825d-6fffddafda4c', 'Foxtrot Enterprises - has parENT operator - name from admin', NULL, '987654325', NULL, 'pqr1234567', NULL, 'Approved', NULL, 'BC Corporation', NULL, 4, NULL, NULL);
INSERT INTO erc.operator VALUES ('2026-02-11 16:58:53.306652-08', NULL, NULL, 'edb1aff1-f888-4199-ab88-068364496347', 'Golf Solutions - name from admin', NULL, '987654326', NULL, 'stu1234567', NULL, 'Approved', NULL, 'BC Corporation', NULL, 4, NULL, NULL);
INSERT INTO erc.operator VALUES ('2026-02-11 16:58:53.306652-08', NULL, NULL, 'ea4314ea-1974-465a-a851-278c8f9c8daa', 'Hotel Ventures - name from admin', NULL, '987654327', NULL, 'vwx1234567', NULL, 'Approved', NULL, 'BC Corporation', NULL, 4, NULL, NULL);
INSERT INTO erc.operator VALUES ('2026-02-11 16:58:53.306652-08', NULL, NULL, '04384911-264a-4510-b582-11ee704b8e41', 'India Innovations - name from admin', NULL, '987654328', NULL, 'yza1234567', NULL, 'Approved', NULL, 'BC Corporation', NULL, 4, NULL, NULL);
INSERT INTO erc.operator VALUES ('2026-02-11 16:58:53.306652-08', NULL, NULL, 'f209ef09-dfe6-42a1-ac4c-7689897f1b51', 'Juliet Enterprises - name from admin', NULL, '987654329', NULL, 'bcd1234567', NULL, 'Approved', NULL, 'BC Corporation', NULL, 4, NULL, NULL);
INSERT INTO erc.operator VALUES ('2026-02-11 16:58:53.306652-08', NULL, NULL, 'bb979661-0782-49b2-9c64-acd8424b692b', 'Kilo Logistics - name from admin', NULL, '987654330', NULL, 'efg1234567', NULL, 'Approved', NULL, 'BC Corporation', NULL, 4, NULL, NULL);
INSERT INTO erc.operator VALUES ('2026-02-11 16:58:53.306652-08', NULL, NULL, 'bb702949-e303-4788-9ba9-806232a5f711', 'Lima Enterprises - name from admin', NULL, '987654331', NULL, 'hij1234567', NULL, 'Approved', NULL, 'BC Corporation', NULL, 4, NULL, NULL);
INSERT INTO erc.operator VALUES ('2026-02-11 16:58:53.306652-08', NULL, NULL, 'a35fb5ad-edd9-4465-982e-81b824644d07', 'Mike Ventures - name from admin', NULL, '987654332', NULL, 'klm1234567', NULL, 'Approved', NULL, 'BC Corporation', NULL, 4, NULL, NULL);
INSERT INTO erc.operator VALUES ('2026-02-11 16:58:53.306652-08', NULL, NULL, '5c847c75-3b17-414c-97f8-88ba81cb3821', 'November Solutions - name from admin', NULL, '987654333', NULL, 'nop1234567', NULL, 'Approved', NULL, 'BC Corporation', NULL, 4, NULL, NULL);
INSERT INTO erc.operator VALUES ('2026-02-11 16:58:53.306652-08', NULL, NULL, '4a792f0f-cf9d-48c8-9a95-f504c5f84b12', 'Oscar Enterprises - name from admin', NULL, '987654334', NULL, 'qrs1234567', NULL, 'Approved', NULL, 'BC Corporation', NULL, 4, NULL, NULL);
INSERT INTO erc.operator VALUES ('2026-02-11 16:58:53.306652-08', NULL, NULL, '550e8400-e29b-41d4-a716-446655440000', 'Papa Enterprises - no associated operations - name from admin', NULL, '987654356', NULL, 'tuv1234567', NULL, 'Approved', NULL, 'BC Corporation', NULL, 4, NULL, NULL);

INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Apple LFO - Registered - name from admin', 'Linear Facilities Operation', 1001, NULL, 'e1300fd7-2dee-47d1-b655-2ad3fd10f052', NULL, 'Registered', NULL, '24-0014', NULL, 19, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Banana LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990004', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL, 'Registered', NULL, '24-0015', NULL, 20, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Barbie LFO - Draft -- no facility - name from admin', 'Linear Facilities Operation', NULL, NULL, '556ceeb0-7e24-4d89-b639-61f625f82084', NULL, 'Draft', NULL, NULL, NULL, 20, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Bugle SFO - Registered - name from admin', 'Single Facility Operation', NULL, NULL, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', '2023-12-16 07:27:00-08', 'Registered', NULL, '23-0001', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Alien SFO - Draft - no facility - name from admin', 'Single Facility Operation', NULL, NULL, 'c0743c09-82fa-4186-91aa-4b5412e3415c', '2024-01-12 07:27:00-08', 'Draft', NULL, NULL, NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Bangles SFO - Registered - has Multiple Operators - name from admin', 'Single Facility Operation', NULL, '23219990001', 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488e', NULL, 'Registered', NULL, '24-0003', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Alligator SFO - Registered - name from admin', 'Single Facility Operation', NULL, '23219999999', 'd99725a7-1c3a-47cb-a59b-e2388ce0fa18', '2024-01-14 07:27:00-08', 'Registered', NULL, '24-0004', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Opted-in Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Anteater LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990006', '436dd99a-cb41-4494-91c9-98ab149b557d', '2024-01-15 07:27:00-08', 'Registered', NULL, '24-0005', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Arctic EIO - Registered - name from admin', 'Electricity Import Operation', NULL, '23219990007', 'a47b5fb6-1e10-401a-b70e-574bd925db99', '2024-01-16 07:27:00-08', 'Registered', NULL, '24-0006', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Electricity Import Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Argument LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990008', '21e70498-c4b0-4525-8443-86faa96206e3', '2024-01-17 07:27:00-08', 'Registered', NULL, '24-0007', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'New Entrant Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Art LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '17550cd8-3e73-4e52-aa91-ab90cb3b62b0', '2024-01-18 07:27:00-08', 'Registered', NULL, '24-0008', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Aeolian LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990010', '7d3fc7d1-0504-4ee4-a9c5-447f4b324b57', '2024-01-19 07:27:00-08', 'Registered', NULL, '24-0009', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Anchor LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990011', 'acf5811e-d521-43f7-a5c7-a6d6dd47bb31', '2024-01-20 07:27:00-08', 'Registered', NULL, '24-0010', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Airplane LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '8563da83-0762-4d29-9b22-da5b52ef0f24', '2024-01-21 07:27:00-08', 'Registered', NULL, '24-0011', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Bojangles EIO - Registered - name from admin', 'Electricity Import Operation', NULL, NULL, 'df62d793-8cfe-4272-a93e-ea9c9139ff82', '2024-01-22 07:27:00-08', 'Registered', NULL, NULL, NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'Electricity Import Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Brine LFO - Registered - No BORO and BCGHG ID - name from admin', 'Linear Facilities Operation', NULL, NULL, 'c5b3643b-c143-42f3-8a2b-03ccc7319cd9', '2024-01-23 07:27:00-08', 'Registered', NULL, NULL, NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Bling LFO - Draft - name from admin', 'Linear Facilities Operation', NULL, NULL, '954c0382-ff61-4e87-a8a0-873586534b54', '2024-01-24 07:27:00-08', 'Draft', NULL, NULL, NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Bees LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990016', '6d07d02a-1ad2-46ed-ad56-2f84313e98bf', '2024-01-25 07:27:00-08', 'Registered', NULL, '24-0012', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Blue LFO - Not Started - name from admin', 'Linear Facilities Operation', NULL, NULL, '59d95661-c752-489b-9fd1-0c3fa3454dda', '2024-01-26 07:27:00-08', 'Not Started', NULL, NULL, NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Bullet LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990018', '1bd04128-d070-4d3a-940a-0874c4956181', '2024-01-27 07:27:00-08', 'Registered', NULL, '24-0013', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'New Entrant Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Bat LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990019', '17f13f4d-29b4-45f4-b025-b21f2e126771', '2024-01-28 07:27:00-08', 'Registered', NULL, '24-0016', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Bin LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990020', 'ef9044dd-2a27-4d26-86fe-02e51e0755f7', NULL, 'Registered', NULL, '24-0017', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Bark LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990021', 'aeeb781e-a97b-4ab2-9a6e-02e4522add1a', NULL, 'Registered', NULL, '24-0018', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Blight EIO - Draft - name from admin', 'Electricity Import Operation', NULL, NULL, '02a3ab84-26c6-4a79-bf89-72f877ceef8e', NULL, 'Draft', NULL, NULL, NULL, NULL, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'Electricity Import Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Brown LFO - Not Started -- no facility - name from admin', 'Linear Facilities Operation', NULL, NULL, '0ac72fa9-2636-4f54-b378-af6b1a070787', NULL, 'Not Started', NULL, NULL, NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Cat LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, 'b35a2095-80e6-4b75-990e-ccf19a57edfa', NULL, 'Registered', NULL, NULL, NULL, 20, '438eff6c-d2e7-40ab-8220-29d3a86ef314', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Dog LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '1d59cb82-2776-4785-a8f7-4b13bc9b4579', NULL, 'Registered', NULL, NULL, NULL, 20, '7e8b72dc-4196-427f-a553-7879748139e1', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Elephant LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '82e6ac8f-42f2-42a7-b179-132a3488b2e1', NULL, 'Registered', NULL, NULL, NULL, 20, '4c1010c1-55ca-485d-84bd-6d975fd0af90', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Fox LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '95f6ec29-4b5b-42a2-9759-d4e9c99738d7', NULL, 'Registered', NULL, NULL, NULL, 20, '5712ee05-5f3b-4822-825d-6fffddafda4c', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Giraffe LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '1b21579c-87f9-452f-b9c1-c784cb96f62e', NULL, 'Registered', NULL, NULL, NULL, 20, 'edb1aff1-f888-4199-ab88-068364496347', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Horse LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '4623c545-ef99-464a-bd8b-bb96ffb57e8e', NULL, 'Registered', NULL, NULL, NULL, 20, 'ea4314ea-1974-465a-a851-278c8f9c8daa', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Iguana LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, 'f82c2a59-0f3a-4a89-b7d7-9fcd7a7ecb77', NULL, 'Registered', NULL, NULL, NULL, 20, '04384911-264a-4510-b582-11ee704b8e41', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Jaguar LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '3182c8a4-22ff-4ca9-9f91-093c8888fd7c', NULL, 'Registered', NULL, NULL, NULL, 20, 'f209ef09-dfe6-42a1-ac4c-7689897f1b51', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Kangaroo LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '68f0b68a-c6b5-4c4e-82a6-d7fbd690f55e', NULL, 'Registered', NULL, NULL, NULL, 20, 'bb979661-0782-49b2-9c64-acd8424b692b', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Lion LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, 'a5f7f5b3-fb56-4377-ae6c-b11c8b6d0041', NULL, 'Registered', NULL, NULL, NULL, 20, 'bb702949-e303-4788-9ba9-806232a5f711', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Monkey LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '8494e89c-489b-441b-a05d-e935b1d82487', NULL, 'Registered', NULL, NULL, NULL, 20, 'a35fb5ad-edd9-4465-982e-81b824644d07', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Narwhal LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '84d4c8b7-55b5-4700-90ad-fb1c169d4e1f', NULL, 'Registered', NULL, NULL, NULL, 20, '5c847c75-3b17-414c-97f8-88ba81cb3821', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Ostrich LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '62d5d8ea-b163-4a83-95a4-bfadbb6b21f7', NULL, 'Registered', NULL, NULL, NULL, 20, '4a792f0f-cf9d-48c8-9a95-f504c5f84b12', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Compliance SFO - Obligation not met - name from admin', 'Single Facility Operation', NULL, '13219990046', 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488f', NULL, 'Registered', NULL, '24-0019', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Compliance SFO - Earned credits - name from admin', 'Single Facility Operation', NULL, '13219990047', '84ea41f0-4039-44d8-9f91-0e1d5fd47930', NULL, 'Registered', NULL, '24-0020', NULL, 22, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc.operation VALUES ('2026-02-11 16:58:53.44441-08', NULL, NULL, 'Compliance SFO - No obligation or earned credits - name from admin', 'Single Facility Operation', NULL, '13219990048', '3f47b2e1-9a4c-4d3f-8b21-7e9a0c5d2f6b', NULL, 'Registered', NULL, '24-0021', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');

INSERT INTO erc.closure_event VALUES ('2026-02-11 16:58:56.061017-08', NULL, NULL, '87a669d0-66d4-47a2-9c2c-34c9e60740d0', '2024-09-01 02:00:00-07', 'Homer Simpson burned the entire nuclear reactor down', 'Closed', NULL, NULL, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', NULL);
INSERT INTO erc.closure_event VALUES ('2026-02-11 16:58:56.061017-08', NULL, NULL, '127ccfbf-c344-4dcd-8c98-bbd9303d22a9', '2026-01-10 01:00:00-08', '', 'Closed', NULL, NULL, NULL, NULL);

INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aeb', 'Facility 1', 'Large Facility', NULL, NULL, NULL, NULL, NULL, NULL, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, '459b80f9-b5f3-48aa-9727-90c30eaf3a58', 'Facility 2', 'Large Facility', 1, NULL, NULL, NULL, '13219990006', 1002, 43.500000, -123.500000, NULL, NULL, 'e1300fd7-2dee-47d1-b655-2ad3fd10f052');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aec', 'Facility 3', 'Medium Facility', NULL, NULL, NULL, NULL, '13219990007', 1003, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aed', 'Facility 4', 'Small Aggregate', NULL, NULL, NULL, NULL, NULL, 1004, NULL, NULL, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aee', 'Facility 5', 'Large Facility', NULL, NULL, NULL, NULL, NULL, 1005, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aef', 'Facility 6', 'Large Facility', NULL, NULL, NULL, NULL, NULL, 1006, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af0', 'Facility 7', 'Large Facility', NULL, NULL, NULL, NULL, NULL, 1007, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af1', 'Facility 8', 'Large Facility', NULL, NULL, NULL, NULL, '13219990012', 1008, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af2', 'Facility 9', 'Large Facility', NULL, NULL, NULL, NULL, '13219990013', 1009, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af3', 'Facility 10', 'Large Facility', NULL, NULL, NULL, NULL, '13219990014', 1010, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af4', 'Facility 11', 'Large Facility', NULL, NULL, NULL, NULL, '13219990015', 1011, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af5', 'Facility 12', 'Large Facility', NULL, NULL, NULL, NULL, '13219990016', 1012, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af6', 'Facility 13', 'Large Facility', NULL, NULL, NULL, NULL, '13219990017', 1013, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af7', 'Facility 14', 'Large Facility', NULL, NULL, NULL, NULL, '13219990018', 1014, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af8', 'Facility 15', 'Large Facility', NULL, NULL, NULL, NULL, '13219990019', 1015, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af9', 'Facility 16', 'Large Facility', NULL, NULL, NULL, NULL, '13219990020', 1016, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afa', 'Facility 17', 'Large Facility', NULL, NULL, NULL, NULL, '13219990021', 1017, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afb', 'Facility 18', 'Large Facility', NULL, NULL, NULL, NULL, NULL, 1018, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afc', 'Facility 19', 'Large Facility', NULL, NULL, NULL, NULL, '13219990023', 1019, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afd', 'Facility 20', 'Large Facility', NULL, NULL, NULL, NULL, NULL, 1020, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afe', 'Facility 21', 'Large Facility', NULL, NULL, NULL, NULL, NULL, 1021, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aff', 'Facility 22', 'Single Facility', NULL, NULL, NULL, NULL, NULL, 1022, 43.500000, -123.500000, NULL, NULL, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, '4486f2fb-62ed-438d-bb3e-0819b51e3aff', 'Facility 24', 'Medium Facility', NULL, NULL, NULL, NULL, '13219990999', 1024, 43.500000, -123.500000, NULL, NULL, '1bd04128-d070-4d3a-940a-0874c4956181');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, '67fd8288-422b-43d3-a9b1-e4ddc54e2139', 'Facility 25', 'Medium Facility', NULL, NULL, NULL, NULL, NULL, 1025, 43.500000, -123.500000, NULL, NULL, 'df62d793-8cfe-4272-a93e-ea9c9139ff82');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, '9f7b0848-021e-4d08-9852-10524c4e5456', 'Bubblegum', 'Single Facility', NULL, NULL, NULL, NULL, '23219990001', 1026, 43.500000, -123.500000, NULL, NULL, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488e');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f4eb89dd-e081-4576-8663-b789c4a20478', 'Alleyoop', 'Single Facility', NULL, NULL, NULL, NULL, '23219999999', 1027, 43.500000, -123.500000, NULL, NULL, 'd99725a7-1c3a-47cb-a59b-e2388ce0fa18');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, '6d564423-abfe-4579-ba92-2c6c71c37bb9', 'Facility 28', 'Medium Facility', NULL, NULL, NULL, NULL, NULL, 1028, 43.500000, -123.500000, NULL, NULL, '436dd99a-cb41-4494-91c9-98ab149b557d');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f466e6fc-f338-4cf7-89b0-0211bd2be8b7', 'Facility 29', 'Medium Facility', NULL, NULL, NULL, NULL, NULL, 1029, 43.500000, -123.500000, NULL, NULL, 'a47b5fb6-1e10-401a-b70e-574bd925db99');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f2461804-f38a-4fcc-8586-7ee6eaefa830', 'Facility 30', 'Medium Facility', NULL, NULL, NULL, NULL, NULL, 1030, 43.500000, -123.500000, NULL, NULL, '21e70498-c4b0-4525-8443-86faa96206e3');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'fab6a6a7-3c9b-426f-88fb-a9c06474fe51', 'Facility 31', 'Medium Facility', NULL, NULL, NULL, NULL, '13219990025', 1031, 43.500000, -123.500000, NULL, NULL, '17550cd8-3e73-4e52-aa91-ab90cb3b62b0');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, '80db5b3a-b06b-4c06-b257-edaa4e873160', 'Facility 32', 'Medium Facility', NULL, NULL, NULL, NULL, '13219990022', 1032, 43.500000, -123.500000, NULL, NULL, '7d3fc7d1-0504-4ee4-a9c5-447f4b324b57');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, '8d0777dd-b691-4079-9253-fca63df79300', 'Facility 33', 'Medium Facility', NULL, NULL, NULL, NULL, '13219990009', 1033, 43.500000, -123.500000, NULL, NULL, 'acf5811e-d521-43f7-a5c7-a6d6dd47bb31');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'e5ade67f-f9ce-496c-b0ad-b8edcd7ecd08', 'Facility 34', 'Medium Facility', NULL, NULL, NULL, NULL, '13219990008', 1034, 43.500000, -123.500000, NULL, NULL, '8563da83-0762-4d29-9b22-da5b52ef0f24');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, '5ee7a6b1-e82a-4a6d-90d1-9a8bbf2017a8', 'Facility 35', 'Medium Facility', NULL, NULL, NULL, NULL, '13219990024', 1035, 43.500000, -123.500000, NULL, NULL, '8563da83-0762-4d29-9b22-da5b52ef0f24');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'd844683d-e894-4dfe-9d2d-49944ec86005', 'Facility 36', 'Medium Facility', NULL, NULL, NULL, NULL, NULL, 1036, 43.500000, -123.500000, NULL, NULL, 'c5b3643b-c143-42f3-8a2b-03ccc7319cd9');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'c27356fe-c1b1-42df-8845-246ad057f43d', 'Facility 37', 'Medium Facility', NULL, NULL, NULL, NULL, NULL, 1037, 43.500000, -123.500000, NULL, NULL, '954c0382-ff61-4e87-a8a0-873586534b54');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'd477f3d9-2917-4f36-b5ae-166d47dc8172', 'Facility 38', 'Medium Facility', NULL, NULL, NULL, NULL, NULL, 1038, 43.500000, -123.500000, NULL, NULL, '6d07d02a-1ad2-46ed-ad56-2f84313e98bf');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, '80ccea58-1920-46ea-8260-23bfe9b4fef0', 'Facility 39', 'Medium Facility', NULL, NULL, NULL, NULL, NULL, 1039, 43.500000, -123.500000, NULL, NULL, '59d95661-c752-489b-9fd1-0c3fa3454dda');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'b66d0364-ad1d-42f4-93d9-82bf185c4304', 'Facility 40', 'Medium Facility', NULL, NULL, NULL, NULL, NULL, 1040, 43.500000, -123.500000, NULL, NULL, '17f13f4d-29b4-45f4-b025-b21f2e126771');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'fdd723fe-88f5-46fb-af50-c19f1407e46d', 'Facility 41', 'Medium Facility', NULL, NULL, NULL, NULL, NULL, 1041, 43.500000, -123.500000, NULL, NULL, 'ef9044dd-2a27-4d26-86fe-02e51e0755f7');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'a4ffa43d-3f47-4f0f-a423-fde5d91e9d87', 'Facility 42', 'Medium Facility', NULL, NULL, NULL, NULL, NULL, 1042, 43.500000, -123.500000, NULL, NULL, 'aeeb781e-a97b-4ab2-9a6e-02e4522add1a');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, 'f6f58bf4-2dd1-4669-b432-50281c6fdff6', 'Blight EIO - Draft', 'Electricity Import', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '02a3ab84-26c6-4a79-bf89-72f877ceef8e');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, '9f7b0848-021e-4d08-9852-10524c4e5457', 'Compliance Facility - Obligation not met', 'Single Facility', NULL, NULL, NULL, NULL, NULL, 1043, 43.500000, -123.500000, NULL, NULL, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488f');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, '9f7b0848-021e-4d08-9852-10524c4e5477', 'Compliance Facility - Earned credits', 'Single Facility', NULL, NULL, NULL, NULL, NULL, 1044, 3.500000, -12.500000, NULL, NULL, '84ea41f0-4039-44d8-9f91-0e1d5fd47930');
INSERT INTO erc.facility VALUES ('2026-02-11 16:58:55.455784-08', NULL, NULL, '9f7b0848-021e-4d08-9852-10524c4e5577', 'Compliance Facility - No obligation or earned credits', 'Single Facility', NULL, NULL, NULL, NULL, NULL, 1045, 32.000000, 32.000000, NULL, NULL, '3f47b2e1-9a4c-4d3f-8b21-7e9a0c5d2f6b');

INSERT INTO erc.closure_event_facilities VALUES (1, '127ccfbf-c344-4dcd-8c98-bbd9303d22a9', 'f486f2fb-62ed-438d-bb3e-0819b51e3aeb');
INSERT INTO erc.closure_event_facilities VALUES (2, '127ccfbf-c344-4dcd-8c98-bbd9303d22a9', '459b80f9-b5f3-48aa-9727-90c30eaf3a58');

INSERT INTO erc.report VALUES (1, '2026-02-11 16:58:56.581414-08', NULL, NULL, NULL, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, 2024);
INSERT INTO erc.report VALUES (2, '2026-02-11 16:58:56.738478-08', NULL, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d', '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, 2024);
INSERT INTO erc.report VALUES (3, '2026-02-11 16:58:56.877198-08', NULL, NULL, NULL, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488f', '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, 2025);
INSERT INTO erc.report VALUES (4, '2026-02-11 16:58:56.933521-08', NULL, NULL, NULL, '84ea41f0-4039-44d8-9f91-0e1d5fd47930', '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, 2025);
INSERT INTO erc.report VALUES (5, '2026-02-11 16:58:56.967961-08', NULL, NULL, NULL, '3f47b2e1-9a4c-4d3f-8b21-7e9a0c5d2f6b', '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, 2025);
INSERT INTO erc.report VALUES (6, '2026-02-11 16:58:57.012093-08', NULL, NULL, NULL, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488e', '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, 2024);
INSERT INTO erc.report VALUES (7, '2026-02-11 16:58:57.048346-08', NULL, NULL, NULL, '3f47b2e1-9a4c-4d3f-8b21-7e9a0c5d2f6b', '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, 2023);
INSERT INTO erc.report VALUES (8, '2026-02-11 16:58:57.09396-08', NULL, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d', '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, 2023);
INSERT INTO erc.report VALUES (9, '2026-02-11 16:58:57.217136-08', NULL, NULL, NULL, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488f', '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, 2023);
INSERT INTO erc.report VALUES (10, '2026-02-11 16:58:57.270343-08', NULL, NULL, NULL, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488e', '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, 2023);
INSERT INTO erc.report VALUES (11, '2026-02-11 16:58:57.311265-08', NULL, NULL, NULL, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488e', '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, 2022);
INSERT INTO erc.report VALUES (12, '2026-02-11 16:58:57.359194-08', NULL, NULL, NULL, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488e', '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, 2021);

INSERT INTO erc.compliance_report VALUES (1, '2026-02-11 16:58:57.729149-08', NULL, NULL, NULL, NULL, 1, NULL, 2, NULL);

INSERT INTO erc.report_version VALUES (1, '2026-02-11 16:58:56.581414-08', NULL, NULL, false, 'Draft', NULL, NULL, 1, NULL, 'Annual Report', NULL);
INSERT INTO erc.report_version VALUES (3, '2026-02-11 16:58:56.877198-08', NULL, NULL, false, 'Draft', NULL, NULL, 3, NULL, 'Annual Report', NULL);
INSERT INTO erc.report_version VALUES (4, '2026-02-11 16:58:56.933521-08', NULL, NULL, false, 'Draft', NULL, NULL, 4, NULL, 'Annual Report', NULL);
INSERT INTO erc.report_version VALUES (5, '2026-02-11 16:58:56.967961-08', NULL, NULL, false, 'Draft', NULL, NULL, 5, NULL, 'Annual Report', NULL);
INSERT INTO erc.report_version VALUES (7, '2026-02-11 16:58:57.048346-08', NULL, NULL, false, 'Draft', NULL, NULL, 7, NULL, 'Annual Report', NULL);
INSERT INTO erc.report_version VALUES (9, '2026-02-11 16:58:57.217136-08', NULL, NULL, false, 'Draft', NULL, NULL, 9, NULL, 'Annual Report', NULL);
INSERT INTO erc.report_version VALUES (2, '2026-02-11 16:58:56.738478-08', '2026-02-11 16:58:57.729149-08', NULL, true, 'Submitted', NULL, NULL, 2, NULL, 'Annual Report', NULL);
INSERT INTO erc.report_version VALUES (8, '2026-02-11 16:58:57.09396-08', '2026-02-11 16:58:59.016907-08', NULL, true, 'Submitted', NULL, NULL, 8, NULL, 'Annual Report', NULL);
INSERT INTO erc.report_version VALUES (6, '2026-02-11 16:58:57.012093-08', '2026-02-11 16:59:00.137684-08', NULL, true, 'Submitted', NULL, NULL, 6, NULL, 'Annual Report', NULL);
INSERT INTO erc.report_version VALUES (10, '2026-02-11 16:58:57.270343-08', '2026-02-11 16:59:00.216517-08', NULL, true, 'Submitted', NULL, NULL, 10, NULL, 'Annual Report', NULL);
INSERT INTO erc.report_version VALUES (11, '2026-02-11 16:58:57.311265-08', '2026-02-11 16:59:00.265377-08', NULL, true, 'Submitted', NULL, NULL, 11, NULL, 'Annual Report', NULL);
INSERT INTO erc.report_version VALUES (12, '2026-02-11 16:58:57.359194-08', '2026-02-11 16:59:00.314133-08', NULL, true, 'Submitted', NULL, NULL, 12, NULL, 'Annual Report', NULL);
INSERT INTO erc.report_version VALUES (13, '2026-02-11 16:59:00.352702-08', NULL, NULL, false, 'Draft', NULL, NULL, 2, NULL, 'Annual Report', NULL);
INSERT INTO erc.report_version VALUES (14, '2026-02-11 16:59:00.535579-08', NULL, NULL, false, 'Draft', NULL, NULL, 8, NULL, 'Annual Report', NULL);

INSERT INTO erc.report_compliance_summary VALUES (1, '2026-02-11 16:58:57.729149-08', NULL, NULL, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 2024, 2024, NULL, NULL, 2, NULL);
INSERT INTO erc.report_compliance_summary VALUES (2, '2026-02-11 16:58:59.016907-08', NULL, NULL, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 2024, 2023, NULL, NULL, 8, NULL);

INSERT INTO erc.compliance_report_version VALUES (1, '2026-02-11 16:58:57.729149-08', NULL, NULL, 0.0000, 0.0000, 'No obligation or earned credits', false, NULL, 1, NULL, NULL, 1, NULL);

INSERT INTO erc.contact VALUES (1, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Alice', 'Art', 'Manager', 'alice.art@example.com', '+16044011234', 1, NULL, 'Operation Representative', NULL, NULL, '685d581b-5698-411f-ae00-de1d97334a71');
INSERT INTO erc.contact VALUES (2, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Althea', 'Ark', 'Manager', 'althea.ark@example.com', '+16044011234', 2, NULL, 'Operation Representative', NULL, NULL, '685d581b-5698-411f-ae00-de1d97334a71');
INSERT INTO erc.contact VALUES (3, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Bill', 'Blue', 'Manager', 'bill.blue@example.com', '+16044011235', 3, NULL, 'Operation Representative', NULL, NULL, '4242ea9d-b917-4129-93c2-db00b7451051');
INSERT INTO erc.contact VALUES (4, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Bob', 'Brown', 'Manager', 'bob.brown@example.com', '+16044011236', 4, NULL, 'Operation Representative', NULL, NULL, '4242ea9d-b917-4129-93c2-db00b7451051');
INSERT INTO erc.contact VALUES (5, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Blair', 'Balloons - no address', 'Manager', 'blair.balloons@example.com', '+16044011237', NULL, NULL, 'Operation Representative', NULL, NULL, '4242ea9d-b917-4129-93c2-db00b7451051');
INSERT INTO erc.contact VALUES (6, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Bart', 'Banker - incomplete address', 'Manager', 'bart.banker@example.com', '+16044011238', 22, NULL, 'Operation Representative', NULL, NULL, '4242ea9d-b917-4129-93c2-db00b7451051');
INSERT INTO erc.contact VALUES (7, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Cherise', 'Cyclone', 'Manager', 'cherise.cyclone@example.com', '+16044011238', 1, NULL, 'Operation Representative', NULL, NULL, '438eff6c-d2e7-40ab-8220-29d3a86ef314');
INSERT INTO erc.contact VALUES (8, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Dina', 'Dessert', 'Manager', 'dina.dessert@example.com', '+16044011239', 7, NULL, 'Operation Representative', NULL, NULL, '7e8b72dc-4196-427f-a553-7879748139e1');
INSERT INTO erc.contact VALUES (9, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Eve', 'Foster', 'Manager', 'eve.foster@example.com', '+16044011239', 7, NULL, 'Operation Representative', NULL, NULL, '4c1010c1-55ca-485d-84bd-6d975fd0af90');
INSERT INTO erc.contact VALUES (10, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Frank', 'Garcia', 'Manager', 'frank.garcia@example.com', '+16044011240', 8, NULL, 'Operation Representative', NULL, NULL, '5712ee05-5f3b-4822-825d-6fffddafda4c');
INSERT INTO erc.contact VALUES (11, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Grace', 'Harris', 'Manager', 'grace.harris@example.com', '+16044011241', 9, NULL, 'Operation Representative', NULL, NULL, 'edb1aff1-f888-4199-ab88-068364496347');
INSERT INTO erc.contact VALUES (12, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Henry', 'Ives', 'Manager', 'henry.ives@example.com', '+16044011242', 10, NULL, 'Operation Representative', NULL, NULL, 'ea4314ea-1974-465a-a851-278c8f9c8daa');
INSERT INTO erc.contact VALUES (13, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Ivy', 'Inkblot - no address', 'Manager', 'ivy.inkblot@example.com', '+16044011243', NULL, NULL, 'Operation Representative', NULL, NULL, '04384911-264a-4510-b582-11ee704b8e41');
INSERT INTO erc.contact VALUES (14, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Jack', 'Jones - incomplete address', 'Manager', 'jack.jones@example.com', '+16044011244', 22, NULL, 'Operation Representative', NULL, NULL, 'f209ef09-dfe6-42a1-ac4c-7689897f1b51');
INSERT INTO erc.contact VALUES (15, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Karen', 'Lewis', 'Manager', 'karen.lewis@example.com', '+16044011245', 13, NULL, 'Operation Representative', NULL, NULL, 'bb979661-0782-49b2-9c64-acd8424b692b');
INSERT INTO erc.contact VALUES (16, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Leo', 'Martinez', 'Manager', 'leo.martinez@example.com', '+16044011246', 14, NULL, 'Operation Representative', NULL, NULL, 'bb702949-e303-4788-9ba9-806232a5f711');
INSERT INTO erc.contact VALUES (17, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Mia', 'Nelson', 'Manager', 'mia.nelson@example.com', '+16044011247', 15, NULL, 'Operation Representative', NULL, NULL, 'a35fb5ad-edd9-4465-982e-81b824644d07');
INSERT INTO erc.contact VALUES (18, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Nina', 'Owens', 'Manager', 'nina.owens@example.com', '+16044011248', 16, NULL, 'Operation Representative', NULL, NULL, '5c847c75-3b17-414c-97f8-88ba81cb3821');
INSERT INTO erc.contact VALUES (19, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'Oscar', 'Perez', 'Manager', 'oscar.perez@example.com', '+16044011249', 17, NULL, 'Operation Representative', NULL, NULL, '4a792f0f-cf9d-48c8-9a95-f504c5f84b12');
INSERT INTO erc.contact VALUES (20, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'bc-cas-dev', 'Industry User', 'Manager', 'bc-cas-dev@email.com', '+16044011249', 17, NULL, 'Operation Representative', NULL, NULL, '4242ea9d-b917-4129-93c2-db00b7451051');
INSERT INTO erc.contact VALUES (21, '2026-02-11 16:58:53.35751-08', NULL, NULL, 'bc-cas-dev-secondary', 'Industry User', 'Manager', 'email2@email.com', '+16044011249', 17, NULL, 'Operation Representative', NULL, NULL, '4242ea9d-b917-4129-93c2-db00b7451051');

INSERT INTO erc.document VALUES (1, '2026-02-11 16:58:55.259151-08', NULL, NULL, 'documents/file1.pdf', 'A signed statutory declaration for opt-in.', NULL, NULL, 2, NULL, NULL, 'Unscanned');
INSERT INTO erc.document VALUES (2, '2026-02-11 16:58:55.259151-08', NULL, NULL, 'documents/file2.pdf', 'A boundary map document.', NULL, NULL, 1, NULL, NULL, 'Unscanned');

INSERT INTO erc.facility_designated_operation_timeline VALUES (1, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:19:32-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aeb', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (2, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:19:56-07', '2024-06-28 16:20:02-07', NULL, NULL, '459b80f9-b5f3-48aa-9727-90c30eaf3a58', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (3, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:19:57-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aec', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (4, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:19:58-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aed', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (5, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:19:59-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aee', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (6, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:19:59-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aef', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (7, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:20:00-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af0', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (8, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:20:00-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af1', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (9, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:20:01-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af2', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (10, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:20:01-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af3', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (11, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:20:02-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af4', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (12, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:20:02-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af5', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (13, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:20:03-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af6', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (14, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:20:03-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af7', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (15, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:20:04-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af8', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (16, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:20:04-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af9', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (17, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:20:05-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afa', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (18, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:20:05-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afb', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (19, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:20:05-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afc', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (20, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:20:06-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afd', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (21, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:20:06-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afe', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (22, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-05 16:20:07-07', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aff', '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (23, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, '459b80f9-b5f3-48aa-9727-90c30eaf3a58', 'e1300fd7-2dee-47d1-b655-2ad3fd10f052', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (24, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, '4486f2fb-62ed-438d-bb3e-0819b51e3aff', '1bd04128-d070-4d3a-940a-0874c4956181', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (25, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, '67fd8288-422b-43d3-a9b1-e4ddc54e2139', 'df62d793-8cfe-4272-a93e-ea9c9139ff82', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (26, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, '9f7b0848-021e-4d08-9852-10524c4e5456', 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488e', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (27, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, 'f4eb89dd-e081-4576-8663-b789c4a20478', 'd99725a7-1c3a-47cb-a59b-e2388ce0fa18', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (28, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, '6d564423-abfe-4579-ba92-2c6c71c37bb9', '436dd99a-cb41-4494-91c9-98ab149b557d', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (29, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, 'f466e6fc-f338-4cf7-89b0-0211bd2be8b7', 'a47b5fb6-1e10-401a-b70e-574bd925db99', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (30, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, 'f2461804-f38a-4fcc-8586-7ee6eaefa830', '21e70498-c4b0-4525-8443-86faa96206e3', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (31, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, 'fab6a6a7-3c9b-426f-88fb-a9c06474fe51', '17550cd8-3e73-4e52-aa91-ab90cb3b62b0', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (32, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, '80db5b3a-b06b-4c06-b257-edaa4e873160', '7d3fc7d1-0504-4ee4-a9c5-447f4b324b57', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (33, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, '8d0777dd-b691-4079-9253-fca63df79300', 'acf5811e-d521-43f7-a5c7-a6d6dd47bb31', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (34, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, 'e5ade67f-f9ce-496c-b0ad-b8edcd7ecd08', '8563da83-0762-4d29-9b22-da5b52ef0f24', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (35, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, '5ee7a6b1-e82a-4a6d-90d1-9a8bbf2017a8', '8563da83-0762-4d29-9b22-da5b52ef0f24', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (36, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, 'd844683d-e894-4dfe-9d2d-49944ec86005', 'c5b3643b-c143-42f3-8a2b-03ccc7319cd9', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (37, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, 'c27356fe-c1b1-42df-8845-246ad057f43d', '954c0382-ff61-4e87-a8a0-873586534b54', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (38, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, 'd477f3d9-2917-4f36-b5ae-166d47dc8172', '6d07d02a-1ad2-46ed-ad56-2f84313e98bf', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (39, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, '80ccea58-1920-46ea-8260-23bfe9b4fef0', '59d95661-c752-489b-9fd1-0c3fa3454dda', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (40, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, 'b66d0364-ad1d-42f4-93d9-82bf185c4304', '17f13f4d-29b4-45f4-b025-b21f2e126771', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (41, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, 'fdd723fe-88f5-46fb-af50-c19f1407e46d', 'ef9044dd-2a27-4d26-86fe-02e51e0755f7', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (42, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, 'a4ffa43d-3f47-4f0f-a423-fde5d91e9d87', 'aeeb781e-a97b-4ab2-9a6e-02e4522add1a', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (43, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, 'f6f58bf4-2dd1-4669-b432-50281c6fdff6', '02a3ab84-26c6-4a79-bf89-72f877ceef8e', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (44, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, '9f7b0848-021e-4d08-9852-10524c4e5457', 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488f', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (45, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, '9f7b0848-021e-4d08-9852-10524c4e5477', '84ea41f0-4039-44d8-9f91-0e1d5fd47930', NULL);
INSERT INTO erc.facility_designated_operation_timeline VALUES (46, '2026-02-11 16:58:55.68535-08', NULL, NULL, '2024-06-28 16:20:02-07', NULL, NULL, NULL, '9f7b0848-021e-4d08-9852-10524c4e5577', '3f47b2e1-9a4c-4d3f-8b21-7e9a0c5d2f6b', NULL);

INSERT INTO erc.facility_report VALUES (1, '2026-02-11 16:58:56.581414-08', NULL, NULL, 'Facility 22', 'Single Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aff', NULL, 1, false);
INSERT INTO erc.facility_report VALUES (2, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 1', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aeb', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (3, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 3', 'Medium Facility', '13219990007', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aec', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (4, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 4', 'Small Aggregate', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aed', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (5, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 5', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aee', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (6, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 6', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aef', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (7, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 7', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af0', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (8, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 8', 'Large Facility', '13219990012', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af1', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (9, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 9', 'Large Facility', '13219990013', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af2', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (10, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 10', 'Large Facility', '13219990014', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af3', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (11, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 11', 'Large Facility', '13219990015', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af4', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (12, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 12', 'Large Facility', '13219990016', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af5', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (13, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 13', 'Large Facility', '13219990017', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af6', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (14, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 14', 'Large Facility', '13219990018', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af7', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (15, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 15', 'Large Facility', '13219990019', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af8', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (16, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 16', 'Large Facility', '13219990020', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af9', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (17, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 17', 'Large Facility', '13219990021', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afa', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (18, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 18', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afb', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (19, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 19', 'Large Facility', '13219990023', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afc', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (20, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 20', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afd', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (21, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Facility 21', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afe', NULL, 2, false);
INSERT INTO erc.facility_report VALUES (22, '2026-02-11 16:58:56.877198-08', NULL, NULL, 'Compliance Facility - Obligation not met', 'Single Facility', NULL, NULL, NULL, '9f7b0848-021e-4d08-9852-10524c4e5457', NULL, 3, false);
INSERT INTO erc.facility_report VALUES (23, '2026-02-11 16:58:56.933521-08', NULL, NULL, 'Compliance Facility - Earned credits', 'Single Facility', NULL, NULL, NULL, '9f7b0848-021e-4d08-9852-10524c4e5477', NULL, 4, false);
INSERT INTO erc.facility_report VALUES (24, '2026-02-11 16:58:56.967961-08', NULL, NULL, 'Compliance Facility - No obligation or earned credits', 'Single Facility', NULL, NULL, NULL, '9f7b0848-021e-4d08-9852-10524c4e5577', NULL, 5, false);
INSERT INTO erc.facility_report VALUES (25, '2026-02-11 16:58:57.012093-08', NULL, NULL, 'Bubblegum', 'Single Facility', '23219990001', NULL, NULL, '9f7b0848-021e-4d08-9852-10524c4e5456', NULL, 6, false);
INSERT INTO erc.facility_report VALUES (26, '2026-02-11 16:58:57.048346-08', NULL, NULL, 'Compliance Facility - No obligation or earned credits', 'Single Facility', NULL, NULL, NULL, '9f7b0848-021e-4d08-9852-10524c4e5577', NULL, 7, false);
INSERT INTO erc.facility_report VALUES (27, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 1', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aeb', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (28, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 3', 'Medium Facility', '13219990007', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aec', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (29, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 4', 'Small Aggregate', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aed', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (30, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 5', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aee', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (31, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 6', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aef', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (32, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 7', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af0', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (33, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 8', 'Large Facility', '13219990012', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af1', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (34, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 9', 'Large Facility', '13219990013', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af2', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (35, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 10', 'Large Facility', '13219990014', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af3', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (36, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 11', 'Large Facility', '13219990015', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af4', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (37, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 12', 'Large Facility', '13219990016', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af5', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (38, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 13', 'Large Facility', '13219990017', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af6', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (39, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 14', 'Large Facility', '13219990018', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af7', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (40, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 15', 'Large Facility', '13219990019', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af8', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (41, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 16', 'Large Facility', '13219990020', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af9', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (42, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 17', 'Large Facility', '13219990021', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afa', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (43, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 18', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afb', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (44, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 19', 'Large Facility', '13219990023', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afc', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (45, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 20', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afd', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (46, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Facility 21', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afe', NULL, 8, false);
INSERT INTO erc.facility_report VALUES (47, '2026-02-11 16:58:57.217136-08', NULL, NULL, 'Compliance Facility - Obligation not met', 'Single Facility', NULL, NULL, NULL, '9f7b0848-021e-4d08-9852-10524c4e5457', NULL, 9, false);
INSERT INTO erc.facility_report VALUES (48, '2026-02-11 16:58:57.270343-08', NULL, NULL, 'Bubblegum', 'Single Facility', '23219990001', NULL, NULL, '9f7b0848-021e-4d08-9852-10524c4e5456', NULL, 10, false);
INSERT INTO erc.facility_report VALUES (49, '2026-02-11 16:58:57.311265-08', NULL, NULL, 'Bubblegum', 'Single Facility', '23219990001', NULL, NULL, '9f7b0848-021e-4d08-9852-10524c4e5456', NULL, 11, false);
INSERT INTO erc.facility_report VALUES (50, '2026-02-11 16:58:57.359194-08', NULL, NULL, 'Bubblegum', 'Single Facility', '23219990001', NULL, NULL, '9f7b0848-021e-4d08-9852-10524c4e5456', NULL, 12, false);
INSERT INTO erc.facility_report VALUES (51, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 1', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aeb', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (52, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 3', 'Medium Facility', '13219990007', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aec', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (53, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 4', 'Small Aggregate', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aed', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (54, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 5', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aee', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (55, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 6', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aef', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (56, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 7', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af0', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (57, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 8', 'Large Facility', '13219990012', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af1', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (58, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 9', 'Large Facility', '13219990013', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af2', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (59, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 10', 'Large Facility', '13219990014', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af3', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (60, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 11', 'Large Facility', '13219990015', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af4', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (61, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 12', 'Large Facility', '13219990016', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af5', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (62, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 13', 'Large Facility', '13219990017', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af6', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (63, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 14', 'Large Facility', '13219990018', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af7', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (64, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 15', 'Large Facility', '13219990019', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af8', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (65, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 16', 'Large Facility', '13219990020', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af9', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (66, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 17', 'Large Facility', '13219990021', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afa', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (67, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 18', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afb', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (68, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 19', 'Large Facility', '13219990023', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afc', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (69, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 20', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afd', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (70, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Facility 21', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afe', NULL, 13, false);
INSERT INTO erc.facility_report VALUES (71, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 1', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aeb', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (72, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 3', 'Medium Facility', '13219990007', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aec', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (73, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 4', 'Small Aggregate', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aed', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (74, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 5', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aee', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (75, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 6', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aef', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (76, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 7', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af0', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (77, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 8', 'Large Facility', '13219990012', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af1', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (78, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 9', 'Large Facility', '13219990013', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af2', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (79, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 10', 'Large Facility', '13219990014', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af3', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (80, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 11', 'Large Facility', '13219990015', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af4', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (81, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 12', 'Large Facility', '13219990016', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af5', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (82, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 13', 'Large Facility', '13219990017', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af6', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (83, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 14', 'Large Facility', '13219990018', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af7', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (84, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 15', 'Large Facility', '13219990019', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af8', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (85, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 16', 'Large Facility', '13219990020', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3af9', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (86, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 17', 'Large Facility', '13219990021', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afa', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (87, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 18', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afb', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (88, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 19', 'Large Facility', '13219990023', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afc', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (89, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 20', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afd', NULL, 14, false);
INSERT INTO erc.facility_report VALUES (90, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Facility 21', 'Large Facility', NULL, NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3afe', NULL, 14, false);

INSERT INTO erc.facility_report_activities VALUES (1, 1, 1);
INSERT INTO erc.facility_report_activities VALUES (2, 1, 2);
INSERT INTO erc.facility_report_activities VALUES (3, 2, 1);
INSERT INTO erc.facility_report_activities VALUES (4, 3, 1);
INSERT INTO erc.facility_report_activities VALUES (5, 4, 1);
INSERT INTO erc.facility_report_activities VALUES (6, 5, 1);
INSERT INTO erc.facility_report_activities VALUES (7, 6, 1);
INSERT INTO erc.facility_report_activities VALUES (8, 7, 1);
INSERT INTO erc.facility_report_activities VALUES (9, 8, 1);
INSERT INTO erc.facility_report_activities VALUES (10, 9, 1);
INSERT INTO erc.facility_report_activities VALUES (11, 10, 1);
INSERT INTO erc.facility_report_activities VALUES (12, 11, 1);
INSERT INTO erc.facility_report_activities VALUES (13, 12, 1);
INSERT INTO erc.facility_report_activities VALUES (14, 13, 1);
INSERT INTO erc.facility_report_activities VALUES (15, 14, 1);
INSERT INTO erc.facility_report_activities VALUES (16, 15, 1);
INSERT INTO erc.facility_report_activities VALUES (17, 16, 1);
INSERT INTO erc.facility_report_activities VALUES (18, 17, 1);
INSERT INTO erc.facility_report_activities VALUES (19, 18, 1);
INSERT INTO erc.facility_report_activities VALUES (20, 19, 1);
INSERT INTO erc.facility_report_activities VALUES (21, 20, 1);
INSERT INTO erc.facility_report_activities VALUES (22, 21, 1);
INSERT INTO erc.facility_report_activities VALUES (23, 22, 1);
INSERT INTO erc.facility_report_activities VALUES (24, 23, 1);
INSERT INTO erc.facility_report_activities VALUES (25, 24, 1);
INSERT INTO erc.facility_report_activities VALUES (26, 25, 1);
INSERT INTO erc.facility_report_activities VALUES (27, 26, 1);
INSERT INTO erc.facility_report_activities VALUES (28, 27, 1);
INSERT INTO erc.facility_report_activities VALUES (29, 28, 1);
INSERT INTO erc.facility_report_activities VALUES (30, 29, 1);
INSERT INTO erc.facility_report_activities VALUES (31, 30, 1);
INSERT INTO erc.facility_report_activities VALUES (32, 31, 1);
INSERT INTO erc.facility_report_activities VALUES (33, 32, 1);
INSERT INTO erc.facility_report_activities VALUES (34, 33, 1);
INSERT INTO erc.facility_report_activities VALUES (35, 34, 1);
INSERT INTO erc.facility_report_activities VALUES (36, 35, 1);
INSERT INTO erc.facility_report_activities VALUES (37, 36, 1);
INSERT INTO erc.facility_report_activities VALUES (38, 37, 1);
INSERT INTO erc.facility_report_activities VALUES (39, 38, 1);
INSERT INTO erc.facility_report_activities VALUES (40, 39, 1);
INSERT INTO erc.facility_report_activities VALUES (41, 40, 1);
INSERT INTO erc.facility_report_activities VALUES (42, 41, 1);
INSERT INTO erc.facility_report_activities VALUES (43, 42, 1);
INSERT INTO erc.facility_report_activities VALUES (44, 43, 1);
INSERT INTO erc.facility_report_activities VALUES (45, 44, 1);
INSERT INTO erc.facility_report_activities VALUES (46, 45, 1);
INSERT INTO erc.facility_report_activities VALUES (47, 46, 1);
INSERT INTO erc.facility_report_activities VALUES (48, 47, 1);
INSERT INTO erc.facility_report_activities VALUES (49, 48, 1);
INSERT INTO erc.facility_report_activities VALUES (50, 49, 1);
INSERT INTO erc.facility_report_activities VALUES (51, 50, 1);
INSERT INTO erc.facility_report_activities VALUES (52, 51, 1);
INSERT INTO erc.facility_report_activities VALUES (53, 52, 1);
INSERT INTO erc.facility_report_activities VALUES (54, 53, 1);
INSERT INTO erc.facility_report_activities VALUES (55, 54, 1);
INSERT INTO erc.facility_report_activities VALUES (56, 55, 1);
INSERT INTO erc.facility_report_activities VALUES (57, 56, 1);
INSERT INTO erc.facility_report_activities VALUES (58, 57, 1);
INSERT INTO erc.facility_report_activities VALUES (59, 58, 1);
INSERT INTO erc.facility_report_activities VALUES (60, 59, 1);
INSERT INTO erc.facility_report_activities VALUES (61, 60, 1);
INSERT INTO erc.facility_report_activities VALUES (62, 61, 1);
INSERT INTO erc.facility_report_activities VALUES (63, 62, 1);
INSERT INTO erc.facility_report_activities VALUES (64, 63, 1);
INSERT INTO erc.facility_report_activities VALUES (65, 64, 1);
INSERT INTO erc.facility_report_activities VALUES (66, 65, 1);
INSERT INTO erc.facility_report_activities VALUES (67, 66, 1);
INSERT INTO erc.facility_report_activities VALUES (68, 67, 1);
INSERT INTO erc.facility_report_activities VALUES (69, 68, 1);
INSERT INTO erc.facility_report_activities VALUES (70, 69, 1);
INSERT INTO erc.facility_report_activities VALUES (71, 70, 1);
INSERT INTO erc.facility_report_activities VALUES (72, 71, 1);
INSERT INTO erc.facility_report_activities VALUES (73, 72, 1);
INSERT INTO erc.facility_report_activities VALUES (74, 73, 1);
INSERT INTO erc.facility_report_activities VALUES (75, 74, 1);
INSERT INTO erc.facility_report_activities VALUES (76, 75, 1);
INSERT INTO erc.facility_report_activities VALUES (77, 76, 1);
INSERT INTO erc.facility_report_activities VALUES (78, 77, 1);
INSERT INTO erc.facility_report_activities VALUES (79, 78, 1);
INSERT INTO erc.facility_report_activities VALUES (80, 79, 1);
INSERT INTO erc.facility_report_activities VALUES (81, 80, 1);
INSERT INTO erc.facility_report_activities VALUES (82, 81, 1);
INSERT INTO erc.facility_report_activities VALUES (83, 82, 1);
INSERT INTO erc.facility_report_activities VALUES (84, 83, 1);
INSERT INTO erc.facility_report_activities VALUES (85, 84, 1);
INSERT INTO erc.facility_report_activities VALUES (86, 85, 1);
INSERT INTO erc.facility_report_activities VALUES (87, 86, 1);
INSERT INTO erc.facility_report_activities VALUES (88, 87, 1);
INSERT INTO erc.facility_report_activities VALUES (89, 88, 1);
INSERT INTO erc.facility_report_activities VALUES (90, 89, 1);
INSERT INTO erc.facility_report_activities VALUES (91, 90, 1);

INSERT INTO erc.well_authorization_number VALUES ('2026-02-11 16:58:55.421812-08', NULL, NULL, 24634, NULL, NULL, NULL);
INSERT INTO erc.well_authorization_number VALUES ('2026-02-11 16:58:55.421812-08', NULL, NULL, 67394, NULL, NULL, NULL);
INSERT INTO erc.well_authorization_number VALUES ('2026-02-11 16:58:55.421812-08', NULL, NULL, 19454, NULL, NULL, NULL);

INSERT INTO erc.facility_well_authorization_numbers VALUES (1, 'f486f2fb-62ed-438d-bb3e-0819b51e3aeb', 24634);
INSERT INTO erc.facility_well_authorization_numbers VALUES (2, 'f486f2fb-62ed-438d-bb3e-0819b51e3aeb', 67394);
INSERT INTO erc.facility_well_authorization_numbers VALUES (3, 'f486f2fb-62ed-438d-bb3e-0819b51e3aeb', 19454);

INSERT INTO erc.multiple_operator VALUES (1, '2026-02-11 16:58:55.198777-08', NULL, NULL, 'Multiple Operator Legal Name', 'Multiple Operator Trade Name', '123456789', 'abc1234567', NULL, 'Sole Proprietorship', NULL, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488e', NULL, 1);

INSERT INTO erc.operation_activities VALUES (1, 'e1300fd7-2dee-47d1-b655-2ad3fd10f052', 1);
INSERT INTO erc.operation_activities VALUES (2, 'e1300fd7-2dee-47d1-b655-2ad3fd10f052', 5);
INSERT INTO erc.operation_activities VALUES (3, '002d5a9e-32a6-4191-938c-2c02bfec592d', 1);
INSERT INTO erc.operation_activities VALUES (4, '556ceeb0-7e24-4d89-b639-61f625f82084', 1);
INSERT INTO erc.operation_activities VALUES (5, '556ceeb0-7e24-4d89-b639-61f625f82084', 5);
INSERT INTO erc.operation_activities VALUES (6, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', 1);
INSERT INTO erc.operation_activities VALUES (7, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', 2);
INSERT INTO erc.operation_activities VALUES (8, 'c0743c09-82fa-4186-91aa-4b5412e3415c', 1);
INSERT INTO erc.operation_activities VALUES (9, 'c0743c09-82fa-4186-91aa-4b5412e3415c', 5);
INSERT INTO erc.operation_activities VALUES (10, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488e', 1);
INSERT INTO erc.operation_activities VALUES (11, 'd99725a7-1c3a-47cb-a59b-e2388ce0fa18', 1);
INSERT INTO erc.operation_activities VALUES (12, 'd99725a7-1c3a-47cb-a59b-e2388ce0fa18', 5);
INSERT INTO erc.operation_activities VALUES (13, '436dd99a-cb41-4494-91c9-98ab149b557d', 1);
INSERT INTO erc.operation_activities VALUES (14, '436dd99a-cb41-4494-91c9-98ab149b557d', 5);
INSERT INTO erc.operation_activities VALUES (15, 'a47b5fb6-1e10-401a-b70e-574bd925db99', 1);
INSERT INTO erc.operation_activities VALUES (16, 'a47b5fb6-1e10-401a-b70e-574bd925db99', 5);
INSERT INTO erc.operation_activities VALUES (17, '21e70498-c4b0-4525-8443-86faa96206e3', 1);
INSERT INTO erc.operation_activities VALUES (18, '21e70498-c4b0-4525-8443-86faa96206e3', 5);
INSERT INTO erc.operation_activities VALUES (19, '17550cd8-3e73-4e52-aa91-ab90cb3b62b0', 1);
INSERT INTO erc.operation_activities VALUES (20, '17550cd8-3e73-4e52-aa91-ab90cb3b62b0', 5);
INSERT INTO erc.operation_activities VALUES (21, '7d3fc7d1-0504-4ee4-a9c5-447f4b324b57', 1);
INSERT INTO erc.operation_activities VALUES (22, '7d3fc7d1-0504-4ee4-a9c5-447f4b324b57', 5);
INSERT INTO erc.operation_activities VALUES (23, 'acf5811e-d521-43f7-a5c7-a6d6dd47bb31', 1);
INSERT INTO erc.operation_activities VALUES (24, 'acf5811e-d521-43f7-a5c7-a6d6dd47bb31', 5);
INSERT INTO erc.operation_activities VALUES (25, '8563da83-0762-4d29-9b22-da5b52ef0f24', 1);
INSERT INTO erc.operation_activities VALUES (26, '8563da83-0762-4d29-9b22-da5b52ef0f24', 5);
INSERT INTO erc.operation_activities VALUES (27, 'c5b3643b-c143-42f3-8a2b-03ccc7319cd9', 1);
INSERT INTO erc.operation_activities VALUES (28, 'c5b3643b-c143-42f3-8a2b-03ccc7319cd9', 5);
INSERT INTO erc.operation_activities VALUES (29, '954c0382-ff61-4e87-a8a0-873586534b54', 1);
INSERT INTO erc.operation_activities VALUES (30, '6d07d02a-1ad2-46ed-ad56-2f84313e98bf', 1);
INSERT INTO erc.operation_activities VALUES (31, '6d07d02a-1ad2-46ed-ad56-2f84313e98bf', 5);
INSERT INTO erc.operation_activities VALUES (32, '59d95661-c752-489b-9fd1-0c3fa3454dda', 1);
INSERT INTO erc.operation_activities VALUES (33, '59d95661-c752-489b-9fd1-0c3fa3454dda', 5);
INSERT INTO erc.operation_activities VALUES (34, '1bd04128-d070-4d3a-940a-0874c4956181', 1);
INSERT INTO erc.operation_activities VALUES (35, '1bd04128-d070-4d3a-940a-0874c4956181', 3);
INSERT INTO erc.operation_activities VALUES (36, '17f13f4d-29b4-45f4-b025-b21f2e126771', 1);
INSERT INTO erc.operation_activities VALUES (37, 'ef9044dd-2a27-4d26-86fe-02e51e0755f7', 1);
INSERT INTO erc.operation_activities VALUES (38, 'aeeb781e-a97b-4ab2-9a6e-02e4522add1a', 1);
INSERT INTO erc.operation_activities VALUES (39, 'aeeb781e-a97b-4ab2-9a6e-02e4522add1a', 5);
INSERT INTO erc.operation_activities VALUES (40, '0ac72fa9-2636-4f54-b378-af6b1a070787', 1);
INSERT INTO erc.operation_activities VALUES (41, '0ac72fa9-2636-4f54-b378-af6b1a070787', 3);
INSERT INTO erc.operation_activities VALUES (42, 'b35a2095-80e6-4b75-990e-ccf19a57edfa', 1);
INSERT INTO erc.operation_activities VALUES (43, 'b35a2095-80e6-4b75-990e-ccf19a57edfa', 5);
INSERT INTO erc.operation_activities VALUES (44, '1d59cb82-2776-4785-a8f7-4b13bc9b4579', 1);
INSERT INTO erc.operation_activities VALUES (45, '1d59cb82-2776-4785-a8f7-4b13bc9b4579', 5);
INSERT INTO erc.operation_activities VALUES (46, '82e6ac8f-42f2-42a7-b179-132a3488b2e1', 1);
INSERT INTO erc.operation_activities VALUES (47, '82e6ac8f-42f2-42a7-b179-132a3488b2e1', 5);
INSERT INTO erc.operation_activities VALUES (48, '95f6ec29-4b5b-42a2-9759-d4e9c99738d7', 1);
INSERT INTO erc.operation_activities VALUES (49, '95f6ec29-4b5b-42a2-9759-d4e9c99738d7', 5);
INSERT INTO erc.operation_activities VALUES (50, '1b21579c-87f9-452f-b9c1-c784cb96f62e', 1);
INSERT INTO erc.operation_activities VALUES (51, '1b21579c-87f9-452f-b9c1-c784cb96f62e', 5);
INSERT INTO erc.operation_activities VALUES (52, '4623c545-ef99-464a-bd8b-bb96ffb57e8e', 1);
INSERT INTO erc.operation_activities VALUES (53, '4623c545-ef99-464a-bd8b-bb96ffb57e8e', 5);
INSERT INTO erc.operation_activities VALUES (54, 'f82c2a59-0f3a-4a89-b7d7-9fcd7a7ecb77', 1);
INSERT INTO erc.operation_activities VALUES (55, 'f82c2a59-0f3a-4a89-b7d7-9fcd7a7ecb77', 5);
INSERT INTO erc.operation_activities VALUES (56, '3182c8a4-22ff-4ca9-9f91-093c8888fd7c', 1);
INSERT INTO erc.operation_activities VALUES (57, '3182c8a4-22ff-4ca9-9f91-093c8888fd7c', 5);
INSERT INTO erc.operation_activities VALUES (58, '68f0b68a-c6b5-4c4e-82a6-d7fbd690f55e', 1);
INSERT INTO erc.operation_activities VALUES (59, '68f0b68a-c6b5-4c4e-82a6-d7fbd690f55e', 5);
INSERT INTO erc.operation_activities VALUES (60, 'a5f7f5b3-fb56-4377-ae6c-b11c8b6d0041', 1);
INSERT INTO erc.operation_activities VALUES (61, 'a5f7f5b3-fb56-4377-ae6c-b11c8b6d0041', 5);
INSERT INTO erc.operation_activities VALUES (62, '8494e89c-489b-441b-a05d-e935b1d82487', 1);
INSERT INTO erc.operation_activities VALUES (63, '8494e89c-489b-441b-a05d-e935b1d82487', 5);
INSERT INTO erc.operation_activities VALUES (64, '84d4c8b7-55b5-4700-90ad-fb1c169d4e1f', 1);
INSERT INTO erc.operation_activities VALUES (65, '84d4c8b7-55b5-4700-90ad-fb1c169d4e1f', 5);
INSERT INTO erc.operation_activities VALUES (66, '62d5d8ea-b163-4a83-95a4-bfadbb6b21f7', 1);
INSERT INTO erc.operation_activities VALUES (67, '62d5d8ea-b163-4a83-95a4-bfadbb6b21f7', 5);
INSERT INTO erc.operation_activities VALUES (68, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488f', 1);
INSERT INTO erc.operation_activities VALUES (69, '84ea41f0-4039-44d8-9f91-0e1d5fd47930', 1);
INSERT INTO erc.operation_activities VALUES (70, '3f47b2e1-9a4c-4d3f-8b21-7e9a0c5d2f6b', 1);

INSERT INTO erc.operation_contacts VALUES (1, 'e1300fd7-2dee-47d1-b655-2ad3fd10f052', 1);
INSERT INTO erc.operation_contacts VALUES (2, 'e1300fd7-2dee-47d1-b655-2ad3fd10f052', 2);
INSERT INTO erc.operation_contacts VALUES (3, '002d5a9e-32a6-4191-938c-2c02bfec592d', 3);
INSERT INTO erc.operation_contacts VALUES (4, '002d5a9e-32a6-4191-938c-2c02bfec592d', 4);
INSERT INTO erc.operation_contacts VALUES (5, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', 3);
INSERT INTO erc.operation_contacts VALUES (6, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', 4);
INSERT INTO erc.operation_contacts VALUES (7, 'c0743c09-82fa-4186-91aa-4b5412e3415c', 1);
INSERT INTO erc.operation_contacts VALUES (8, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488e', 3);
INSERT INTO erc.operation_contacts VALUES (9, 'd99725a7-1c3a-47cb-a59b-e2388ce0fa18', 1);
INSERT INTO erc.operation_contacts VALUES (10, '436dd99a-cb41-4494-91c9-98ab149b557d', 2);
INSERT INTO erc.operation_contacts VALUES (11, 'a47b5fb6-1e10-401a-b70e-574bd925db99', 1);
INSERT INTO erc.operation_contacts VALUES (12, '21e70498-c4b0-4525-8443-86faa96206e3', 1);
INSERT INTO erc.operation_contacts VALUES (13, '17550cd8-3e73-4e52-aa91-ab90cb3b62b0', 2);
INSERT INTO erc.operation_contacts VALUES (14, '7d3fc7d1-0504-4ee4-a9c5-447f4b324b57', 1);
INSERT INTO erc.operation_contacts VALUES (15, '7d3fc7d1-0504-4ee4-a9c5-447f4b324b57', 2);
INSERT INTO erc.operation_contacts VALUES (16, 'acf5811e-d521-43f7-a5c7-a6d6dd47bb31', 1);
INSERT INTO erc.operation_contacts VALUES (17, 'acf5811e-d521-43f7-a5c7-a6d6dd47bb31', 2);
INSERT INTO erc.operation_contacts VALUES (18, '8563da83-0762-4d29-9b22-da5b52ef0f24', 1);
INSERT INTO erc.operation_contacts VALUES (19, 'df62d793-8cfe-4272-a93e-ea9c9139ff82', 4);
INSERT INTO erc.operation_contacts VALUES (20, 'c5b3643b-c143-42f3-8a2b-03ccc7319cd9', 4);
INSERT INTO erc.operation_contacts VALUES (21, '6d07d02a-1ad2-46ed-ad56-2f84313e98bf', 3);
INSERT INTO erc.operation_contacts VALUES (22, '1bd04128-d070-4d3a-940a-0874c4956181', 4);
INSERT INTO erc.operation_contacts VALUES (23, '17f13f4d-29b4-45f4-b025-b21f2e126771', 3);
INSERT INTO erc.operation_contacts VALUES (24, 'ef9044dd-2a27-4d26-86fe-02e51e0755f7', 3);
INSERT INTO erc.operation_contacts VALUES (25, 'aeeb781e-a97b-4ab2-9a6e-02e4522add1a', 4);
INSERT INTO erc.operation_contacts VALUES (26, 'b35a2095-80e6-4b75-990e-ccf19a57edfa', 7);
INSERT INTO erc.operation_contacts VALUES (27, '1d59cb82-2776-4785-a8f7-4b13bc9b4579', 8);
INSERT INTO erc.operation_contacts VALUES (28, '82e6ac8f-42f2-42a7-b179-132a3488b2e1', 9);
INSERT INTO erc.operation_contacts VALUES (29, '95f6ec29-4b5b-42a2-9759-d4e9c99738d7', 10);
INSERT INTO erc.operation_contacts VALUES (30, '1b21579c-87f9-452f-b9c1-c784cb96f62e', 11);
INSERT INTO erc.operation_contacts VALUES (31, '4623c545-ef99-464a-bd8b-bb96ffb57e8e', 12);
INSERT INTO erc.operation_contacts VALUES (32, 'f82c2a59-0f3a-4a89-b7d7-9fcd7a7ecb77', 13);
INSERT INTO erc.operation_contacts VALUES (33, '3182c8a4-22ff-4ca9-9f91-093c8888fd7c', 14);
INSERT INTO erc.operation_contacts VALUES (34, '68f0b68a-c6b5-4c4e-82a6-d7fbd690f55e', 15);
INSERT INTO erc.operation_contacts VALUES (35, 'a5f7f5b3-fb56-4377-ae6c-b11c8b6d0041', 16);
INSERT INTO erc.operation_contacts VALUES (36, '8494e89c-489b-441b-a05d-e935b1d82487', 17);
INSERT INTO erc.operation_contacts VALUES (37, '84d4c8b7-55b5-4700-90ad-fb1c169d4e1f', 18);
INSERT INTO erc.operation_contacts VALUES (38, '62d5d8ea-b163-4a83-95a4-bfadbb6b21f7', 19);
INSERT INTO erc.operation_contacts VALUES (39, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488f', 3);
INSERT INTO erc.operation_contacts VALUES (40, '84ea41f0-4039-44d8-9f91-0e1d5fd47930', 4);
INSERT INTO erc.operation_contacts VALUES (41, '3f47b2e1-9a4c-4d3f-8b21-7e9a0c5d2f6b', 4);

INSERT INTO erc.operation_designated_operator_timeline VALUES (1, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', '2024-06-28 16:21:01-07', NULL, NULL, 'e1300fd7-2dee-47d1-b655-2ad3fd10f052', '685d581b-5698-411f-ae00-de1d97334a71', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (2, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2023-06-05 16:20:57-07', NULL, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d', '4242ea9d-b917-4129-93c2-db00b7451051', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (3, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', '4242ea9d-b917-4129-93c2-db00b7451051', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (4, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, 'c0743c09-82fa-4186-91aa-4b5412e3415c', '685d581b-5698-411f-ae00-de1d97334a71', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (5, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2021-06-05 16:20:57-07', NULL, NULL, NULL, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488e', '4242ea9d-b917-4129-93c2-db00b7451051', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (6, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, 'd99725a7-1c3a-47cb-a59b-e2388ce0fa18', '685d581b-5698-411f-ae00-de1d97334a71', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (7, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, '436dd99a-cb41-4494-91c9-98ab149b557d', '685d581b-5698-411f-ae00-de1d97334a71', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (8, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, 'a47b5fb6-1e10-401a-b70e-574bd925db99', '685d581b-5698-411f-ae00-de1d97334a71', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (9, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, '21e70498-c4b0-4525-8443-86faa96206e3', '685d581b-5698-411f-ae00-de1d97334a71', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (10, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, '17550cd8-3e73-4e52-aa91-ab90cb3b62b0', '685d581b-5698-411f-ae00-de1d97334a71', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (11, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, '7d3fc7d1-0504-4ee4-a9c5-447f4b324b57', '685d581b-5698-411f-ae00-de1d97334a71', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (12, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, 'acf5811e-d521-43f7-a5c7-a6d6dd47bb31', '685d581b-5698-411f-ae00-de1d97334a71', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (13, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, '8563da83-0762-4d29-9b22-da5b52ef0f24', '685d581b-5698-411f-ae00-de1d97334a71', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (14, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, 'df62d793-8cfe-4272-a93e-ea9c9139ff82', '4242ea9d-b917-4129-93c2-db00b7451051', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (15, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, 'c5b3643b-c143-42f3-8a2b-03ccc7319cd9', '4242ea9d-b917-4129-93c2-db00b7451051', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (16, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, '954c0382-ff61-4e87-a8a0-873586534b54', '4242ea9d-b917-4129-93c2-db00b7451051', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (17, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, '6d07d02a-1ad2-46ed-ad56-2f84313e98bf', '4242ea9d-b917-4129-93c2-db00b7451051', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (18, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, '59d95661-c752-489b-9fd1-0c3fa3454dda', '4242ea9d-b917-4129-93c2-db00b7451051', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (19, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, '1bd04128-d070-4d3a-940a-0874c4956181', '4242ea9d-b917-4129-93c2-db00b7451051', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (20, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, '17f13f4d-29b4-45f4-b025-b21f2e126771', '4242ea9d-b917-4129-93c2-db00b7451051', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (21, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, 'ef9044dd-2a27-4d26-86fe-02e51e0755f7', '4242ea9d-b917-4129-93c2-db00b7451051', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (22, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, 'aeeb781e-a97b-4ab2-9a6e-02e4522add1a', '4242ea9d-b917-4129-93c2-db00b7451051', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (23, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, '02a3ab84-26c6-4a79-bf89-72f877ceef8e', '4242ea9d-b917-4129-93c2-db00b7451051', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (24, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, '0ac72fa9-2636-4f54-b378-af6b1a070787', '4242ea9d-b917-4129-93c2-db00b7451051', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (25, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', '2024-06-05 16:20:57-07', NULL, NULL, '0ac72fa9-2636-4f54-b378-af6b1a070787', '685d581b-5698-411f-ae00-de1d97334a71', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (26, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, '556ceeb0-7e24-4d89-b639-61f625f82084', '4242ea9d-b917-4129-93c2-db00b7451051', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (27, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:21:02.353-07', NULL, NULL, NULL, 'b35a2095-80e6-4b75-990e-ccf19a57edfa', '438eff6c-d2e7-40ab-8220-29d3a86ef314', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (28, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:21:02.353-07', NULL, NULL, NULL, '1d59cb82-2776-4785-a8f7-4b13bc9b4579', '7e8b72dc-4196-427f-a553-7879748139e1', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (29, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-12-06 13:09:07-08', NULL, NULL, NULL, '82e6ac8f-42f2-42a7-b179-132a3488b2e1', '4c1010c1-55ca-485d-84bd-6d975fd0af90', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (30, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-12-06 13:09:07-08', NULL, NULL, NULL, '95f6ec29-4b5b-42a2-9759-d4e9c99738d7', '5712ee05-5f3b-4822-825d-6fffddafda4c', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (31, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-12-06 13:09:07-08', NULL, NULL, NULL, '1b21579c-87f9-452f-b9c1-c784cb96f62e', 'edb1aff1-f888-4199-ab88-068364496347', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (32, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-12-06 13:09:07-08', NULL, NULL, NULL, '4623c545-ef99-464a-bd8b-bb96ffb57e8e', 'ea4314ea-1974-465a-a851-278c8f9c8daa', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (33, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-12-06 13:09:07-08', NULL, NULL, NULL, 'f82c2a59-0f3a-4a89-b7d7-9fcd7a7ecb77', '04384911-264a-4510-b582-11ee704b8e41', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (34, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-12-06 13:09:07-08', NULL, NULL, NULL, '3182c8a4-22ff-4ca9-9f91-093c8888fd7c', 'f209ef09-dfe6-42a1-ac4c-7689897f1b51', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (35, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-12-06 13:09:07-08', NULL, NULL, NULL, '68f0b68a-c6b5-4c4e-82a6-d7fbd690f55e', 'bb979661-0782-49b2-9c64-acd8424b692b', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (36, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-12-06 13:09:07-08', NULL, NULL, NULL, 'a5f7f5b3-fb56-4377-ae6c-b11c8b6d0041', 'bb702949-e303-4788-9ba9-806232a5f711', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (37, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-12-06 13:09:07-08', NULL, NULL, NULL, '8494e89c-489b-441b-a05d-e935b1d82487', 'a35fb5ad-edd9-4465-982e-81b824644d07', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (38, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-12-06 13:09:07-08', NULL, NULL, NULL, '84d4c8b7-55b5-4700-90ad-fb1c169d4e1f', '5c847c75-3b17-414c-97f8-88ba81cb3821', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (39, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-12-06 13:09:07-08', NULL, NULL, NULL, '62d5d8ea-b163-4a83-95a4-bfadbb6b21f7', '4a792f0f-cf9d-48c8-9a95-f504c5f84b12', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (40, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2023-06-05 16:20:57-07', NULL, NULL, NULL, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488f', '4242ea9d-b917-4129-93c2-db00b7451051', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (41, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2024-06-05 16:20:57-07', NULL, NULL, NULL, '84ea41f0-4039-44d8-9f91-0e1d5fd47930', '4242ea9d-b917-4129-93c2-db00b7451051', NULL);
INSERT INTO erc.operation_designated_operator_timeline VALUES (42, '2026-02-11 16:58:55.782962-08', NULL, NULL, '2023-06-05 16:20:57-07', NULL, NULL, NULL, '3f47b2e1-9a4c-4d3f-8b21-7e9a0c5d2f6b', '4242ea9d-b917-4129-93c2-db00b7451051', NULL);

INSERT INTO erc.operation_regulated_products VALUES (1, '002d5a9e-32a6-4191-938c-2c02bfec592d', 1);
INSERT INTO erc.operation_regulated_products VALUES (2, '556ceeb0-7e24-4d89-b639-61f625f82084', 1);
INSERT INTO erc.operation_regulated_products VALUES (3, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', 8);
INSERT INTO erc.operation_regulated_products VALUES (4, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', 2);
INSERT INTO erc.operation_regulated_products VALUES (5, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', 6);
INSERT INTO erc.operation_regulated_products VALUES (6, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', 7);
INSERT INTO erc.operation_regulated_products VALUES (7, 'c0743c09-82fa-4186-91aa-4b5412e3415c', 1);
INSERT INTO erc.operation_regulated_products VALUES (8, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488e', 1);
INSERT INTO erc.operation_regulated_products VALUES (9, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488e', 2);
INSERT INTO erc.operation_regulated_products VALUES (10, 'd99725a7-1c3a-47cb-a59b-e2388ce0fa18', 1);
INSERT INTO erc.operation_regulated_products VALUES (11, '21e70498-c4b0-4525-8443-86faa96206e3', 2);
INSERT INTO erc.operation_regulated_products VALUES (12, '7d3fc7d1-0504-4ee4-a9c5-447f4b324b57', 3);
INSERT INTO erc.operation_regulated_products VALUES (13, '8563da83-0762-4d29-9b22-da5b52ef0f24', 3);
INSERT INTO erc.operation_regulated_products VALUES (14, '8563da83-0762-4d29-9b22-da5b52ef0f24', 4);
INSERT INTO erc.operation_regulated_products VALUES (15, 'c5b3643b-c143-42f3-8a2b-03ccc7319cd9', 3);
INSERT INTO erc.operation_regulated_products VALUES (16, '6d07d02a-1ad2-46ed-ad56-2f84313e98bf', 5);
INSERT INTO erc.operation_regulated_products VALUES (17, '1bd04128-d070-4d3a-940a-0874c4956181', 3);
INSERT INTO erc.operation_regulated_products VALUES (18, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488f', 1);
INSERT INTO erc.operation_regulated_products VALUES (19, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488f', 2);
INSERT INTO erc.operation_regulated_products VALUES (20, '84ea41f0-4039-44d8-9f91-0e1d5fd47930', 11);
INSERT INTO erc.operation_regulated_products VALUES (21, '84ea41f0-4039-44d8-9f91-0e1d5fd47930', 13);
INSERT INTO erc.operation_regulated_products VALUES (22, '3f47b2e1-9a4c-4d3f-8b21-7e9a0c5d2f6b', 21);

INSERT INTO erc.parent_operator VALUES (1, '2026-02-11 16:58:56.41124-08', NULL, NULL, 1, 'Parent Operator Legal Name', 'Parent Operator Trade Name', '123456780', 'zzz1212121', NULL, NULL, 'Sole Proprietorship', '5712ee05-5f3b-4822-825d-6fffddafda4c', NULL, 4, 3, NULL, NULL, NULL);

INSERT INTO erc.partner_operator VALUES (1, '2026-02-11 16:58:56.441142-08', NULL, NULL, 'Partner Operator Legal Name', 'Partner Operator Trade Name', '123456780', 'zzz1212121', NULL, '4242ea9d-b917-4129-93c2-db00b7451051', 'General Partnership', NULL, NULL);

INSERT INTO erc.report_activity VALUES (1, '2026-02-11 16:59:00.797583-08', NULL, NULL, '{"gscWithProductionOfUsefulEnergy": true}', 1, 1, NULL, NULL, 22, NULL, 3);
INSERT INTO erc.report_activity VALUES (2, '2026-02-11 16:59:00.797583-08', NULL, NULL, '{"gscWithProductionOfUsefulEnergy": true}', 1, 1, NULL, NULL, 23, NULL, 4);
INSERT INTO erc.report_activity VALUES (3, '2026-02-11 16:59:00.797583-08', NULL, NULL, '{"gscWithProductionOfUsefulEnergy": true}', 1, 1, NULL, NULL, 24, NULL, 5);

INSERT INTO erc.report_additional_data VALUES (1, '2026-02-11 16:59:01.615419-08', NULL, NULL, false, NULL, NULL, NULL, 12345, NULL, NULL, 3, NULL);
INSERT INTO erc.report_additional_data VALUES (2, '2026-02-11 16:59:01.615419-08', NULL, NULL, false, NULL, NULL, NULL, 54321, NULL, NULL, 4, NULL);
INSERT INTO erc.report_additional_data VALUES (3, '2026-02-11 16:59:01.615419-08', NULL, NULL, false, NULL, NULL, NULL, 34, NULL, NULL, 5, NULL);

INSERT INTO erc.report_attachment VALUES (4, '2026-02-11 16:59:00.21154-08', '2026-02-11 16:59:00.215448-08', NULL, 'report_attachments/2026/file1_pnBSD2P.pdf', 'verification_statement', 'file1.pdf', NULL, NULL, 10, NULL, 'Clean');
INSERT INTO erc.report_attachment VALUES (5, '2026-02-11 16:59:00.260247-08', '2026-02-11 16:59:00.264282-08', NULL, 'report_attachments/2026/file1_HrZI83U.pdf', 'verification_statement', 'file1.pdf', NULL, NULL, 11, NULL, 'Clean');
INSERT INTO erc.report_attachment VALUES (6, '2026-02-11 16:59:00.309759-08', '2026-02-11 16:59:00.313218-08', NULL, 'report_attachments/2026/file1_2EPSEeZ.pdf', 'verification_statement', 'file1.pdf', NULL, NULL, 12, NULL, 'Clean');
INSERT INTO erc.report_attachment VALUES (1, '2025-05-26 08:20:58.144081-07', '2026-02-11 16:59:01.675992-08', NULL, 'report_attachments/2025/VERIFICATION_ATTACHMENT_1.pdf', 'verification_statement', 'VERIFICATION_ATTACHMENT.pdf', NULL, 'ba2ba62a-1218-42e0-942a-ab9e92ce8822', 3, NULL, 'Clean');
INSERT INTO erc.report_attachment VALUES (2, '2025-05-26 08:20:58.144081-07', '2026-02-11 16:59:01.675992-08', NULL, 'report_attachments/2025/VERIFICATION_ATTACHMENT_2.pdf', 'verification_statement', 'VERIFICATION_ATTACHMENT.pdf', NULL, 'ba2ba62a-1218-42e0-942a-ab9e92ce8822', 4, NULL, 'Clean');
INSERT INTO erc.report_attachment VALUES (3, '2025-05-26 08:20:58.144081-07', '2026-02-11 16:59:01.675992-08', NULL, 'report_attachments/2025/VERIFICATION_ATTACHMENT_3.pdf', 'verification_statement', 'VERIFICATION_ATTACHMENT.pdf', NULL, 'ba2ba62a-1218-42e0-942a-ab9e92ce8822', 5, NULL, 'Clean');

INSERT INTO erc.report_source_type VALUES (1, '2026-02-11 16:59:00.84342-08', NULL, NULL, '{}', 1, NULL, NULL, 1, NULL, 3, 1);
INSERT INTO erc.report_source_type VALUES (2, '2026-02-11 16:59:00.84342-08', NULL, NULL, '{}', 1, NULL, NULL, 2, NULL, 4, 1);
INSERT INTO erc.report_source_type VALUES (3, '2026-02-11 16:59:00.84342-08', NULL, NULL, '{}', 1, NULL, NULL, 3, NULL, 5, 1);

INSERT INTO erc.report_unit VALUES (1, '2026-02-11 16:59:01.025512-08', NULL, NULL, '{"gscUnitName": "GSC Unit Name 1", "gscUnitType": "Kiln"}', NULL, NULL, 1, NULL, 3, 'Unit');
INSERT INTO erc.report_unit VALUES (2, '2026-02-11 16:59:01.025512-08', NULL, NULL, '{"gscUnitName": "GSC Unit Name 1", "gscUnitType": "Kiln"}', NULL, NULL, 2, NULL, 4, 'Unit');
INSERT INTO erc.report_unit VALUES (3, '2026-02-11 16:59:01.025512-08', NULL, NULL, '{"gscUnitName": "GSC Unit Name 1", "gscUnitType": "Kiln"}', NULL, NULL, 3, NULL, 5, 'Unit');

INSERT INTO erc.report_fuel VALUES (1, '2026-02-11 16:59:01.20613-08', NULL, NULL, '{"fuelDescription": "Diesel fuel", "annualFuelAmount": 12000}', NULL, NULL, 15, NULL, 1, 1, 3);
INSERT INTO erc.report_fuel VALUES (2, '2026-02-11 16:59:01.20613-08', NULL, NULL, '{"fuelDescription": "Diesel fuel", "annualFuelAmount": 500000}', NULL, NULL, 15, NULL, 2, 2, 4);
INSERT INTO erc.report_fuel VALUES (3, '2026-02-11 16:59:01.20613-08', NULL, NULL, '{"fuelDescription": "Diesel fuel", "annualFuelAmount": 0}', NULL, NULL, 15, NULL, 3, 3, 5);

INSERT INTO erc.report_emission VALUES (1, '2026-02-11 16:59:01.286078-08', NULL, NULL, '{"emission": 11000, "equivalentEmission": 11000.0}', NULL, NULL, 1, NULL, 1, 1, 3, NULL);
INSERT INTO erc.report_emission VALUES (2, '2026-02-11 16:59:01.286078-08', NULL, NULL, '{"emission": 250000, "equivalentEmission": 250000.0}', NULL, NULL, 1, NULL, 2, 2, 4, NULL);
INSERT INTO erc.report_emission VALUES (3, '2026-02-11 16:59:01.286078-08', NULL, NULL, '{"emission": 0, "equivalentEmission": 0.0}', NULL, NULL, 1, NULL, 3, 3, 5, NULL);

INSERT INTO erc.report_emission_allocation VALUES (1, '2026-02-11 16:59:01.509329-08', NULL, NULL, 'OBPS Allocation Calculator', '', NULL, NULL, 22, 3, NULL);
INSERT INTO erc.report_emission_allocation VALUES (2, '2026-02-11 16:59:01.509329-08', NULL, NULL, 'OBPS Allocation Calculator', '', NULL, NULL, 23, 4, NULL);
INSERT INTO erc.report_emission_allocation VALUES (3, '2026-02-11 16:59:01.509329-08', NULL, NULL, 'OBPS Allocation Calculator', '', NULL, NULL, 24, 5, NULL);

INSERT INTO erc.report_emission_emission_categories VALUES (1, 1, 5);
INSERT INTO erc.report_emission_emission_categories VALUES (2, 2, 5);
INSERT INTO erc.report_emission_emission_categories VALUES (3, 3, 5);

INSERT INTO erc.report_methodology VALUES (1, '2026-02-11 16:59:01.367938-08', NULL, NULL, '{"unitFuelCo2DefaultEf": 1, "unitFuelCo2DefaultEfFieldUnits": "kg/fuel units"}', NULL, NULL, 1, NULL, 3, 2);
INSERT INTO erc.report_methodology VALUES (2, '2026-02-11 16:59:01.367938-08', NULL, NULL, '{}', NULL, NULL, 2, NULL, 4, 18);
INSERT INTO erc.report_methodology VALUES (3, '2026-02-11 16:59:01.367938-08', NULL, NULL, '{}', NULL, NULL, 3, NULL, 5, 18);

INSERT INTO erc.report_operation VALUES (1, '2026-02-11 16:58:56.581414-08', '2026-02-11 16:58:57.500051-08', NULL, 'Bravo Technologies - has parTNER operator', 'Bravo Technologies', 'Bugle SFO - Registered', 'Single Facility Operation', NULL, '23-0001', NULL, NULL, NULL, 1, 'OBPS Regulated Operation', NULL);
INSERT INTO erc.report_operation VALUES (2, '2026-02-11 16:58:56.738478-08', '2026-02-11 16:58:57.511222-08', NULL, 'Bravo Technologies - has parTNER operator', 'Bravo Technologies', 'Banana LFO - Registered', 'Linear Facilities Operation', '23219990004', '24-0015', NULL, NULL, NULL, 2, 'OBPS Regulated Operation', NULL);
INSERT INTO erc.report_operation VALUES (3, '2026-02-11 16:58:56.877198-08', '2026-02-11 16:58:57.519701-08', NULL, 'Bravo Technologies - has parTNER operator', 'Bravo Technologies', 'Compliance SFO - Obligation not met', 'Single Facility Operation', '13219990046', '24-0019', NULL, NULL, NULL, 3, 'OBPS Regulated Operation', NULL);
INSERT INTO erc.report_operation VALUES (4, '2026-02-11 16:58:56.933521-08', '2026-02-11 16:58:57.532043-08', NULL, 'Bravo Technologies - has parTNER operator', 'Bravo Technologies', 'Compliance SFO - Earned credits', 'Single Facility Operation', '13219990047', '24-0020', NULL, NULL, NULL, 4, 'OBPS Regulated Operation', NULL);
INSERT INTO erc.report_operation VALUES (5, '2026-02-11 16:58:56.967961-08', '2026-02-11 16:58:57.559422-08', NULL, 'Bravo Technologies - has parTNER operator', 'Bravo Technologies', 'Compliance SFO - No obligation or earned credits', 'Single Facility Operation', '13219990048', '24-0021', NULL, NULL, NULL, 5, 'OBPS Regulated Operation', NULL);
INSERT INTO erc.report_operation VALUES (6, '2026-02-11 16:58:57.012093-08', '2026-02-11 16:58:57.574897-08', NULL, 'Bravo Technologies - has parTNER operator', 'Bravo Technologies', 'Bangles SFO - Registered - has Multiple Operators', 'Single Facility Operation', '23219990001', '24-0003', NULL, NULL, NULL, 6, 'Reporting Operation', NULL);
INSERT INTO erc.report_operation VALUES (7, '2026-02-11 16:58:57.048346-08', '2026-02-11 16:58:57.583325-08', NULL, 'Bravo Technologies - has parTNER operator', 'Bravo Technologies', 'Compliance SFO - No obligation or earned credits', 'Single Facility Operation', '13219990048', '24-0021', NULL, NULL, NULL, 7, 'OBPS Regulated Operation', NULL);
INSERT INTO erc.report_operation VALUES (8, '2026-02-11 16:58:57.09396-08', '2026-02-11 16:58:57.595553-08', NULL, 'Bravo Technologies - has parTNER operator', 'Bravo Technologies', 'Banana LFO - Registered', 'Linear Facilities Operation', '23219990004', '24-0015', NULL, NULL, NULL, 8, 'OBPS Regulated Operation', NULL);
INSERT INTO erc.report_operation VALUES (9, '2026-02-11 16:58:57.217136-08', '2026-02-11 16:58:57.612419-08', NULL, 'Bravo Technologies - has parTNER operator', 'Bravo Technologies', 'Compliance SFO - Obligation not met', 'Single Facility Operation', '13219990046', '24-0019', NULL, NULL, NULL, 9, 'OBPS Regulated Operation', NULL);
INSERT INTO erc.report_operation VALUES (10, '2026-02-11 16:58:57.270343-08', '2026-02-11 16:58:57.617861-08', NULL, 'Bravo Technologies - has parTNER operator', 'Bravo Technologies', 'Bangles SFO - Registered - has Multiple Operators', 'Single Facility Operation', '23219990001', '24-0003', NULL, NULL, NULL, 10, 'Reporting Operation', NULL);
INSERT INTO erc.report_operation VALUES (11, '2026-02-11 16:58:57.311265-08', '2026-02-11 16:58:57.6332-08', NULL, 'Bravo Technologies - has parTNER operator', 'Bravo Technologies', 'Bangles SFO - Registered - has Multiple Operators', 'Single Facility Operation', '23219990001', '24-0003', NULL, NULL, NULL, 11, 'Reporting Operation', NULL);
INSERT INTO erc.report_operation VALUES (12, '2026-02-11 16:58:57.359194-08', '2026-02-11 16:58:57.637241-08', NULL, 'Bravo Technologies - has parTNER operator', 'Bravo Technologies', 'Bangles SFO - Registered - has Multiple Operators', 'Single Facility Operation', '23219990001', '24-0003', NULL, NULL, NULL, 12, 'Reporting Operation', NULL);
INSERT INTO erc.report_operation VALUES (13, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Bravo Technologies - has parTNER operator - name from admin', 'Bravo Technologies', 'Banana LFO - Registered - name from admin', 'Linear Facilities Operation', '23219990004', '24-0015', NULL, NULL, NULL, 13, 'OBPS Regulated Operation', NULL);
INSERT INTO erc.report_operation VALUES (14, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Bravo Technologies - has parTNER operator - name from admin', 'Bravo Technologies', 'Banana LFO - Registered - name from admin', 'Linear Facilities Operation', '23219990004', '24-0015', NULL, NULL, NULL, 14, 'OBPS Regulated Operation', NULL);

INSERT INTO erc.report_operation_activities VALUES (1, 1, 1);
INSERT INTO erc.report_operation_activities VALUES (2, 1, 2);
INSERT INTO erc.report_operation_activities VALUES (3, 2, 1);
INSERT INTO erc.report_operation_activities VALUES (4, 3, 1);
INSERT INTO erc.report_operation_activities VALUES (5, 4, 1);
INSERT INTO erc.report_operation_activities VALUES (6, 5, 1);
INSERT INTO erc.report_operation_activities VALUES (7, 6, 1);
INSERT INTO erc.report_operation_activities VALUES (8, 7, 1);
INSERT INTO erc.report_operation_activities VALUES (9, 8, 1);
INSERT INTO erc.report_operation_activities VALUES (10, 9, 1);
INSERT INTO erc.report_operation_activities VALUES (11, 10, 1);
INSERT INTO erc.report_operation_activities VALUES (12, 11, 1);
INSERT INTO erc.report_operation_activities VALUES (13, 12, 1);
INSERT INTO erc.report_operation_activities VALUES (14, 13, 1);
INSERT INTO erc.report_operation_activities VALUES (15, 14, 1);

INSERT INTO erc.report_operation_regulated_products VALUES (1, 1, 8);
INSERT INTO erc.report_operation_regulated_products VALUES (2, 1, 2);
INSERT INTO erc.report_operation_regulated_products VALUES (3, 1, 6);
INSERT INTO erc.report_operation_regulated_products VALUES (4, 1, 7);
INSERT INTO erc.report_operation_regulated_products VALUES (5, 2, 1);
INSERT INTO erc.report_operation_regulated_products VALUES (6, 3, 1);
INSERT INTO erc.report_operation_regulated_products VALUES (7, 3, 2);
INSERT INTO erc.report_operation_regulated_products VALUES (8, 4, 11);
INSERT INTO erc.report_operation_regulated_products VALUES (9, 4, 13);
INSERT INTO erc.report_operation_regulated_products VALUES (10, 5, 21);
INSERT INTO erc.report_operation_regulated_products VALUES (11, 6, 1);
INSERT INTO erc.report_operation_regulated_products VALUES (12, 6, 2);
INSERT INTO erc.report_operation_regulated_products VALUES (13, 7, 21);
INSERT INTO erc.report_operation_regulated_products VALUES (14, 8, 1);
INSERT INTO erc.report_operation_regulated_products VALUES (15, 9, 1);
INSERT INTO erc.report_operation_regulated_products VALUES (16, 9, 2);
INSERT INTO erc.report_operation_regulated_products VALUES (17, 10, 1);
INSERT INTO erc.report_operation_regulated_products VALUES (18, 10, 2);
INSERT INTO erc.report_operation_regulated_products VALUES (19, 11, 1);
INSERT INTO erc.report_operation_regulated_products VALUES (20, 11, 2);
INSERT INTO erc.report_operation_regulated_products VALUES (21, 12, 1);
INSERT INTO erc.report_operation_regulated_products VALUES (22, 12, 2);
INSERT INTO erc.report_operation_regulated_products VALUES (23, 13, 1);
INSERT INTO erc.report_operation_regulated_products VALUES (24, 14, 1);

INSERT INTO erc.report_operation_representative VALUES (1, '2026-02-11 16:58:56.581414-08', NULL, NULL, 'Bill Blue', true, NULL, NULL, 1, NULL);
INSERT INTO erc.report_operation_representative VALUES (2, '2026-02-11 16:58:56.581414-08', NULL, NULL, 'Bob Brown', true, NULL, NULL, 1, NULL);
INSERT INTO erc.report_operation_representative VALUES (3, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Bill Blue', true, NULL, NULL, 2, NULL);
INSERT INTO erc.report_operation_representative VALUES (4, '2026-02-11 16:58:56.738478-08', NULL, NULL, 'Bob Brown', true, NULL, NULL, 2, NULL);
INSERT INTO erc.report_operation_representative VALUES (5, '2026-02-11 16:58:56.877198-08', NULL, NULL, 'Bill Blue', true, NULL, NULL, 3, NULL);
INSERT INTO erc.report_operation_representative VALUES (6, '2026-02-11 16:58:56.933521-08', NULL, NULL, 'Bob Brown', true, NULL, NULL, 4, NULL);
INSERT INTO erc.report_operation_representative VALUES (7, '2026-02-11 16:58:56.967961-08', NULL, NULL, 'Bob Brown', true, NULL, NULL, 5, NULL);
INSERT INTO erc.report_operation_representative VALUES (8, '2026-02-11 16:58:57.012093-08', NULL, NULL, 'Bill Blue', true, NULL, NULL, 6, NULL);
INSERT INTO erc.report_operation_representative VALUES (9, '2026-02-11 16:58:57.048346-08', NULL, NULL, 'Bob Brown', true, NULL, NULL, 7, NULL);
INSERT INTO erc.report_operation_representative VALUES (10, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Bill Blue', true, NULL, NULL, 8, NULL);
INSERT INTO erc.report_operation_representative VALUES (11, '2026-02-11 16:58:57.09396-08', NULL, NULL, 'Bob Brown', true, NULL, NULL, 8, NULL);
INSERT INTO erc.report_operation_representative VALUES (12, '2026-02-11 16:58:57.217136-08', NULL, NULL, 'Bill Blue', true, NULL, NULL, 9, NULL);
INSERT INTO erc.report_operation_representative VALUES (13, '2026-02-11 16:58:57.270343-08', NULL, NULL, 'Bill Blue', true, NULL, NULL, 10, NULL);
INSERT INTO erc.report_operation_representative VALUES (14, '2026-02-11 16:58:57.311265-08', NULL, NULL, 'Bill Blue', true, NULL, NULL, 11, NULL);
INSERT INTO erc.report_operation_representative VALUES (15, '2026-02-11 16:58:57.359194-08', NULL, NULL, 'Bill Blue', true, NULL, NULL, 12, NULL);
INSERT INTO erc.report_operation_representative VALUES (16, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Bill Blue', true, NULL, NULL, 13, NULL);
INSERT INTO erc.report_operation_representative VALUES (17, '2026-02-11 16:59:00.352702-08', NULL, NULL, 'Bob Brown', true, NULL, NULL, 13, NULL);
INSERT INTO erc.report_operation_representative VALUES (18, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Bill Blue', true, NULL, NULL, 14, NULL);
INSERT INTO erc.report_operation_representative VALUES (19, '2026-02-11 16:59:00.535579-08', NULL, NULL, 'Bob Brown', true, NULL, NULL, 14, NULL);

INSERT INTO erc.report_person_responsible VALUES (1, '2026-02-11 16:59:00.675686-08', NULL, NULL, 'Bob', 'Brown', 'Manager', 'bob.brown@example.com', '+16044011236', '789 Oak St', 'Village', 'BC', 'M2N 3P4', 'Operation Representative', NULL, NULL, 3, NULL);
INSERT INTO erc.report_person_responsible VALUES (2, '2026-02-11 16:59:00.675686-08', NULL, NULL, 'Bill', 'Blue', 'Manager', 'bill.blue@example.com', '+16044011235', '123 Main St', 'City', 'ON', 'A1B 2C3', 'Operation Representative', NULL, NULL, 4, NULL);
INSERT INTO erc.report_person_responsible VALUES (3, '2026-02-11 16:59:00.675686-08', NULL, NULL, 'Bill', 'Blue', 'Manager', 'bill.blue@example.com', '+16044011235', '123 Main St', 'City', 'ON', 'A1B 2C3', 'Operation Representative', NULL, NULL, 5, NULL);

INSERT INTO erc.report_product VALUES (1, '2026-02-11 16:59:01.440346-08', '2025-05-26 07:51:37.437043-07', NULL, 20000, 10000, 'OBPS Calculator', 5000, 5000, 5000, 5000, NULL, NULL, 22, 1, 3, 'ba2ba62a-1218-42e0-942a-ab9e92ce8822', NULL);
INSERT INTO erc.report_product VALUES (2, '2026-02-11 16:59:01.440346-08', NULL, NULL, 1000, 500, 'OBPS Calculator', 250, 250, 250, 250, NULL, NULL, 22, 2, 3, NULL, NULL);
INSERT INTO erc.report_product VALUES (3, '2026-02-11 16:59:01.440346-08', '2025-05-26 07:51:37.437043-07', NULL, 500000, 500000, 'OBPS Calculator', 50000, 50000, 50000, 50000, NULL, NULL, 23, 11, 4, 'ba2ba62a-1218-42e0-942a-ab9e92ce8822', NULL);
INSERT INTO erc.report_product VALUES (4, '2026-02-11 16:59:01.440346-08', NULL, NULL, 500000, 500000, 'OBPS Calculator', 50000, 50000, 50000, 50000, NULL, NULL, 23, 13, 4, NULL, NULL);
INSERT INTO erc.report_product VALUES (5, '2026-02-11 16:59:01.440346-08', '2025-05-26 07:51:37.437043-07', NULL, 500, 500, 'OBPS Calculator', 100, 100, 100, 100, NULL, NULL, 24, 21, 5, 'ba2ba62a-1218-42e0-942a-ab9e92ce8822', NULL);

INSERT INTO erc.report_product_emission_allocation VALUES (1, '2026-02-11 16:59:01.537747-08', NULL, NULL, 10000.0000, NULL, NULL, 5, 1, 3, NULL, 1);
INSERT INTO erc.report_product_emission_allocation VALUES (2, '2026-02-11 16:59:01.537747-08', NULL, NULL, 1000.0000, NULL, NULL, 5, 2, 3, NULL, 1);
INSERT INTO erc.report_product_emission_allocation VALUES (3, '2026-02-11 16:59:01.537747-08', NULL, NULL, 150000.0000, NULL, NULL, 5, 3, 4, NULL, 2);
INSERT INTO erc.report_product_emission_allocation VALUES (4, '2026-02-11 16:59:01.537747-08', NULL, NULL, 100000.0000, NULL, NULL, 5, 4, 4, NULL, 2);
INSERT INTO erc.report_product_emission_allocation VALUES (5, '2026-02-11 16:59:01.537747-08', NULL, NULL, 0.0000, NULL, NULL, 5, 5, 5, NULL, 3);

INSERT INTO erc.report_raw_activity_data VALUES (1, '2026-02-11 16:59:00.731479-08', NULL, NULL, '{"sourceTypes": {"gscWithProductionOfUsefulEnergy": {"units": [{"fuels": [{"fuelType": {"fuelName": "Diesel", "fuelUnit": "kilolitres", "fuelClassification": "Non-biomass"}, "emissions": [{"gasType": "CO2", "emission": 11000, "methodology": {"methodology": "Default EF", "unitFuelCo2DefaultEf": 1, "unitFuelCo2DefaultEfFieldUnits": "kg/fuel units"}}], "fuelDescription": "Diesel fuel", "annualFuelAmount": 12000}], "gscUnitName": "GSC Unit Name 1", "gscUnitType": "Kiln"}]}}, "gscWithProductionOfUsefulEnergy": true}', 1, NULL, NULL, 22, NULL);
INSERT INTO erc.report_raw_activity_data VALUES (2, '2026-02-11 16:59:00.731479-08', NULL, NULL, '{"sourceTypes": {"gscWithProductionOfUsefulEnergy": {"units": [{"fuels": [{"fuelType": {"fuelName": "Diesel", "fuelUnit": "kilolitres", "fuelClassification": "Non-biomass"}, "emissions": [{"gasType": "CO2", "emission": 250000, "methodology": {"methodology": "Default EF", "unitFuelCo2DefaultEf": 1, "unitFuelCo2DefaultEfFieldUnits": "kg/fuel units"}}], "fuelDescription": "Diesel fuel", "annualFuelAmount": 500000}], "gscUnitName": "GSC Unit Name 1", "gscUnitType": "Kiln"}]}}, "gscWithProductionOfUsefulEnergy": true}', 1, NULL, NULL, 23, NULL);
INSERT INTO erc.report_raw_activity_data VALUES (3, '2026-02-11 16:59:00.731479-08', NULL, NULL, '{"sourceTypes": {"gscWithProductionOfUsefulEnergy": {"units": [{"fuels": [{"fuelType": {"fuelName": "Diesel", "fuelUnit": "kilolitres", "fuelClassification": "Non-biomass"}, "emissions": [{"gasType": "CO2", "emission": 0.0, "methodology": {"methodology": "Default EF", "unitFuelCo2DefaultEf": 1, "unitFuelCo2DefaultEfFieldUnits": "kg/fuel units"}}], "fuelDescription": "Diesel fuel", "annualFuelAmount": 0}], "gscUnitName": "GSC Unit Name 1", "gscUnitType": "Kiln"}]}}, "gscWithProductionOfUsefulEnergy": true}', 1, NULL, NULL, 24, NULL);

INSERT INTO erc.report_sign_off VALUES (1, '2026-02-11 16:58:57.729149-08', NULL, NULL, true, true, true, true, true, 'me', '2026-02-11 16:58:58.66505-08', NULL, NULL, 2, NULL, true, true, true);
INSERT INTO erc.report_sign_off VALUES (2, '2026-02-11 16:58:59.016907-08', NULL, NULL, true, true, true, true, true, 'me', '2026-02-11 16:59:00.089553-08', NULL, NULL, 8, NULL, true, true, true);
INSERT INTO erc.report_sign_off VALUES (3, '2026-02-11 16:59:00.137684-08', NULL, NULL, true, true, true, true, true, 'me', '2026-02-11 16:59:00.187074-08', NULL, NULL, 6, NULL, true, true, true);
INSERT INTO erc.report_sign_off VALUES (4, '2026-02-11 16:59:00.216517-08', NULL, NULL, true, true, true, true, true, 'me', '2026-02-11 16:59:00.237402-08', NULL, NULL, 10, NULL, true, true, true);
INSERT INTO erc.report_sign_off VALUES (5, '2026-02-11 16:59:00.265377-08', NULL, NULL, true, true, true, true, true, 'me', '2026-02-11 16:59:00.285656-08', NULL, NULL, 11, NULL, true, true, true);
INSERT INTO erc.report_sign_off VALUES (6, '2026-02-11 16:59:00.314133-08', NULL, NULL, true, true, true, true, true, 'me', '2026-02-11 16:59:00.337402-08', NULL, NULL, 12, NULL, true, true, true);

INSERT INTO erc.report_verification VALUES (4, '2026-02-11 16:59:00.200131-08', NULL, NULL, NULL, NULL, NULL, NULL, 'conclude', NULL, NULL, 10, NULL);
INSERT INTO erc.report_verification VALUES (5, '2026-02-11 16:59:00.250215-08', NULL, NULL, NULL, NULL, NULL, NULL, 'conclude', NULL, NULL, 11, NULL);
INSERT INTO erc.report_verification VALUES (6, '2026-02-11 16:59:00.299857-08', NULL, NULL, NULL, NULL, NULL, NULL, 'conclude', NULL, NULL, 12, NULL);
INSERT INTO erc.report_verification VALUES (1, '2025-05-26 08:20:24.827511-07', '2026-02-11 16:59:01.647309-08', NULL, 'Verification Association', 'ANAB', '', false, '', NULL, 'ba2ba62a-1218-42e0-942a-ab9e92ce8822', 3, NULL);
INSERT INTO erc.report_verification VALUES (2, '2025-05-26 08:20:24.827511-07', '2026-02-11 16:59:01.647309-08', NULL, 'Verification Association', 'ANAB', '', false, '', NULL, 'ba2ba62a-1218-42e0-942a-ab9e92ce8822', 4, NULL);
INSERT INTO erc.report_verification VALUES (3, '2025-05-26 08:20:24.827511-07', '2026-02-11 16:59:01.647309-08', NULL, 'Verification Association', 'ANAB', '', false, '', NULL, 'ba2ba62a-1218-42e0-942a-ab9e92ce8822', 5, NULL);

INSERT INTO erc.restart_event VALUES ('2026-02-11 16:58:55.927466-08', NULL, NULL, '1a491d98-fde9-482d-9241-0497c15dc517', '2024-06-05 02:00:00-07', 'Restarted', NULL, NULL, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', NULL);
INSERT INTO erc.restart_event VALUES ('2026-02-11 16:58:55.927466-08', NULL, NULL, 'a5f04108-886c-4eac-980c-f350714b099f', '2025-03-05 01:00:00-08', 'Restarted', NULL, NULL, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', NULL);
INSERT INTO erc.restart_event VALUES ('2026-02-11 16:58:55.927466-08', NULL, NULL, '1363536b-390b-4074-b691-575b678d0c70', '2026-01-10 01:00:00-08', 'Restarted', NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL);
INSERT INTO erc.restart_event VALUES ('2026-02-11 16:58:55.927466-08', NULL, NULL, '375ab674-aba4-4381-a72d-95df0e03867e', '2026-01-10 01:00:00-08', 'Restarted', NULL, NULL, NULL, NULL);

INSERT INTO erc.restart_event_facilities VALUES (1, '375ab674-aba4-4381-a72d-95df0e03867e', 'f486f2fb-62ed-438d-bb3e-0819b51e3aeb');
INSERT INTO erc.restart_event_facilities VALUES (2, '375ab674-aba4-4381-a72d-95df0e03867e', '459b80f9-b5f3-48aa-9727-90c30eaf3a58');

INSERT INTO erc.temporary_shutdown_event VALUES ('2026-02-11 16:58:56.161263-08', NULL, NULL, '8e8e1b8b-489c-4229-8791-64ade623c45e', '2024-08-21 02:00:00-07', 'Shutting down for the day because we can''t find our keys to unlock the building', 'Temporarily Shutdown', NULL, NULL, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', NULL);
INSERT INTO erc.temporary_shutdown_event VALUES ('2026-02-11 16:58:56.161263-08', NULL, NULL, '2c5f7d32-d8df-47ee-bf2b-4ea90d03bdc2', '2026-01-10 01:00:00-08', '', 'Temporarily Shutdown', NULL, NULL, NULL, NULL);
INSERT INTO erc.temporary_shutdown_event VALUES ('2026-02-11 16:58:56.161263-08', NULL, NULL, 'b1bb9370-eab0-4f31-a3ee-8c125a9bde8c', '2026-01-10 01:00:00-08', 'It''s Pretzel Day!', 'Temporarily Shutdown', NULL, NULL, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', NULL);

INSERT INTO erc.temporary_shutdown_event_facilities VALUES (1, '2c5f7d32-d8df-47ee-bf2b-4ea90d03bdc2', 'f486f2fb-62ed-438d-bb3e-0819b51e3aeb');
INSERT INTO erc.temporary_shutdown_event_facilities VALUES (2, '2c5f7d32-d8df-47ee-bf2b-4ea90d03bdc2', '459b80f9-b5f3-48aa-9727-90c30eaf3a58');

INSERT INTO erc.transfer_event VALUES ('2026-02-11 16:58:56.31121-08', NULL, NULL, '2ef488c0-0863-4af7-98c1-ccb4675ed0c6', '2025-01-01 01:00:00-08', 'To be transferred', NULL, NULL, 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488e', NULL, NULL, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, '4a792f0f-cf9d-48c8-9a95-f504c5f84b12');
INSERT INTO erc.transfer_event VALUES ('2026-02-11 16:58:56.31121-08', '2024-08-20 10:00:54.543-07', NULL, '96cb4057-3e20-47f6-83fc-5c565ad2bb53', '2024-08-21 02:00:00-07', 'Transferred', NULL, NULL, 'd99725a7-1c3a-47cb-a59b-e2388ce0fa18', '00000000-0000-0000-0000-000000000028', NULL, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, '4a792f0f-cf9d-48c8-9a95-f504c5f84b12');
INSERT INTO erc.transfer_event VALUES ('2026-02-11 16:58:56.31121-08', '2024-08-20 10:00:54.543-07', NULL, '327b9ebd-d735-4f84-8b79-a64738d3e153', '2024-12-25 01:00:00-08', 'Complete', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000028', '002d5a9e-32a6-4191-938c-2c02bfec592d', '4242ea9d-b917-4129-93c2-db00b7451051', 'e1300fd7-2dee-47d1-b655-2ad3fd10f052', '685d581b-5698-411f-ae00-de1d97334a71');
INSERT INTO erc.transfer_event VALUES ('2026-02-11 16:58:56.31121-08', '2025-01-10 15:50:44.039-08', NULL, 'e3108ea7-4ce7-4dbb-8ef6-e976e16152b9', '2026-03-01 01:00:00-08', 'To be transferred', NULL, NULL, NULL, '00000000-0000-0000-0000-000000000028', '002d5a9e-32a6-4191-938c-2c02bfec592d', '4242ea9d-b917-4129-93c2-db00b7451051', '59d95661-c752-489b-9fd1-0c3fa3454dda', '4242ea9d-b917-4129-93c2-db00b7451051');

INSERT INTO erc.transfer_event_facilities VALUES (1, '327b9ebd-d735-4f84-8b79-a64738d3e153', '459b80f9-b5f3-48aa-9727-90c30eaf3a58');
INSERT INTO erc.transfer_event_facilities VALUES (2, '327b9ebd-d735-4f84-8b79-a64738d3e153', 'f486f2fb-62ed-438d-bb3e-0819b51e3aed');
INSERT INTO erc.transfer_event_facilities VALUES (3, 'e3108ea7-4ce7-4dbb-8ef6-e976e16152b9', 'f486f2fb-62ed-438d-bb3e-0819b51e3af3');
INSERT INTO erc.transfer_event_facilities VALUES (4, 'e3108ea7-4ce7-4dbb-8ef6-e976e16152b9', 'f486f2fb-62ed-438d-bb3e-0819b51e3af4');

INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, '89400d9c-1dca-4622-821d-7d3ab1594866', 'admin', 'Approved', '2024-02-26 06:24:57.293242-08', NULL, NULL, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, '00000000-0000-0000-0000-000000000003', 'ba2ba62a-1218-42e0-942a-ab9e92ce8822', 1);
INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, 'ecc85ab3-d67e-4e8a-994d-ebdac5b64803', 'admin', 'Approved', '2024-02-26 06:24:57.293242-08', NULL, NULL, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, 'ba2ba62a-1218-42e0-942a-ab9e92ce8822', '58f255ed-8d46-44ee-b2fe-9f8d3d92c684', 2);
INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, '19af8423-827d-4e4f-b491-c916339ee2f3', 'admin', 'Approved', '2024-02-27 06:24:57.293242-08', NULL, NULL, '685d581b-5698-411f-ae00-de1d97334a71', NULL, '00000000-0000-0000-0000-000000000002', '58f255ed-8d46-44ee-b2fe-9f8d3d92c684', 3);
INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, '6b424d3c-3936-4139-ba04-aaaf1e558c45', 'admin', 'Approved', NULL, NULL, NULL, '438eff6c-d2e7-40ab-8220-29d3a86ef314', NULL, '3fa85f64-5717-4562-b3fc-2c963f66afa6', NULL, 4);
INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, 'b832a7aa-bb08-4f1e-a9cf-5d02fb185221', 'admin', 'Approved', NULL, NULL, NULL, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, '00000000-0000-0000-0000-000000000004', NULL, 7);
INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, '0f0737ea-afb2-40d2-aba9-e5cfaeb7e824', 'reporter', 'Approved', NULL, NULL, NULL, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, '00000000-0000-0000-0000-000000000005', NULL, 8);
INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, '57972e37-4c05-4180-ada4-6212b9284d76', 'admin', 'Approved', NULL, NULL, NULL, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, '00000000-0000-0000-0000-000000000006', NULL, 9);
INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, 'ead80227-124e-47f5-b523-90c8f277e667', 'admin', 'Approved', NULL, NULL, NULL, '4c1010c1-55ca-485d-84bd-6d975fd0af90', NULL, '00000000-0000-0000-0000-000000000007', NULL, 10);
INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, '01733c5d-d19a-4a95-9f63-c44671c577f9', 'admin', 'Approved', NULL, NULL, NULL, '5712ee05-5f3b-4822-825d-6fffddafda4c', NULL, '00000000-0000-0000-0000-000000000008', NULL, 11);
INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, '8edb2267-0cbb-4736-8120-5e8f468e91d2', 'reporter', 'Approved', NULL, NULL, NULL, 'edb1aff1-f888-4199-ab88-068364496347', NULL, '00000000-0000-0000-0000-000000000009', NULL, 12);
INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, 'c89f91d2-32c0-4d0a-a071-90f8db3ec3c6', 'reporter', 'Approved', NULL, NULL, NULL, 'ea4314ea-1974-465a-a851-278c8f9c8daa', NULL, '00000000-0000-0000-0000-000000000010', NULL, 13);
INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, 'a7d06324-898b-4a21-84c7-4188b46f82be', 'admin', 'Approved', NULL, NULL, NULL, '04384911-264a-4510-b582-11ee704b8e41', NULL, '00000000-0000-0000-0000-000000000011', NULL, 14);
INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, 'c62d2f01-8d75-4d3e-8851-87ed6b5e7c68', 'admin', 'Approved', NULL, NULL, NULL, 'f209ef09-dfe6-42a1-ac4c-7689897f1b51', NULL, '00000000-0000-0000-0000-000000000012', NULL, 15);
INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, 'c7be67b1-1646-4040-841b-292e2eb22cab', 'admin', 'Approved', NULL, NULL, NULL, 'bb979661-0782-49b2-9c64-acd8424b692b', NULL, '00000000-0000-0000-0000-000000000013', NULL, 16);
INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, '9c410c21-2898-4478-8437-b3b05b7ca13d', 'admin', 'Approved', NULL, NULL, NULL, 'bb702949-e303-4788-9ba9-806232a5f711', NULL, '00000000-0000-0000-0000-000000000014', NULL, 17);
INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, 'c6d37929-7a1a-4e87-9952-776ffa4a133c', 'pending', 'Declined', NULL, NULL, NULL, 'a35fb5ad-edd9-4465-982e-81b824644d07', NULL, '00000000-0000-0000-0000-000000000015', NULL, 18);
INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, 'df9c53f6-e993-4538-b3fb-63992a166463', 'reporter', 'Approved', NULL, NULL, NULL, '5c847c75-3b17-414c-97f8-88ba81cb3821', NULL, '00000000-0000-0000-0000-000000000016', NULL, 19);
INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, '98726371-8987-4f06-9814-479a0f3c54da', 'reporter', 'Approved', NULL, NULL, NULL, '4a792f0f-cf9d-48c8-9a95-f504c5f84b12', NULL, '00000000-0000-0000-0000-000000000017', NULL, 20);
INSERT INTO erc.user_operator VALUES ('2026-02-11 16:58:55.323523-08', NULL, NULL, '6e0450f5-4034-4ba0-b8a9-e8cc0fdc85e9', 'pending', 'Pending', NULL, NULL, NULL, '685d581b-5698-411f-ae00-de1d97334a71', NULL, '00000000-0000-0000-0000-000000000018', NULL, 20);

INSERT INTO erc_history.facility_history VALUES ('2024-06-05 16:18:07.664-07', NULL, NULL, 'f486f2fb-62ed-438d-bb3e-0819b51e3aeb', 'Facility 1', 'Large Facility', '00000000-0000-0000-0000-000000000001', 1, '2026-02-11 16:58:55.538475-08', NULL, '~', NULL, NULL, '00000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 43.500000, -123.500000, NULL, NULL, '002d5a9e-32a6-4191-938c-2c02bfec592d');

INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Apple LFO - Registered - name from admin', 'Linear Facilities Operation', 1001, NULL, 'e1300fd7-2dee-47d1-b655-2ad3fd10f052', NULL, 'Registered', NULL, 1, '2026-02-11 16:58:53.734292-08', NULL, '~', NULL, '24-0014', NULL, 19, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Apple LFO - Registered - name from admin', 'Linear Facilities Operation', 1001, NULL, 'e1300fd7-2dee-47d1-b655-2ad3fd10f052', NULL, 'Registered', NULL, 2, '2026-02-11 16:58:54.052884-08', NULL, '~', NULL, '24-0014', NULL, 19, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Banana LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990004', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL, 'Registered', NULL, 3, '2026-02-11 16:58:54.077556-08', NULL, '~', NULL, '24-0015', NULL, 20, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Banana LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990004', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL, 'Registered', NULL, 4, '2026-02-11 16:58:54.088137-08', NULL, '~', NULL, '24-0015', NULL, 20, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Banana LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990004', '002d5a9e-32a6-4191-938c-2c02bfec592d', NULL, 'Registered', NULL, 5, '2026-02-11 16:58:54.100511-08', NULL, '~', NULL, '24-0015', NULL, 20, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Barbie LFO - Draft -- no facility - name from admin', 'Linear Facilities Operation', NULL, NULL, '556ceeb0-7e24-4d89-b639-61f625f82084', NULL, 'Draft', NULL, 6, '2026-02-11 16:58:54.120129-08', NULL, '~', NULL, NULL, NULL, 20, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Barbie LFO - Draft -- no facility - name from admin', 'Linear Facilities Operation', NULL, NULL, '556ceeb0-7e24-4d89-b639-61f625f82084', NULL, 'Draft', NULL, 7, '2026-02-11 16:58:54.134434-08', NULL, '~', NULL, NULL, NULL, 20, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bugle SFO - Registered - name from admin', 'Single Facility Operation', NULL, NULL, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', '2023-12-16 07:27:00-08', 'Registered', NULL, 8, '2026-02-11 16:58:54.151282-08', NULL, '~', NULL, '23-0001', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bugle SFO - Registered - name from admin', 'Single Facility Operation', NULL, NULL, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', '2023-12-16 07:27:00-08', 'Registered', NULL, 9, '2026-02-11 16:58:54.162631-08', NULL, '~', NULL, '23-0001', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bugle SFO - Registered - name from admin', 'Single Facility Operation', NULL, NULL, '3b5b95ea-2a1a-450d-8e2e-2e15feed96c9', '2023-12-16 07:27:00-08', 'Registered', NULL, 10, '2026-02-11 16:58:54.1753-08', NULL, '~', NULL, '23-0001', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Alien SFO - Draft - no facility - name from admin', 'Single Facility Operation', NULL, NULL, 'c0743c09-82fa-4186-91aa-4b5412e3415c', '2024-01-12 07:27:00-08', 'Draft', NULL, 11, '2026-02-11 16:58:54.190093-08', NULL, '~', NULL, NULL, NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Alien SFO - Draft - no facility - name from admin', 'Single Facility Operation', NULL, NULL, 'c0743c09-82fa-4186-91aa-4b5412e3415c', '2024-01-12 07:27:00-08', 'Draft', NULL, 12, '2026-02-11 16:58:54.20083-08', NULL, '~', NULL, NULL, NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Alien SFO - Draft - no facility - name from admin', 'Single Facility Operation', NULL, NULL, 'c0743c09-82fa-4186-91aa-4b5412e3415c', '2024-01-12 07:27:00-08', 'Draft', NULL, 13, '2026-02-11 16:58:54.207849-08', NULL, '~', NULL, NULL, NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bangles SFO - Registered - has Multiple Operators - name from admin', 'Single Facility Operation', NULL, '23219990001', 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488e', NULL, 'Registered', NULL, 14, '2026-02-11 16:58:54.221271-08', NULL, '~', NULL, '24-0003', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bangles SFO - Registered - has Multiple Operators - name from admin', 'Single Facility Operation', NULL, '23219990001', 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488e', NULL, 'Registered', NULL, 15, '2026-02-11 16:58:54.228177-08', NULL, '~', NULL, '24-0003', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bangles SFO - Registered - has Multiple Operators - name from admin', 'Single Facility Operation', NULL, '23219990001', 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488e', NULL, 'Registered', NULL, 16, '2026-02-11 16:58:54.238942-08', NULL, '~', NULL, '24-0003', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Alligator SFO - Registered - name from admin', 'Single Facility Operation', NULL, '23219999999', 'd99725a7-1c3a-47cb-a59b-e2388ce0fa18', '2024-01-14 07:27:00-08', 'Registered', NULL, 17, '2026-02-11 16:58:54.250186-08', NULL, '~', NULL, '24-0004', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Opted-in Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Alligator SFO - Registered - name from admin', 'Single Facility Operation', NULL, '23219999999', 'd99725a7-1c3a-47cb-a59b-e2388ce0fa18', '2024-01-14 07:27:00-08', 'Registered', NULL, 18, '2026-02-11 16:58:54.258359-08', NULL, '~', NULL, '24-0004', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Opted-in Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Alligator SFO - Registered - name from admin', 'Single Facility Operation', NULL, '23219999999', 'd99725a7-1c3a-47cb-a59b-e2388ce0fa18', '2024-01-14 07:27:00-08', 'Registered', NULL, 19, '2026-02-11 16:58:54.265121-08', NULL, '~', NULL, '24-0004', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Opted-in Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Anteater LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990006', '436dd99a-cb41-4494-91c9-98ab149b557d', '2024-01-15 07:27:00-08', 'Registered', NULL, 20, '2026-02-11 16:58:54.281638-08', NULL, '~', NULL, '24-0005', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Anteater LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990006', '436dd99a-cb41-4494-91c9-98ab149b557d', '2024-01-15 07:27:00-08', 'Registered', NULL, 21, '2026-02-11 16:58:54.288772-08', NULL, '~', NULL, '24-0005', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Arctic EIO - Registered - name from admin', 'Electricity Import Operation', NULL, '23219990007', 'a47b5fb6-1e10-401a-b70e-574bd925db99', '2024-01-16 07:27:00-08', 'Registered', NULL, 22, '2026-02-11 16:58:54.297419-08', NULL, '~', NULL, '24-0006', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Electricity Import Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Arctic EIO - Registered - name from admin', 'Electricity Import Operation', NULL, '23219990007', 'a47b5fb6-1e10-401a-b70e-574bd925db99', '2024-01-16 07:27:00-08', 'Registered', NULL, 23, '2026-02-11 16:58:54.307889-08', NULL, '~', NULL, '24-0006', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Electricity Import Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Argument LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990008', '21e70498-c4b0-4525-8443-86faa96206e3', '2024-01-17 07:27:00-08', 'Registered', NULL, 24, '2026-02-11 16:58:54.316603-08', NULL, '~', NULL, '24-0007', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'New Entrant Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Argument LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990008', '21e70498-c4b0-4525-8443-86faa96206e3', '2024-01-17 07:27:00-08', 'Registered', NULL, 25, '2026-02-11 16:58:54.322707-08', NULL, '~', NULL, '24-0007', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'New Entrant Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Argument LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990008', '21e70498-c4b0-4525-8443-86faa96206e3', '2024-01-17 07:27:00-08', 'Registered', NULL, 26, '2026-02-11 16:58:54.334138-08', NULL, '~', NULL, '24-0007', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'New Entrant Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Art LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '17550cd8-3e73-4e52-aa91-ab90cb3b62b0', '2024-01-18 07:27:00-08', 'Registered', NULL, 27, '2026-02-11 16:58:54.350612-08', NULL, '~', NULL, '24-0008', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Art LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '17550cd8-3e73-4e52-aa91-ab90cb3b62b0', '2024-01-18 07:27:00-08', 'Registered', NULL, 28, '2026-02-11 16:58:54.363275-08', NULL, '~', NULL, '24-0008', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Aeolian LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990010', '7d3fc7d1-0504-4ee4-a9c5-447f4b324b57', '2024-01-19 07:27:00-08', 'Registered', NULL, 29, '2026-02-11 16:58:54.378371-08', NULL, '~', NULL, '24-0009', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Aeolian LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990010', '7d3fc7d1-0504-4ee4-a9c5-447f4b324b57', '2024-01-19 07:27:00-08', 'Registered', NULL, 30, '2026-02-11 16:58:54.392418-08', NULL, '~', NULL, '24-0009', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Aeolian LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990010', '7d3fc7d1-0504-4ee4-a9c5-447f4b324b57', '2024-01-19 07:27:00-08', 'Registered', NULL, 31, '2026-02-11 16:58:54.40491-08', NULL, '~', NULL, '24-0009', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Anchor LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990011', 'acf5811e-d521-43f7-a5c7-a6d6dd47bb31', '2024-01-20 07:27:00-08', 'Registered', NULL, 32, '2026-02-11 16:58:54.423995-08', NULL, '~', NULL, '24-0010', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Anchor LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990011', 'acf5811e-d521-43f7-a5c7-a6d6dd47bb31', '2024-01-20 07:27:00-08', 'Registered', NULL, 33, '2026-02-11 16:58:54.437292-08', NULL, '~', NULL, '24-0010', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Airplane LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '8563da83-0762-4d29-9b22-da5b52ef0f24', '2024-01-21 07:27:00-08', 'Registered', NULL, 34, '2026-02-11 16:58:54.455172-08', NULL, '~', NULL, '24-0011', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Airplane LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '8563da83-0762-4d29-9b22-da5b52ef0f24', '2024-01-21 07:27:00-08', 'Registered', NULL, 35, '2026-02-11 16:58:54.465825-08', NULL, '~', NULL, '24-0011', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Airplane LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '8563da83-0762-4d29-9b22-da5b52ef0f24', '2024-01-21 07:27:00-08', 'Registered', NULL, 36, '2026-02-11 16:58:54.511711-08', NULL, '~', NULL, '24-0011', NULL, 21, '685d581b-5698-411f-ae00-de1d97334a71', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bojangles EIO - Registered - name from admin', 'Electricity Import Operation', NULL, NULL, 'df62d793-8cfe-4272-a93e-ea9c9139ff82', '2024-01-22 07:27:00-08', 'Registered', NULL, 37, '2026-02-11 16:58:54.53731-08', NULL, '~', NULL, NULL, NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'Electricity Import Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Brine LFO - Registered - No BORO and BCGHG ID - name from admin', 'Linear Facilities Operation', NULL, NULL, 'c5b3643b-c143-42f3-8a2b-03ccc7319cd9', '2024-01-23 07:27:00-08', 'Registered', NULL, 38, '2026-02-11 16:58:54.559704-08', NULL, '~', NULL, NULL, NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Brine LFO - Registered - No BORO and BCGHG ID - name from admin', 'Linear Facilities Operation', NULL, NULL, 'c5b3643b-c143-42f3-8a2b-03ccc7319cd9', '2024-01-23 07:27:00-08', 'Registered', NULL, 39, '2026-02-11 16:58:54.568643-08', NULL, '~', NULL, NULL, NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Brine LFO - Registered - No BORO and BCGHG ID - name from admin', 'Linear Facilities Operation', NULL, NULL, 'c5b3643b-c143-42f3-8a2b-03ccc7319cd9', '2024-01-23 07:27:00-08', 'Registered', NULL, 40, '2026-02-11 16:58:54.582821-08', NULL, '~', NULL, NULL, NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bling LFO - Draft - name from admin', 'Linear Facilities Operation', NULL, NULL, '954c0382-ff61-4e87-a8a0-873586534b54', '2024-01-24 07:27:00-08', 'Draft', NULL, 41, '2026-02-11 16:58:54.59925-08', NULL, '~', NULL, NULL, NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bees LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990016', '6d07d02a-1ad2-46ed-ad56-2f84313e98bf', '2024-01-25 07:27:00-08', 'Registered', NULL, 42, '2026-02-11 16:58:54.612115-08', NULL, '~', NULL, '24-0012', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bees LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990016', '6d07d02a-1ad2-46ed-ad56-2f84313e98bf', '2024-01-25 07:27:00-08', 'Registered', NULL, 43, '2026-02-11 16:58:54.6273-08', NULL, '~', NULL, '24-0012', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bees LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990016', '6d07d02a-1ad2-46ed-ad56-2f84313e98bf', '2024-01-25 07:27:00-08', 'Registered', NULL, 44, '2026-02-11 16:58:54.641453-08', NULL, '~', NULL, '24-0012', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Blue LFO - Not Started - name from admin', 'Linear Facilities Operation', NULL, NULL, '59d95661-c752-489b-9fd1-0c3fa3454dda', '2024-01-26 07:27:00-08', 'Not Started', NULL, 45, '2026-02-11 16:58:54.654362-08', NULL, '~', NULL, NULL, NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bullet LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990018', '1bd04128-d070-4d3a-940a-0874c4956181', '2024-01-27 07:27:00-08', 'Registered', NULL, 46, '2026-02-11 16:58:54.67862-08', NULL, '~', NULL, '24-0013', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'New Entrant Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bullet LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990018', '1bd04128-d070-4d3a-940a-0874c4956181', '2024-01-27 07:27:00-08', 'Registered', NULL, 47, '2026-02-11 16:58:54.689044-08', NULL, '~', NULL, '24-0013', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'New Entrant Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bullet LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990018', '1bd04128-d070-4d3a-940a-0874c4956181', '2024-01-27 07:27:00-08', 'Registered', NULL, 48, '2026-02-11 16:58:54.703368-08', NULL, '~', NULL, '24-0013', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'New Entrant Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bat LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990019', '17f13f4d-29b4-45f4-b025-b21f2e126771', '2024-01-28 07:27:00-08', 'Registered', NULL, 49, '2026-02-11 16:58:54.717058-08', NULL, '~', NULL, '24-0016', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bat LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990019', '17f13f4d-29b4-45f4-b025-b21f2e126771', '2024-01-28 07:27:00-08', 'Registered', NULL, 50, '2026-02-11 16:58:54.725604-08', NULL, '~', NULL, '24-0016', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bin LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990020', 'ef9044dd-2a27-4d26-86fe-02e51e0755f7', NULL, 'Registered', NULL, 51, '2026-02-11 16:58:54.734412-08', NULL, '~', NULL, '24-0017', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bin LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990020', 'ef9044dd-2a27-4d26-86fe-02e51e0755f7', NULL, 'Registered', NULL, 52, '2026-02-11 16:58:54.742322-08', NULL, '~', NULL, '24-0017', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bark LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990021', 'aeeb781e-a97b-4ab2-9a6e-02e4522add1a', NULL, 'Registered', NULL, 53, '2026-02-11 16:58:54.750934-08', NULL, '~', NULL, '24-0018', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Bark LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, '23219990021', 'aeeb781e-a97b-4ab2-9a6e-02e4522add1a', NULL, 'Registered', NULL, 54, '2026-02-11 16:58:54.758034-08', NULL, '~', NULL, '24-0018', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Brown LFO - Not Started -- no facility - name from admin', 'Linear Facilities Operation', NULL, NULL, '0ac72fa9-2636-4f54-b378-af6b1a070787', NULL, 'Not Started', NULL, 55, '2026-02-11 16:58:54.766194-08', NULL, '~', NULL, NULL, NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Cat LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, 'b35a2095-80e6-4b75-990e-ccf19a57edfa', NULL, 'Registered', NULL, 56, '2026-02-11 16:58:54.774014-08', NULL, '~', NULL, NULL, NULL, 20, '438eff6c-d2e7-40ab-8220-29d3a86ef314', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Cat LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, 'b35a2095-80e6-4b75-990e-ccf19a57edfa', NULL, 'Registered', NULL, 57, '2026-02-11 16:58:54.780926-08', NULL, '~', NULL, NULL, NULL, 20, '438eff6c-d2e7-40ab-8220-29d3a86ef314', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Dog LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '1d59cb82-2776-4785-a8f7-4b13bc9b4579', NULL, 'Registered', NULL, 58, '2026-02-11 16:58:54.788429-08', NULL, '~', NULL, NULL, NULL, 20, '7e8b72dc-4196-427f-a553-7879748139e1', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Dog LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '1d59cb82-2776-4785-a8f7-4b13bc9b4579', NULL, 'Registered', NULL, 59, '2026-02-11 16:58:54.795866-08', NULL, '~', NULL, NULL, NULL, 20, '7e8b72dc-4196-427f-a553-7879748139e1', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Elephant LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '82e6ac8f-42f2-42a7-b179-132a3488b2e1', NULL, 'Registered', NULL, 60, '2026-02-11 16:58:54.81391-08', NULL, '~', NULL, NULL, NULL, 20, '4c1010c1-55ca-485d-84bd-6d975fd0af90', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Elephant LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '82e6ac8f-42f2-42a7-b179-132a3488b2e1', NULL, 'Registered', NULL, 61, '2026-02-11 16:58:54.822012-08', NULL, '~', NULL, NULL, NULL, 20, '4c1010c1-55ca-485d-84bd-6d975fd0af90', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Fox LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '95f6ec29-4b5b-42a2-9759-d4e9c99738d7', NULL, 'Registered', NULL, 62, '2026-02-11 16:58:54.830613-08', NULL, '~', NULL, NULL, NULL, 20, '5712ee05-5f3b-4822-825d-6fffddafda4c', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Fox LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '95f6ec29-4b5b-42a2-9759-d4e9c99738d7', NULL, 'Registered', NULL, 63, '2026-02-11 16:58:54.838123-08', NULL, '~', NULL, NULL, NULL, 20, '5712ee05-5f3b-4822-825d-6fffddafda4c', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Giraffe LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '1b21579c-87f9-452f-b9c1-c784cb96f62e', NULL, 'Registered', NULL, 64, '2026-02-11 16:58:54.846672-08', NULL, '~', NULL, NULL, NULL, 20, 'edb1aff1-f888-4199-ab88-068364496347', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Giraffe LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '1b21579c-87f9-452f-b9c1-c784cb96f62e', NULL, 'Registered', NULL, 65, '2026-02-11 16:58:54.85323-08', NULL, '~', NULL, NULL, NULL, 20, 'edb1aff1-f888-4199-ab88-068364496347', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Horse LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '4623c545-ef99-464a-bd8b-bb96ffb57e8e', NULL, 'Registered', NULL, 66, '2026-02-11 16:58:54.861844-08', NULL, '~', NULL, NULL, NULL, 20, 'ea4314ea-1974-465a-a851-278c8f9c8daa', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Horse LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '4623c545-ef99-464a-bd8b-bb96ffb57e8e', NULL, 'Registered', NULL, 67, '2026-02-11 16:58:54.869367-08', NULL, '~', NULL, NULL, NULL, 20, 'ea4314ea-1974-465a-a851-278c8f9c8daa', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Iguana LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, 'f82c2a59-0f3a-4a89-b7d7-9fcd7a7ecb77', NULL, 'Registered', NULL, 68, '2026-02-11 16:58:54.878759-08', NULL, '~', NULL, NULL, NULL, 20, '04384911-264a-4510-b582-11ee704b8e41', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Iguana LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, 'f82c2a59-0f3a-4a89-b7d7-9fcd7a7ecb77', NULL, 'Registered', NULL, 69, '2026-02-11 16:58:54.899506-08', NULL, '~', NULL, NULL, NULL, 20, '04384911-264a-4510-b582-11ee704b8e41', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Jaguar LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '3182c8a4-22ff-4ca9-9f91-093c8888fd7c', NULL, 'Registered', NULL, 70, '2026-02-11 16:58:54.912701-08', NULL, '~', NULL, NULL, NULL, 20, 'f209ef09-dfe6-42a1-ac4c-7689897f1b51', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Jaguar LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '3182c8a4-22ff-4ca9-9f91-093c8888fd7c', NULL, 'Registered', NULL, 71, '2026-02-11 16:58:54.921147-08', NULL, '~', NULL, NULL, NULL, 20, 'f209ef09-dfe6-42a1-ac4c-7689897f1b51', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Kangaroo LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '68f0b68a-c6b5-4c4e-82a6-d7fbd690f55e', NULL, 'Registered', NULL, 72, '2026-02-11 16:58:54.934709-08', NULL, '~', NULL, NULL, NULL, 20, 'bb979661-0782-49b2-9c64-acd8424b692b', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Kangaroo LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '68f0b68a-c6b5-4c4e-82a6-d7fbd690f55e', NULL, 'Registered', NULL, 73, '2026-02-11 16:58:54.942731-08', NULL, '~', NULL, NULL, NULL, 20, 'bb979661-0782-49b2-9c64-acd8424b692b', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Lion LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, 'a5f7f5b3-fb56-4377-ae6c-b11c8b6d0041', NULL, 'Registered', NULL, 74, '2026-02-11 16:58:54.95266-08', NULL, '~', NULL, NULL, NULL, 20, 'bb702949-e303-4788-9ba9-806232a5f711', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Lion LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, 'a5f7f5b3-fb56-4377-ae6c-b11c8b6d0041', NULL, 'Registered', NULL, 75, '2026-02-11 16:58:54.960353-08', NULL, '~', NULL, NULL, NULL, 20, 'bb702949-e303-4788-9ba9-806232a5f711', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Monkey LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '8494e89c-489b-441b-a05d-e935b1d82487', NULL, 'Registered', NULL, 76, '2026-02-11 16:58:54.970126-08', NULL, '~', NULL, NULL, NULL, 20, 'a35fb5ad-edd9-4465-982e-81b824644d07', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Monkey LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '8494e89c-489b-441b-a05d-e935b1d82487', NULL, 'Registered', NULL, 77, '2026-02-11 16:58:54.981833-08', NULL, '~', NULL, NULL, NULL, 20, 'a35fb5ad-edd9-4465-982e-81b824644d07', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Narwhal LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '84d4c8b7-55b5-4700-90ad-fb1c169d4e1f', NULL, 'Registered', NULL, 78, '2026-02-11 16:58:54.993458-08', NULL, '~', NULL, NULL, NULL, 20, '5c847c75-3b17-414c-97f8-88ba81cb3821', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Narwhal LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '84d4c8b7-55b5-4700-90ad-fb1c169d4e1f', NULL, 'Registered', NULL, 79, '2026-02-11 16:58:55.004245-08', NULL, '~', NULL, NULL, NULL, 20, '5c847c75-3b17-414c-97f8-88ba81cb3821', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Ostrich LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '62d5d8ea-b163-4a83-95a4-bfadbb6b21f7', NULL, 'Registered', NULL, 80, '2026-02-11 16:58:55.021488-08', NULL, '~', NULL, NULL, NULL, 20, '4a792f0f-cf9d-48c8-9a95-f504c5f84b12', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Ostrich LFO - Registered - name from admin', 'Linear Facilities Operation', NULL, NULL, '62d5d8ea-b163-4a83-95a4-bfadbb6b21f7', NULL, 'Registered', NULL, 81, '2026-02-11 16:58:55.029867-08', NULL, '~', NULL, NULL, NULL, 20, '4a792f0f-cf9d-48c8-9a95-f504c5f84b12', NULL, NULL, NULL, NULL, NULL, 'Potential Reporting Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Compliance SFO - Obligation not met - name from admin', 'Single Facility Operation', NULL, '13219990046', 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488f', NULL, 'Registered', NULL, 82, '2026-02-11 16:58:55.040877-08', NULL, '~', NULL, '24-0019', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Compliance SFO - Obligation not met - name from admin', 'Single Facility Operation', NULL, '13219990046', 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488f', NULL, 'Registered', NULL, 83, '2026-02-11 16:58:55.051306-08', NULL, '~', NULL, '24-0019', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Compliance SFO - Obligation not met - name from admin', 'Single Facility Operation', NULL, '13219990046', 'b65a3fbc-c81a-49c0-a43a-67bd3a0b488f', NULL, 'Registered', NULL, 84, '2026-02-11 16:58:55.06177-08', NULL, '~', NULL, '24-0019', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Compliance SFO - Earned credits - name from admin', 'Single Facility Operation', NULL, '13219990047', '84ea41f0-4039-44d8-9f91-0e1d5fd47930', NULL, 'Registered', NULL, 85, '2026-02-11 16:58:55.076035-08', NULL, '~', NULL, '24-0020', NULL, 22, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Compliance SFO - Earned credits - name from admin', 'Single Facility Operation', NULL, '13219990047', '84ea41f0-4039-44d8-9f91-0e1d5fd47930', NULL, 'Registered', NULL, 86, '2026-02-11 16:58:55.086451-08', NULL, '~', NULL, '24-0020', NULL, 22, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Compliance SFO - Earned credits - name from admin', 'Single Facility Operation', NULL, '13219990047', '84ea41f0-4039-44d8-9f91-0e1d5fd47930', NULL, 'Registered', NULL, 87, '2026-02-11 16:58:55.096369-08', NULL, '~', NULL, '24-0020', NULL, 22, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Compliance SFO - No obligation or earned credits - name from admin', 'Single Facility Operation', NULL, '13219990048', '3f47b2e1-9a4c-4d3f-8b21-7e9a0c5d2f6b', NULL, 'Registered', NULL, 88, '2026-02-11 16:58:55.111881-08', NULL, '~', NULL, '24-0021', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Compliance SFO - No obligation or earned credits - name from admin', 'Single Facility Operation', NULL, '13219990048', '3f47b2e1-9a4c-4d3f-8b21-7e9a0c5d2f6b', NULL, 'Registered', NULL, 89, '2026-02-11 16:58:55.123891-08', NULL, '~', NULL, '24-0021', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');
INSERT INTO erc_history.operation_history VALUES (NULL, NULL, NULL, 'Compliance SFO - No obligation or earned credits - name from admin', 'Single Facility Operation', NULL, '13219990048', '3f47b2e1-9a4c-4d3f-8b21-7e9a0c5d2f6b', NULL, 'Registered', NULL, 90, '2026-02-11 16:58:55.135724-08', NULL, '~', NULL, '24-0021', NULL, 21, '4242ea9d-b917-4129-93c2-db00b7451051', NULL, NULL, NULL, NULL, NULL, 'OBPS Regulated Operation');

SELECT pg_catalog.setval('erc.activity_id_seq', 38, true);

SELECT pg_catalog.setval('erc.activity_json_schema_id_seq', 26, true);

SELECT pg_catalog.setval('erc.activity_source_type_json_schema_id_seq', 139, true);

SELECT pg_catalog.setval('erc.address_id_seq', 22, true);

SELECT pg_catalog.setval('erc.closure_event_facilities_id_seq', 2, true);

SELECT pg_catalog.setval('erc.compliance_charge_rate_id_seq', 3, true);

SELECT pg_catalog.setval('erc.compliance_earned_credit_id_seq', 1, false);

SELECT pg_catalog.setval('erc.compliance_obligation_id_seq', 1, false);

SELECT pg_catalog.setval('erc.compliance_penalty_accrual_id_seq', 1, false);

SELECT pg_catalog.setval('erc.compliance_penalty_id_seq', 1, false);

SELECT pg_catalog.setval('erc.compliance_penalty_rate_id_seq', 1, false);

SELECT pg_catalog.setval('erc.compliance_period_id_seq', 2, true);

SELECT pg_catalog.setval('erc.compliance_report_id_seq', 1, true);

SELECT pg_catalog.setval('erc.compliance_report_version_id_seq', 1, true);

SELECT pg_catalog.setval('erc.compliance_report_version_manual_handling_id_seq', 1, false);

SELECT pg_catalog.setval('erc.configuration_element_id_seq', 1180, true);

SELECT pg_catalog.setval('erc.configuration_element_reporting_fields_id_seq', 1, false);

SELECT pg_catalog.setval('erc.configuration_id_seq', 1, true);

SELECT pg_catalog.setval('erc.contact_id_seq', 21, true);

SELECT pg_catalog.setval('erc.custom_methodology_schema_id_seq', 7, true);

SELECT pg_catalog.setval('erc.document_id_seq', 2, true);

SELECT pg_catalog.setval('erc.document_type_id_seq', 11, true);

SELECT pg_catalog.setval('erc.elicensing_adjustment_id_seq', 1, false);

SELECT pg_catalog.setval('erc.elicensing_client_operator_id_seq', 1, false);

SELECT pg_catalog.setval('erc.elicensing_interest_rate_id_seq', 1, false);

SELECT pg_catalog.setval('erc.elicensing_invoice_id_seq', 1, false);

SELECT pg_catalog.setval('erc.elicensing_line_item_id_seq', 1, false);

SELECT pg_catalog.setval('erc.elicensing_payment_id_seq', 1, false);

SELECT pg_catalog.setval('erc.emission_category_id_seq', 14, true);

SELECT pg_catalog.setval('erc.emission_category_mapping_id_seq', 228, true);

SELECT pg_catalog.setval('erc.facility_designated_operation_timeline_id_seq', 46, true);

SELECT pg_catalog.setval('erc.facility_report_activities_id_seq', 91, true);

SELECT pg_catalog.setval('erc.facility_report_id_seq', 90, true);

SELECT pg_catalog.setval('erc.facility_snapshot_id_seq', 1, false);

SELECT pg_catalog.setval('erc.facility_well_authorization_numbers_id_seq', 3, true);

SELECT pg_catalog.setval('erc.fuel_type_id_seq', 64, true);

SELECT pg_catalog.setval('erc.gas_type_id_seq', 24, true);

SELECT pg_catalog.setval('erc.methodology_id_seq', 109, true);

SELECT pg_catalog.setval('erc.multiple_operator_id_seq', 1, true);

SELECT pg_catalog.setval('erc.naics_code_id_seq', 48, true);

SELECT pg_catalog.setval('erc.naics_regulatory_values_id_seq', 47, true);

SELECT pg_catalog.setval('erc.operation_activities_id_seq', 70, true);

SELECT pg_catalog.setval('erc.operation_contacts_id_seq', 41, true);

SELECT pg_catalog.setval('erc.operation_designated_operator_timeline_id_seq', 42, true);

SELECT pg_catalog.setval('erc.operation_regulated_products_id_seq', 22, true);

SELECT pg_catalog.setval('erc.opted_in_operation_detail_id_seq', 1, false);

SELECT pg_catalog.setval('erc.parent_operator_id_seq', 1, true);

SELECT pg_catalog.setval('erc.partner_operator_id_seq', 1, true);

SELECT pg_catalog.setval('erc.product_emission_intensity_id_seq', 37, true);

SELECT pg_catalog.setval('erc.regulated_product_id_seq', 43, true);

SELECT pg_catalog.setval('erc.report_activity_id_seq', 3, true);

SELECT pg_catalog.setval('erc.report_additional_data_id_seq', 3, true);

SELECT pg_catalog.setval('erc.report_attachment_confirmation_id_seq', 1, false);

SELECT pg_catalog.setval('erc.report_attachment_id_seq', 6, true);

SELECT pg_catalog.setval('erc.report_compliance_summary_id_seq', 2, true);

SELECT pg_catalog.setval('erc.report_compliance_summary_product_id_seq', 1, false);

SELECT pg_catalog.setval('erc.report_electricity_import_data_id_seq', 1, false);

SELECT pg_catalog.setval('erc.report_emission_allocation_id_seq', 3, true);

SELECT pg_catalog.setval('erc.report_emission_emission_categories_id_seq', 3, true);

SELECT pg_catalog.setval('erc.report_emission_id_seq', 3, true);

SELECT pg_catalog.setval('erc.report_fuel_id_seq', 3, true);

SELECT pg_catalog.setval('erc.report_id_seq', 12, true);

SELECT pg_catalog.setval('erc.report_methodology_id_seq', 3, true);

SELECT pg_catalog.setval('erc.report_new_entrant_emission_id_seq', 1, false);

SELECT pg_catalog.setval('erc.report_new_entrant_id_seq', 1, false);

SELECT pg_catalog.setval('erc.report_new_entrant_production_id_seq', 1, false);

SELECT pg_catalog.setval('erc.report_non_attributable_emissions_gas_type_id_seq', 1, false);

SELECT pg_catalog.setval('erc.report_non_attributable_emissions_id_seq', 1, false);

SELECT pg_catalog.setval('erc.report_operation_activities_id_seq', 15, true);

SELECT pg_catalog.setval('erc.report_operation_id_seq', 14, true);

SELECT pg_catalog.setval('erc.report_operation_regulated_products_id_seq', 24, true);

SELECT pg_catalog.setval('erc.report_operation_representative_id_seq', 19, true);

SELECT pg_catalog.setval('erc.report_person_responsible_id_seq', 3, true);

SELECT pg_catalog.setval('erc.report_product_emission_allocation_id_seq', 5, true);

SELECT pg_catalog.setval('erc.report_product_id_seq', 5, true);

SELECT pg_catalog.setval('erc.report_raw_activity_data_id_seq', 3, true);

SELECT pg_catalog.setval('erc.report_sign_off_id_seq', 6, true);

SELECT pg_catalog.setval('erc.report_source_type_id_seq', 3, true);

SELECT pg_catalog.setval('erc.report_unit_id_seq', 3, true);

SELECT pg_catalog.setval('erc.report_verification_id_seq', 6, true);

SELECT pg_catalog.setval('erc.report_verification_visit_id_seq', 1, false);

SELECT pg_catalog.setval('erc.report_version_id_seq', 14, true);

SELECT pg_catalog.setval('erc.reporting_field_id_seq', 92, true);

SELECT pg_catalog.setval('erc.restart_event_facilities_id_seq', 2, true);

SELECT pg_catalog.setval('erc.source_type_id_seq', 86, true);

SELECT pg_catalog.setval('erc.temporary_shutdown_event_facilities_id_seq', 2, true);

SELECT pg_catalog.setval('erc.transfer_event_facilities_id_seq', 4, true);

SELECT pg_catalog.setval('erc_history.activity_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.address_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.app_role_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.bc_greenhouse_gas_id_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.bc_obps_regulated_operation_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.business_role_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.business_structure_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.closure_event_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.compliance_earned_credit_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.compliance_obligation_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.contact_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.document_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.document_type_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.facility_designated_operation_timeline_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.facility_history_history_id_seq', 1, true);

SELECT pg_catalog.setval('erc_history.facility_snapshot_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.multiple_operator_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.naics_code_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.operation_designated_operator_timeline_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.operation_history_history_id_seq', 90, true);

SELECT pg_catalog.setval('erc_history.operator_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.opted_in_operation_detail_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.parent_operator_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.partner_operator_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.regulated_product_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.restart_event_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.temporary_shutdown_event_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.transfer_event_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.user_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.user_operator_history_history_id_seq', 1, false);

SELECT pg_catalog.setval('erc_history.well_authorization_number_history_history_id_seq', 1, false);
