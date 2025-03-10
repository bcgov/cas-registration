import pytest
from django.db.models import Q
from model_bakery import baker

from registration.models import FacilityDesignatedOperationTimeline, Operation
from registration.tests.constants import MOCK_FILE
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestOperationRegistration(CommonTestSetup):
    def _prepare_test_data(self, operation_type: Operation.Types):
        self.approved_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator', user=self.user
        )
        self.bcghg_id = baker.make_recipe('registration.tests.utils.bcghg_id')
        self.boro_id = baker.make_recipe('registration.tests.utils.boro_id')
        # add some random contacts and facilities so we can test that they are not overridden
        random_contacts = baker.make_recipe('registration.tests.utils.contact', _quantity=5)
        self.operation = baker.make_recipe(
            'registration.tests.utils.operation',
            created_by=self.user,
            operator=self.approved_user_operator.operator,
            bcghg_id=self.bcghg_id,
            bc_obps_regulated_operation=self.boro_id,
            contacts=random_contacts,
            type=operation_type,
        )
        # add some facilities so we can test that they are not overridden
        if operation_type == Operation.Types.LFO:
            baker.make_recipe(
                'registration.tests.utils.facility_designated_operation_timeline',
                operation=self.operation,
                _quantity=5,
            )
        # saving the created_at, updated_at and operation_representative_id to compare later
        self.created_at = self.operation.created_at
        self.updated_at = None
        self.operation_representative_id = None
        self.purposes_with_no_regulated_products = [
            Operation.Purposes.REPORTING_OPERATION,
            Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
            Operation.Purposes.POTENTIAL_REPORTING_OPERATION,
        ]

    def _set_operation_information(self, purpose: Operation.Purposes, operation_type: Operation.Types):

        if operation_type == Operation.Types.EIO:
            operation_information_payload = {
                "registration_purpose": [purpose],
                "name": [f"{purpose} name"],
                "type": [operation_type.value],
            }
        else:
            operation_information_payload = {
                "registration_purpose": [purpose],
                **({"regulated_products": [1, 2]} if purpose not in self.purposes_with_no_regulated_products else {}),
                "name": [f"{purpose} name"],
                "type": [operation_type],
                "naics_code_id": [1],
                "secondary_naics_code_id": [2],
                "tertiary_naics_code_id": [3],
                "activities": [1, 2],
                "boundary_map": MOCK_FILE,
                "process_flow_diagram": MOCK_FILE,
            }

        response = TestUtils.client.post(
            custom_reverse_lazy("register_edit_operation_information", kwargs={'operation_id': self.operation.id}),
            data=operation_information_payload,
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )

        if response.status_code != 200:
            raise Exception(response.json())
        self.operation.refresh_from_db()

    def _set_facilities(self):
        facility_payload = [
            {
                "street_address": "123 street",
                "municipality": "city",
                "province": "AB",
                "postal_code": "H0H0H0",
                "name": "Test Facility 2",
                "type": "Large Facility",
                "latitude_of_largest_emissions": "5",
                "longitude_of_largest_emissions": "5",
                "operation_id": self.operation.id,
                "well_authorization_numbers": [12345, 654321],
            },
        ]
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            'application/json',
            facility_payload,
            custom_reverse_lazy("create_facilities"),
        )
        if response.status_code != 201:
            raise Exception(response.json())
        self.operation.refresh_from_db()

    def _set_new_entrant_application(self):
        response = TestUtils.client.post(
            custom_reverse_lazy(
                "create_or_replace_new_entrant_application", kwargs={'operation_id': self.operation.id}
            ),
            data={
                "date_of_first_shipment": ["On or after April 1, 2024"],
                'new_entrant_application': MOCK_FILE,
            },
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )

        if response.status_code != 200:
            raise Exception(response.json())
        self.operation.refresh_from_db()

    def _set_opted_in_operation_detail(self):
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                "meets_section_3_emissions_requirements": False,
                "meets_electricity_import_operation_criteria": True,
                "meets_entire_operation_requirements": False,
                "meets_section_6_emissions_requirements": True,
                "meets_naics_code_11_22_562_classification_requirements": False,
                "meets_producing_gger_schedule_a1_regulated_product": True,
                "meets_reporting_and_regulated_obligations": False,
                "meets_notification_to_director_on_criteria_change": True,
            },
            custom_reverse_lazy(
                "operation_registration_update_opted_in_operation_detail", kwargs={'operation_id': self.operation.id}
            ),
        )
        if response.status_code != 200:
            raise Exception(response.json())
        self.operation.refresh_from_db()

    def _set_operation_representative(self):
        operation_representative_payload = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'test@email.com',
            'phone_number': '+16044011234',
            'position_title': 'Manager',
            'street_address': '123 Main St',
            'municipality': 'Vancouver',
            'province': 'BC',
            'postal_code': 'H0H 0H0',
        }
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            'application/json',
            operation_representative_payload,
            custom_reverse_lazy("create_operation_representative", kwargs={'operation_id': self.operation.id}),
        )
        if response.status_code != 201:
            raise Exception(response.json())
        self.operation_representative_id = response.json()['id']
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
        self.updated_at = self.operation.updated_at  # save the updated_at timestamp to compare later

    @pytest.mark.parametrize("operation_type", [Operation.Types.SFO, Operation.Types.LFO])
    @pytest.mark.parametrize(
        "purpose", [p for p in Operation.Purposes if p != Operation.Purposes.ELECTRICITY_IMPORT_OPERATION]
    )  # EIOs have OperationTypes.EIO so are tested separately below
    def test_operation_registration_workflow(self, operation_type, purpose):
        #### prepare test data
        self._prepare_test_data(operation_type)
        #### Operation Information Form ####
        self._set_operation_information(purpose, operation_type)
        #### Facility From ####
        self._set_facilities()

        if purpose == Operation.Purposes.NEW_ENTRANT_OPERATION:
            #### New Entrant Application Form ####
            self._set_new_entrant_application()
        elif purpose == Operation.Purposes.OPTED_IN_OPERATION:
            #### Opted-In Operation Detail Form ####
            self._set_opted_in_operation_detail()

        #### Operation Representative Form ####
        self._set_operation_representative()
        #### Registration Submission ####
        self._set_registration_submission()

        # Assertions
        assert self.operation.name == f'{purpose} name'
        assert self.operation.type == operation_type
        assert self.operation.operator_id == self.approved_user_operator.operator_id
        assert self.operation.bcghg_id_id == self.bcghg_id.id

        if purpose != Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
            assert self.operation.naics_code_id == 1
            assert self.operation.secondary_naics_code_id == 2
            assert self.operation.tertiary_naics_code_id == 3
            assert self.operation.activities.count() == 2
            assert list(self.operation.activities.values_list('id', flat=True)) == [1, 2]

        if purpose == Operation.Purposes.NEW_ENTRANT_OPERATION:
            assert self.operation.date_of_first_shipment == "On or after April 1, 2024"
            assert self.operation.documents.filter(type__name='new_entrant_application').exists()
        else:
            assert self.operation.date_of_first_shipment is None

        if purpose == Operation.Purposes.OPTED_IN_OPERATION:
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
            assert self.operation.opted_in_operation.updated_by == self.user
            assert self.operation.opted_in_operation.updated_at is not None
        else:
            assert self.operation.opt_in is False
            assert self.operation.opted_in_operation_id is None

        # make sure we have the two required documents
        # (unless the registration_purpose is EIO, in which case no documents are required)
        if purpose != Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
            assert (
                self.operation.documents.filter(Q(type__name='process_flow_diagram') | Q(type__name='boundary_map'))
                .distinct()
                .count()
                == 2
            )

        # make sure we have the facility
        if operation_type == Operation.Types.LFO:
            # for LFO  5 existing facilities + 1 new facility
            assert (
                FacilityDesignatedOperationTimeline.objects.filter(
                    operation=self.operation,
                ).count()
                == 6
            )
        elif operation_type == Operation.Types.SFO:
            # for SFO we only have the new facility
            assert (
                FacilityDesignatedOperationTimeline.objects.filter(
                    operation=self.operation,
                ).count()
                == 1
            )

        # make sure we are not overriding existing contacts of the operation
        assert self.operation.contacts.count() == 6
        assert self.operation.contacts.filter(
            business_role__role_name='Operation Representative',
            address__street_address__isnull=False,
            address__municipality__isnull=False,
            address__province__isnull=False,
            address__postal_code__isnull=False,
        ).exists()
        # make sure operation representative is created for operator as well
        assert self.approved_user_operator.operator.contacts.filter(id=self.operation_representative_id).exists()

        if purpose in self.purposes_with_no_regulated_products:
            assert not self.operation.regulated_products.exists()
        else:
            assert self.operation.regulated_products.count() == 2
            assert list(self.operation.regulated_products.values_list('id', flat=True)) == [1, 2]

        assert self.operation.status == Operation.Statuses.REGISTERED
        assert self.operation.registration_purpose is not None

    def test_operation_registration_workflow_EIO(self):
        #### prepare test data
        self._prepare_test_data(Operation.Types.EIO)
        #### Operation Information Form ####
        self._set_operation_information(Operation.Purposes.ELECTRICITY_IMPORT_OPERATION, Operation.Types.EIO)
        #### Operation Representative Form ####
        self._set_operation_representative()
        #### Registration Submission ####
        self._set_registration_submission()

        # Assertions
        assert self.operation.name == f'{Operation.Purposes.ELECTRICITY_IMPORT_OPERATION} name'
        assert self.operation.type == Operation.Types.EIO
        assert self.operation.operator_id == self.approved_user_operator.operator_id
        assert self.operation.bcghg_id_id == self.bcghg_id.id
        assert self.operation.opt_in is False
        assert self.operation.opted_in_operation_id is None
        assert not self.operation.regulated_products.exists()

        # make sure we have the facility
        assert self.operation.facilities.count() == 1

        assert self.operation.status == Operation.Statuses.REGISTERED
        assert self.operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
