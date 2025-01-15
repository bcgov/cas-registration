import pytest
from model_bakery import baker
from copy import deepcopy

from registration.models import Operation, NaicsCode, DocumentType
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.tests.constants import MOCK_DATA_URL
from registration.utils import custom_reverse_lazy


class TestChangingRegistrationPurpose(CommonTestSetup):
    def _create_opted_in_payload(self):
        return {
            "meets_section_3_emissions_requirements": False,
            "meets_electricity_import_operation_criteria": True,
            "meets_entire_operation_requirements": False,
            "meets_section_6_emissions_requirements": True,
            "meets_naics_code_11_22_562_classification_requirements": False,
            "meets_producing_gger_schedule_a1_regulated_product": True,
            "meets_reporting_and_regulated_obligations": False,
            "meets_notification_to_director_on_criteria_change": True,
        }

    def _create_new_entrant_payload(self):
        return {"date_of_first_shipment": "On or after April 1, 2024", "new_entrant_application": MOCK_DATA_URL}

    def _prepare_test_data(self, registration_purpose):
        self.approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        contact = baker.make_recipe('utils.contact')
        self.operation = baker.make_recipe(
            'utils.operation',
            created_by=self.user,
            operator=self.approved_user_operator.operator,
            registration_purpose=registration_purpose,
            contacts=[contact],
            name=f"{registration_purpose} Operation",
        )

    def _set_operation_information(self):
        mock_naics_codes = baker.make(NaicsCode, _quantity=3)
        operation_information_payload = {
            "boundary_map": MOCK_DATA_URL,
            "process_flow_diagram": MOCK_DATA_URL,
            "activities": [2, 3],
            "naics_code_id": mock_naics_codes[1].id,
            "secondary_naics_code_id": mock_naics_codes[2].id,
            "name": self.operation.name,
            "type": self.operation.type,
            "registration_purpose": self.operation.registration_purpose,
            "regulated_products": [1, 2],
        }
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            operation_information_payload,
            custom_reverse_lazy("register_edit_operation_information", kwargs={'operation_id': self.operation.id}),
        )
        if response.status_code != 200:
            raise Exception(response.json())
        self.operation.refresh_from_db()

    def _set_new_registration_purpose(self, new_purpose):
        operation_payload = {
            "name": self.operation.name,
            "type": self.operation.type,
            "registration_purpose": new_purpose,
            "activities": [],  # activities is required in payload so needs to be explicitly set, even if it's empty
        }
        if new_purpose != Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
            operation_payload.update(
                {
                    "boundary_map": MOCK_DATA_URL,
                    "process_flow_diagram": MOCK_DATA_URL,
                    "activities": [2, 3],
                    "naics_code_id": self.operation.naics_code_id,
                    "secondary_naics_code_id": self.operation.secondary_naics_code_id,
                }
            )
        if new_purpose in [
            Operation.Purposes.OBPS_REGULATED_OPERATION,
            Operation.Purposes.NEW_ENTRANT_OPERATION,
            Operation.Purposes.OPTED_IN_OPERATION,
        ]:
            operation_payload.update({"regulated_products": [1, 2]})
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            operation_payload,
            custom_reverse_lazy("register_edit_operation_information", kwargs={'operation_id': self.operation.id}),
        )
        if response.status_code != 200:
            raise Exception(response.json())
        self.operation.refresh_from_db()

    def _set_operation_status(self, status):
        # manually setting the operation status this way because normally industry users don't have control
        # over the status of their operation
        self.operation.status = status
        self.operation.refresh_from_db()

    def _set_opted_in_operation_detail(self):
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            self._create_opted_in_payload(),
            custom_reverse_lazy(
                "operation_registration_update_opted_in_operation_detail", kwargs={'operation_id': self.operation.id}
            ),
        )
        if response.status_code != 200:
            raise Exception(response.json())
        self.operation.refresh_from_db()

    def _set_new_entrant_info(self):
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            self._create_new_entrant_payload(),
            custom_reverse_lazy(
                "create_or_replace_new_entrant_application", kwargs={'operation_id': self.operation.id}
            ),
        )
        if response.status_code != 200:
            raise Exception(response.json())
        self.operation.refresh_from_db()

    def _set_registration_submission(self):
        response = TestUtils.mock_patch_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'acknowledgement_of_review': True,
                'acknowledgement_of_information': True,
                'acknowledgement_of_records': True,
            },
            custom_reverse_lazy("operation_registration_submission", kwargs={'operation_id': self.operation.id}),
        )
        if response.status_code != 200:
            raise Exception(response.json())
        self.operation.refresh_from_db()

    ### Tests for Original Purpose = Reporting

    def _test_reporting_to_potential_reporting(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Reporting to Potential Reporting.
        No data should be changed.
        """
        assert self.operation.registration_purpose == Operation.Purposes.POTENTIAL_REPORTING_OPERATION
        assert self.operation.activities == self.original_operation_record.activities

    def _test_reporting_to_eio(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Reporting to Electricity Import Operation.
        Expect the following to be removed: reporting activities, process flow diagram, boundary map, NAICS code.
        """
        assert self.operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
        assert self.operation.activities.count() == 0
        assert self.operation.documents.count() == 0
        assert self.operation.naics_code is None

    def _test_reporting_to_new_entrant(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Reporting to New Entrant.
        No data should be removed; new data should be added specific to new entrants.
        """
        assert self.operation.registration_purpose == Operation.Purposes.NEW_ENTRANT_OPERATION
        assert self.operation.date_of_first_shipment == "On or after April 1, 2024"
        assert self.operation.documents.count() == 3
        assert (
            self.operation.documents.filter(type=DocumentType.objects.get(name="new_entrant_application")) is not None
        )

    def _test_reporting_to_opted_in(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Reporting to Opted-in Operation.
        No data should be removed; new data should be created specific to opted-ins.
        """
        assert self.operation.registration_purpose == Operation.Purposes.OPTED_IN_OPERATION
        assert self.operation.opted_in_operation is not None
        assert self.operation.opt_in is True
        assert self.operation.opted_in_operation.meets_section_3_emissions_requirements is False
        assert self.operation.opted_in_operation.meets_electricity_import_operation_criteria is True
        assert self.operation.opted_in_operation.meets_entire_operation_requirements is False
        assert self.operation.opted_in_operation.meets_section_6_emissions_requirements is True
        assert self.operation.opted_in_operation.meets_naics_code_11_22_562_classification_requirements is False
        assert self.operation.opted_in_operation.meets_producing_gger_schedule_a1_regulated_product is True
        assert self.operation.opted_in_operation.meets_reporting_and_regulated_obligations is False
        assert self.operation.opted_in_operation.meets_notification_to_director_on_criteria_change is True

    def _test_reporting_to_obps_regulated(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Reporting to OBPS Regulated.
        Should have at least one regulated product for OBPS Regulated - no products were required for Reporting.
        """
        assert self.operation.registration_purpose == Operation.Purposes.OBPS_REGULATED_OPERATION
        assert self.operation.regulated_products is not None
        assert self.operation.activities == self.original_operation_record.activities

    ### Tests for Original Purpose = OBPS Regulated

    def _test_regulated_to_reporting(self):
        """
        Tests operation registration data for situation where registration_purpose changes from OBPS Regulated to Reporting.
        Regulated products should be removed; everything else should remain the same.
        """
        assert self.operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION
        assert self.operation.regulated_products.count() == 0
        assert self.operation.activities == self.original_operation_record.activities

    def _test_regulated_to_potential_reporting(self):
        """
        Tests operation registration data for situation where registration_purpose changes from OBPS Regulated to Potential Reporting.
        Regulated products should be removed; everything else should remain the same.
        """
        assert self.operation.registration_purpose == Operation.Purposes.POTENTIAL_REPORTING_OPERATION
        assert self.operation.regulated_products.count() == 0
        assert self.operation.activities == self.original_operation_record.activities

    def _test_regulated_to_new_entrant(self):
        """
        Tests operation registration data for situation where registration_purpose changes from OBPS Regulated to New Entrant.
        No data should be removed; new data should be added specific to New Entrant information.
        """
        assert self.operation.registration_purpose == Operation.Purposes.NEW_ENTRANT_OPERATION
        assert self.operation.date_of_first_shipment == "On or after April 1, 2024"
        assert (
            self.operation.documents.filter(type=DocumentType.objects.get(name="new_entrant_application")) is not None
        )
        assert self.operation.documents.filter(type=DocumentType.objects.get(name="boundary_map")) is not None
        assert self.operation.documents.filter(type=DocumentType.objects.get(name="process_flow_diagram")) is not None
        assert self.operation.activities.count() > 0
        assert self.operation.regulated_products.count() > 0
        assert self.operation.activities == self.original_operation_record.activities
        assert self.operation.regulated_products == self.original_operation_record.regulated_products

    def _test_regulated_to_opted_in(self):
        """
        Tests operation registration data for situation where registration_purpose changes from OBPS Regulated to Opted-in Operation.
        No data should be removed; new data to add specific to opted-in operations.
        """
        assert self.operation.registration_purpose == Operation.Purposes.OPTED_IN_OPERATION
        assert self.operation.activities.count() > 0
        assert self.operation.regulated_products.count() > 0
        assert self.operation.activities == self.original_operation_record.activities
        assert self.operation.regulated_products == self.original_operation_record.regulated_products
        assert self.operation.opt_in is True
        assert self.operation.opted_in_operation is not None
        assert self.operation.opted_in_operation.meets_section_3_emissions_requirements is False
        assert self.operation.opted_in_operation.meets_electricity_import_operation_criteria is True
        assert self.operation.opted_in_operation.meets_entire_operation_requirements is False
        assert self.operation.opted_in_operation.meets_section_6_emissions_requirements is True
        assert self.operation.opted_in_operation.meets_naics_code_11_22_562_classification_requirements is False
        assert self.operation.opted_in_operation.meets_producing_gger_schedule_a1_regulated_product is True
        assert self.operation.opted_in_operation.meets_reporting_and_regulated_obligations is False
        assert self.operation.opted_in_operation.meets_notification_to_director_on_criteria_change is True

    def _test_regulated_to_eio(self):
        """
        Tests operation registration data for situation where registration_purpose changes from OBPS Regulated to Electricity Import Operation.
        Fields to be removed: process flow diagram, boundary map, reporting activities, regulated products, NAICS code.
        """
        assert self.operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
        assert self.operation.activities.count() == 0
        assert self.operation.documents.count() == 0
        assert self.operation.naics_code is None
        assert self.operation.regulated_products.count() == 0

    ### Tests for Original Purpose = Opted-in

    def _test_opted_in_to_reporting(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Opted-in Operation to Reporting Operation.
        Should delete opted_in_operation_detail and regulated_products, and set opt_in to False.
        """
        assert self.operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION
        assert self.operation.opt_in is False
        assert self.operation.regulated_products.count() == 0
        if self.operation.status == Operation.Statuses.REGISTERED:
            assert self.operation.opted_in_operation.archived_at is not None
            assert self.operation.opted_in_operation.archived_by is not None
        else:
            assert self.operation.opted_in_operation is None

    def _test_opted_in_to_potential_reporting(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Opted-in Operation to Potential Reporting Operation.
        Should delete opted_in_operation_detail and regulated_products, and set opt_in to False.
        """
        assert self.operation.registration_purpose == Operation.Purposes.POTENTIAL_REPORTING_OPERATION
        assert self.operation.opt_in is False
        assert self.operation.regulated_products.count() == 0
        if self.operation.status == Operation.Statuses.REGISTERED:
            assert self.operation.opted_in_operation.archived_at is not None
            assert self.operation.opted_in_operation.archived_by is not None
        else:
            assert self.operation.opted_in_operation is None

    def _test_opted_in_to_regulated(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Opted-in Operation to OBPS Regulated.
        Should delete opted_in_operation_detail and set opt_in to False.
        """
        assert self.operation.registration_purpose == Operation.Purposes.OBPS_REGULATED_OPERATION
        assert self.operation.opt_in is False
        if self.operation.status == Operation.Statuses.REGISTERED:
            assert self.operation.opted_in_operation.archived_at is not None
            assert self.operation.opted_in_operation.archived_by is not None
        else:
            assert self.operation.opted_in_operation is None

    def _test_opted_in_to_eio(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Opted-in Operation to Electricity Import Operation.
        Should delete opted_in_operation_detail, documents, regulated_products, activities, NAICS codes, and set opt_in to False.
        """
        assert self.operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
        assert self.operation.opt_in is False
        if self.operation.status == Operation.Statuses.REGISTERED:
            assert self.operation.opted_in_operation.archived_at is not None
            assert self.operation.opted_in_operation.archived_by is not None
        else:
            assert self.operation.opted_in_operation is None
        assert self.operation.regulated_products.count() == 0
        assert self.operation.activities.count() == 0
        assert self.operation.naics_code is None
        assert self.operation.documents.count() == 0

    def _test_opted_in_to_new_entrant(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Opted-in Operation to New Entrant.
        Should delete opted_in_operation_detail, set opt_in to False, and add data for date_of_first_shipment and document upload for new_entrant_application.
        """
        assert self.operation.registration_purpose == Operation.Purposes.NEW_ENTRANT_OPERATION
        assert self.operation.opt_in is False
        if self.operation.status == Operation.Statuses.REGISTERED:
            assert self.operation.opted_in_operation.archived_at is not None
            assert self.operation.opted_in_operation.archived_by is not None
        else:
            assert self.operation.opted_in_operation is None
        assert self.operation.date_of_first_shipment is not None
        assert (
            self.operation.documents.filter(type=DocumentType.objects.get(name='new_entrant_application')).count() > 0
        )

    ### Tests for Original Purpose = New Entrant

    def _test_new_entrant_to_reporting(self):
        """
        Tests operation registration data for situation where registration_purpose changes from New Entrant to Reporting Operation.
        Registration data specific to new entrants (date of first shipment, new entrant application document) should be removed.
        Regulated products should also be removed.
        """
        assert self.operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION
        assert self.operation.documents.filter(type=DocumentType.objects.get(name="process_flow_diagram")).count() > 0
        assert self.operation.documents.filter(type=DocumentType.objects.get(name="boundary_map")).count() > 0
        assert (
            self.operation.documents.filter(type=DocumentType.objects.get(name="new_entrant_application")).count() == 0
        )
        assert self.operation.date_of_first_shipment is None
        assert self.operation.activities is not None
        assert self.operation.activities == self.original_operation_record.activities
        assert self.operation.regulated_products.count() == 0

    def _test_new_entrant_to_potential_reporting(self):
        """
        Tests operation registration data for situation where registration_purpose changes from New Entrant to Potential Reporting Operation.
        Registration data specific to new entrants (date of first shipment, new entrant application document) should be removed.
        Regulated products should also be removed.
        """
        assert self.operation.registration_purpose == Operation.Purposes.POTENTIAL_REPORTING_OPERATION
        assert self.operation.documents.filter(type=DocumentType.objects.get(name="process_flow_diagram")).count() > 0
        assert self.operation.documents.filter(type=DocumentType.objects.get(name="boundary_map")).count() > 0
        assert (
            self.operation.documents.filter(type=DocumentType.objects.get(name="new_entrant_application")).count() == 0
        )
        assert self.operation.date_of_first_shipment is None
        assert self.operation.activities is not None
        assert self.operation.activities == self.original_operation_record.activities
        assert self.operation.regulated_products.count() == 0

    def _test_new_entrant_to_eio(self):
        """
        Tests operation registration data for situation where registration_purpose changes from New Entrant to Electricity Import Operation.
        Registration data specific to new entrants (date of first shipment, new entrant application document) should be removed.
        In addition, data for process flow diagram, boundary map, regulated products, and reporting activities should be removed.
        """
        assert self.operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
        assert self.operation.documents.filter(type=DocumentType.objects.get(name="process_flow_diagram")).count() == 0
        assert self.operation.documents.filter(type=DocumentType.objects.get(name="boundary_map")).count() == 0
        assert (
            self.operation.documents.filter(type=DocumentType.objects.get(name="new_entrant_application")).count() == 0
        )
        assert self.operation.date_of_first_shipment is None
        assert self.operation.activities.count() == 0
        assert self.operation.regulated_products.count() == 0
        assert self.operation.naics_code is None

    def _test_new_entrant_to_regulated(self):
        """
        Tests operation registration data for situation where registration_purpose changes from New Entrant to OBPS Regulated.
        Data to be removed: date_of_first_shipment, new_entrant_application document. No data expected to be added.
        """
        assert self.operation.registration_purpose == Operation.Purposes.OBPS_REGULATED_OPERATION
        assert self.operation.date_of_first_shipment is None
        assert self.operation.documents.filter(type=DocumentType.objects.get(name="process_flow_diagram")).count() > 0
        assert self.operation.documents.filter(type=DocumentType.objects.get(name="boundary_map")).count() > 0
        assert (
            self.operation.documents.filter(type=DocumentType.objects.get(name="new_entrant_application")).count() == 0
        )
        assert self.operation.regulated_products.count() > 0
        assert self.operation.activities.count() > 0

    def _test_new_entrant_to_opted_in(self):
        """
        Tests operation registration data for situation where registration_purpose changes from New Entrant to Opted-in Operation.
        Data to be removed: date_of_first_shipment, new_entrant_application document. Expect opted_in_operation_detail data to be added.
        """
        assert self.operation.registration_purpose == Operation.Purposes.OPTED_IN_OPERATION
        assert self.operation.date_of_first_shipment is None
        assert (
            self.operation.documents.filter(type=DocumentType.objects.get(name="new_entrant_application")).count() == 0
        )
        assert self.operation.opt_in is True
        assert self.operation.opted_in_operation is not None
        assert self.operation.opted_in_operation.meets_section_3_emissions_requirements is False
        assert self.operation.opted_in_operation.meets_electricity_import_operation_criteria is True
        assert self.operation.opted_in_operation.meets_entire_operation_requirements is False
        assert self.operation.opted_in_operation.meets_section_6_emissions_requirements is True
        assert self.operation.opted_in_operation.meets_naics_code_11_22_562_classification_requirements is False
        assert self.operation.opted_in_operation.meets_producing_gger_schedule_a1_regulated_product is True
        assert self.operation.opted_in_operation.meets_reporting_and_regulated_obligations is False
        assert self.operation.opted_in_operation.meets_notification_to_director_on_criteria_change is True

    ### Tests for Original Purpose = EIO

    def _test_eio_to_reporting(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Electricity Import Operation to Reporting.
        No data should be removed; must add data for reporting activities, process flow diagram, and boundary map.
        """
        assert self.operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION
        assert self.operation.activities.count() > 0
        assert self.operation.documents.filter(type=DocumentType.objects.get(name="process_flow_diagram")).count() > 0
        assert self.operation.documents.filter(type=DocumentType.objects.get(name="boundary_map")).count() > 0
        assert self.operation.naics_code is not None

    def _test_eio_to_regulated(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Electricity Import Operation to OBPS Regulated.
        No data should be removed; must add data for regulated products, reporting activities, process flow diagram, and boundary map.
        """
        assert self.operation.registration_purpose == Operation.Purposes.OBPS_REGULATED_OPERATION
        assert self.operation.activities.count() > 0
        assert self.operation.documents.filter(type=DocumentType.objects.get(name="process_flow_diagram")) is not None
        assert self.operation.documents.filter(type=DocumentType.objects.get(name="boundary_map")) is not None
        assert self.operation.regulated_products.count() > 0
        assert self.operation.naics_code is not None

    def _test_eio_to_potential_reporting(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Electricity Import Operation to Potential Reporting.
        No data should be removed; must add data for reporting activities, process flow diagram, and boundary map.
        """
        assert self.operation.registration_purpose == Operation.Purposes.POTENTIAL_REPORTING_OPERATION
        assert self.operation.activities.count() > 0
        assert self.operation.documents.filter(type=DocumentType.objects.get(name="process_flow_diagram")) is not None
        assert self.operation.documents.filter(type=DocumentType.objects.get(name="boundary_map")) is not None
        assert self.operation.naics_code is not None

    def _test_eio_to_new_entrant(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Electricity Import Operation to New Entrant.
        No data should be removed; must add data for reporting activities, process flow diagram, boundary map, new entrant application doc, and date of first shipment.
        """
        assert self.operation.registration_purpose == Operation.Purposes.NEW_ENTRANT_OPERATION
        assert self.operation.activities.count() > 0
        assert self.operation.regulated_products.count() > 0
        assert self.operation.documents.filter(type=DocumentType.objects.get(name='process_flow_diagram')) is not None
        assert self.operation.documents.filter(type=DocumentType.objects.get(name='boundary_map')) is not None
        assert (
            self.operation.documents.filter(type=DocumentType.objects.get(name='new_entrant_application')) is not None
        )
        assert self.operation.date_of_first_shipment is not None
        assert self.operation.naics_code is not None

    def _test_eio_to_opted_in(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Electricity Import Operation to Opted-in Operation.
        No data should be removed; must add data for reporting activities, regulated products, process flow diagram, boundary map, and opted_in_operation_detail.
        """
        assert self.operation.registration_purpose == Operation.Purposes.OPTED_IN_OPERATION
        assert self.operation.activities.count() > 0
        assert self.operation.regulated_products.count() > 0
        assert self.operation.documents.filter(type=DocumentType.objects.get(name='process_flow_diagram')) is not None
        assert self.operation.documents.filter(type=DocumentType.objects.get(name='boundary_map')) is not None
        assert self.operation.opt_in is True
        assert self.operation.opted_in_operation is not None
        assert self.operation.opted_in_operation.meets_section_3_emissions_requirements is False
        assert self.operation.opted_in_operation.meets_electricity_import_operation_criteria is True
        assert self.operation.opted_in_operation.meets_entire_operation_requirements is False
        assert self.operation.opted_in_operation.meets_section_6_emissions_requirements is True
        assert self.operation.opted_in_operation.meets_naics_code_11_22_562_classification_requirements is False
        assert self.operation.opted_in_operation.meets_producing_gger_schedule_a1_regulated_product is True
        assert self.operation.opted_in_operation.meets_reporting_and_regulated_obligations is False
        assert self.operation.opted_in_operation.meets_notification_to_director_on_criteria_change is True

    ### Tests for Original Purpose = Potential Reporting

    def _test_potential_reporting_to_reporting(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Potential Reporting to Reporting.
        No data should be removed.
        """
        assert self.operation.registration_purpose == Operation.Purposes.REPORTING_OPERATION
        assert self.operation.activities == self.original_operation_record.activities

    def _test_potential_reporting_to_regulated(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Potential Reporting to OBPS Regulated.
        No data should be removed; regulated products should be added.
        """
        assert self.operation.registration_purpose == Operation.Purposes.OBPS_REGULATED_OPERATION
        assert self.operation.regulated_products is not None
        assert self.operation.activities == self.original_operation_record.activities

    def _test_potential_reporting_to_new_entrant(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Potential Reporting to New Entrant.
        No data should be removed; additional information should be added specific to New Entrant information.
        Regulated products and reporting activities should also be added.
        """
        assert self.operation.registration_purpose == Operation.Purposes.NEW_ENTRANT_OPERATION
        assert self.operation.date_of_first_shipment == "On or after April 1, 2024"
        assert self.operation.documents.count() == 3
        assert (
            self.operation.documents.filter(type=DocumentType.objects.get(name="new_entrant_application")) is not None
        )
        assert self.operation.regulated_products.count() > 0
        assert self.operation.activities.count() > 0

    def _test_potential_reporting_to_opted_in(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Potential Reporting to Opted-in Operation.
        No data should be removed; additional information should be added specific to Opted-in information.
        Regulated products and reporting activities should also be added.
        """
        assert self.operation.registration_purpose == Operation.Purposes.OPTED_IN_OPERATION
        assert self.operation.opted_in_operation is not None
        assert self.operation.opt_in is True
        assert self.operation.opted_in_operation.meets_section_3_emissions_requirements is False
        assert self.operation.opted_in_operation.meets_electricity_import_operation_criteria is True
        assert self.operation.opted_in_operation.meets_entire_operation_requirements is False
        assert self.operation.opted_in_operation.meets_section_6_emissions_requirements is True
        assert self.operation.opted_in_operation.meets_naics_code_11_22_562_classification_requirements is False
        assert self.operation.opted_in_operation.meets_producing_gger_schedule_a1_regulated_product is True
        assert self.operation.opted_in_operation.meets_reporting_and_regulated_obligations is False
        assert self.operation.opted_in_operation.meets_notification_to_director_on_criteria_change is True
        assert self.operation.regulated_products.count() > 0
        assert self.operation.activities.count() > 0

    def _test_potential_reporting_to_eio(self):
        """
        Tests operation registration data for situation where registration_purpose changes from Potential Reporting to Electricity Import Operation.
        Fields that should be removed: reporting activities, process flow diagram, boundary map.
        """
        assert self.operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
        assert self.operation.activities.count() == 0
        assert self.operation.documents.count() == 0
        assert self.operation.naics_code is None

    @pytest.mark.parametrize("original_purpose", list(Operation.Purposes))
    @pytest.mark.parametrize("new_purpose", list(Operation.Purposes))
    @pytest.mark.parametrize("registration_status", [Operation.Statuses.REGISTERED, Operation.Statuses.DRAFT])
    def test_changing_registration_purpose(self, original_purpose, new_purpose, registration_status):
        """
        If the registration_status == Registered, the irrelevant data should be archived
        If the registration_status == Draft, the irrelevant data should be deleted
        """
        if original_purpose == new_purpose:
            pytest.skip()

        ### set original registration_purpose and save the operation
        self._prepare_test_data(original_purpose)
        self._set_operation_information()
        if original_purpose == Operation.Purposes.OPTED_IN_OPERATION:
            self._set_opted_in_operation_detail()
        elif original_purpose == Operation.Purposes.NEW_ENTRANT_OPERATION:
            self._set_new_entrant_info()
        self._set_operation_status(registration_status)

        # make a copy of the original operation record to compare against later
        self.original_operation_record = deepcopy(self.operation)

        ### change to new_purpose
        self._set_new_registration_purpose(new_purpose)
        if new_purpose == Operation.Purposes.OPTED_IN_OPERATION:
            self._set_opted_in_operation_detail()
        elif new_purpose == Operation.Purposes.NEW_ENTRANT_OPERATION:
            self._set_new_entrant_info()

        ### Assertions applicable to all purposes
        # assert that we're patching the same operation, not creating a new one
        assert self.operation.id == self.original_operation_record.id
        assert self.operation.created_at == self.original_operation_record.created_at
        # assert that we're logging the updates to the operation
        assert self.operation.updated_by == self.user
        assert self.operation.updated_at > self.operation.created_at

        match original_purpose:
            case Operation.Purposes.REPORTING_OPERATION:
                match new_purpose:
                    case Operation.Purposes.POTENTIAL_REPORTING_OPERATION:
                        return self._test_reporting_to_potential_reporting()
                    case Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
                        return self._test_reporting_to_eio()
                    case Operation.Purposes.NEW_ENTRANT_OPERATION:
                        return self._test_reporting_to_new_entrant()
                    case Operation.Purposes.OPTED_IN_OPERATION:
                        return self._test_reporting_to_opted_in()
                    case Operation.Purposes.OBPS_REGULATED_OPERATION:
                        return self._test_reporting_to_obps_regulated()
                    case _:
                        return (
                            f"New Registration Purpose {new_purpose} not found for original purpose {original_purpose}"
                        )
            case Operation.Purposes.OBPS_REGULATED_OPERATION:
                match new_purpose:
                    case Operation.Purposes.REPORTING_OPERATION:
                        return self._test_regulated_to_reporting()
                    case Operation.Purposes.POTENTIAL_REPORTING_OPERATION:
                        return self._test_regulated_to_potential_reporting()
                    case Operation.Purposes.NEW_ENTRANT_OPERATION:
                        return self._test_regulated_to_new_entrant()
                    case Operation.Purposes.OPTED_IN_OPERATION:
                        return self._test_regulated_to_opted_in()
                    case Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
                        return self._test_regulated_to_eio()
                    case _:
                        return (
                            f"New Registration Purpose {new_purpose} not found for original purpose {original_purpose}"
                        )
            case Operation.Purposes.POTENTIAL_REPORTING_OPERATION:
                match new_purpose:
                    case Operation.Purposes.REPORTING_OPERATION:
                        return self._test_potential_reporting_to_reporting()
                    case Operation.Purposes.OBPS_REGULATED_OPERATION:
                        return self._test_potential_reporting_to_regulated()
                    case Operation.Purposes.NEW_ENTRANT_OPERATION:
                        return self._test_potential_reporting_to_new_entrant()
                    case Operation.Purposes.OPTED_IN_OPERATION:
                        return self._test_potential_reporting_to_opted_in()
                    case Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
                        return self._test_potential_reporting_to_eio()
                    case _:
                        return (
                            f"New Registration Purpose {new_purpose} not found for original purpose {original_purpose}"
                        )
            case Operation.Purposes.NEW_ENTRANT_OPERATION:
                match new_purpose:
                    case Operation.Purposes.REPORTING_OPERATION:
                        return self._test_new_entrant_to_reporting()
                    case Operation.Purposes.OBPS_REGULATED_OPERATION:
                        return self._test_new_entrant_to_regulated()
                    case Operation.Purposes.POTENTIAL_REPORTING_OPERATION:
                        return self._test_new_entrant_to_potential_reporting()
                    case Operation.Purposes.OPTED_IN_OPERATION:
                        return self._test_new_entrant_to_opted_in()
                    case Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
                        return self._test_new_entrant_to_eio()
                    case _:
                        return (
                            f"New Registration Purpose {new_purpose} not found for original purpose {original_purpose}"
                        )
            case Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
                match new_purpose:
                    case Operation.Purposes.REPORTING_OPERATION:
                        return self._test_eio_to_reporting()
                    case Operation.Purposes.OBPS_REGULATED_OPERATION:
                        return self._test_eio_to_regulated()
                    case Operation.Purposes.POTENTIAL_REPORTING_OPERATION:
                        return self._test_eio_to_potential_reporting()
                    case Operation.Purposes.NEW_ENTRANT_OPERATION:
                        return self._test_eio_to_new_entrant()
                    case Operation.Purposes.OPTED_IN_OPERATION:
                        return self._test_eio_to_opted_in()
                    case _:
                        return (
                            f"New Registration Purpose {new_purpose} not found for original purpose {original_purpose}"
                        )
            case Operation.Purposes.OPTED_IN_OPERATION:
                match new_purpose:
                    case Operation.Purposes.REPORTING_OPERATION:
                        return self._test_opted_in_to_reporting()
                    case Operation.Purposes.POTENTIAL_REPORTING_OPERATION:
                        return self._test_opted_in_to_potential_reporting()
                    case Operation.Purposes.OBPS_REGULATED_OPERATION:
                        return self._test_opted_in_to_regulated()
                    case Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
                        return self._test_opted_in_to_eio()
                    case Operation.Purposes.NEW_ENTRANT_OPERATION:
                        return self._test_opted_in_to_new_entrant()
                    case _:
                        return (
                            f"New Registration Purpose {new_purpose} not found for original purpose {original_purpose}"
                        )
            case _:
                return f"Original Registration Purpose {original_purpose} not found"
