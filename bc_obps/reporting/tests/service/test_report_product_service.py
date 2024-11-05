import pytest
from registration.models.regulated_product import RegulatedProduct
from reporting.models.report_product import ReportProduct
from reporting.service.report_product_service import ReportProductService
from model_bakery.baker import make_recipe

pytestmark = pytest.mark.django_db


class TestReportProductService:
    def setup_method(self):
        self.test_user_guid = make_recipe('registration.tests.utils.industry_operator_user').user_guid
        self.facility_report = make_recipe(
            "reporting.tests.utils.facility_report",
            products=RegulatedProduct.objects.filter(id__in=[29, 1]),
        )
        self.report_version_id = self.facility_report.report_version.id
        self.facility_id = self.facility_report.facility.id

        self.test_data = [
            {
                "product_id": 29,  # Sugar
                "annual_production": 1234,
                "production_data_apr_dec": 56789,
                "production_methodology": "test prod method",
                "storage_quantity_start_of_period": 2345,
                "storage_quantity_end_of_period": 9876,
                "quantity_sold_during_period": 1234567890,
                "quantity_throughput_during_period": 0,
            },
            {
                "product_id": 1,
                "annual_production": 2,
                "production_data_apr_dec": 3,
                "production_methodology": "test prod method 2",
            },
        ]

    def test_save_data(self):

        assert ReportProduct.objects.filter(facility_report=self.facility_report).count() == 0

        ReportProductService.save_production_data(
            self.report_version_id,
            self.facility_id,
            self.test_data,
            self.test_user_guid,
        )

        assert ReportProduct.objects.filter(facility_report=self.facility_report).count() == 2

        rp1 = ReportProduct.objects.get(facility_report=self.facility_report, product_id=1)
        assert rp1.annual_production == 2
        assert rp1.production_data_apr_dec == 3
        assert rp1.production_methodology == "test prod method 2"
        assert rp1.storage_quantity_start_of_period is None
        assert rp1.storage_quantity_end_of_period is None
        assert rp1.quantity_sold_during_period is None
        assert rp1.quantity_throughput_during_period is None

        rp2 = ReportProduct.objects.get(facility_report=self.facility_report, product_id=29)
        assert rp2.annual_production == 1234
        assert rp2.production_data_apr_dec == 56789
        assert rp2.production_methodology == "test prod method"
        assert rp2.storage_quantity_start_of_period == 2345
        assert rp2.storage_quantity_end_of_period == 9876
        assert rp2.quantity_sold_during_period == 1234567890
        assert rp2.quantity_throughput_during_period == 0

    def test_deletes_report_product_records_when_not_in_submitted_data(self):
        ReportProductService.save_production_data(
            self.report_version_id, self.facility_id, self.test_data, self.test_user_guid
        )
        assert ReportProduct.objects.count() == 2
        ReportProductService.save_production_data(
            self.report_version_id, self.facility_id, self.test_data[:1], self.test_user_guid
        )
        assert ReportProduct.objects.count() == 1
        assert ReportProduct.objects.get(product_id=29) is not None

    def test_saves_additional_data(self):
        self.facility_report.products.add(RegulatedProduct.objects.get(id=10))

        ReportProductService.save_production_data(
            self.report_version_id, self.facility_id, self.test_data, self.test_user_guid
        )
        assert ReportProduct.objects.all().count() == 2

        new_item = {
            "product_id": 10,
            "annual_production": 0,
            "production_data_apr_dec": 0,
            "production_methodology": " ",
            "storage_quantity_start_of_period": 0,
            "storage_quantity_end_of_period": 0,
            "quantity_sold_during_period": 0,
            "quantity_throughput_during_period": 0,
        }

        ReportProductService.save_production_data(
            self.report_version_id, self.facility_id, [*self.test_data, new_item], self.test_user_guid
        )
        assert ReportProduct.objects.count() == 3
        assert list(ReportProduct.objects.order_by("product__id").values_list("product_id", flat=True)) == [1, 10, 29]

    def test_updates_existing_report_products(self):
        ReportProductService.save_production_data(
            self.report_version_id, self.facility_id, self.test_data, self.test_user_guid
        )
        updated_item = {
            "product_id": 1,
            "annual_production": 0,
            "production_data_apr_dec": 0,
            "production_methodology": " ",
            "storage_quantity_start_of_period": 0,
            "storage_quantity_end_of_period": 0,
            "quantity_sold_during_period": 0,
            "quantity_throughput_during_period": 0,
        }
        ReportProductService.save_production_data(
            self.report_version_id, self.facility_id, [self.test_data[0], updated_item], self.test_user_guid
        )
        assert ReportProduct.objects.count() == 2
        rp1 = ReportProduct.objects.get(facility_report=self.facility_report, product_id=1)
        assert rp1.annual_production == 0
        assert rp1.production_data_apr_dec == 0
        assert rp1.production_methodology == " "
        assert rp1.storage_quantity_start_of_period == 0
        assert rp1.storage_quantity_end_of_period == 0
        assert rp1.quantity_sold_during_period == 0
        assert rp1.quantity_throughput_during_period == 0

    def test_raises_if_facility_report_doesnt_list_products(self):
        products = make_recipe("registration.tests.utils.regulated_product", _quantity=3)
        self.facility_report.products.set(products)

        with pytest.raises(
            ValueError,
            match="Data was submitted for a product that is not in the products allowed for this facility*",
        ):
            ReportProductService.save_production_data(
                self.report_version_id, self.facility_id, self.test_data, self.test_user_guid
            )

    # Test saving errors out if no product_id
    def test_errors_out_if_no_product_id(self):
        test_data = [
            {
                "annual_production": 1234,
                "production_data_apr_dec": 56789,
                "production_methodology": "test prod method",
            }
        ]

        with pytest.raises(KeyError, match="product_id"):
            ReportProductService.save_production_data(
                self.facility_report.report_version.id, self.facility_report.facility.id, test_data, self.test_user_guid
            )

    # Test the created_at and created_by
    def test_sets_created_updated_fields(self):
        ReportProductService.save_production_data(
            self.report_version_id, self.facility_id, self.test_data, self.test_user_guid
        )

        report_products = ReportProduct.objects.all()
        assert report_products.count() == 2
        assert all(rp.created_by.user_guid == self.test_user_guid for rp in report_products)
        assert all(rp.created_at is not None for rp in report_products)
        assert all(rp.updated_by is None for rp in report_products)
        assert all(rp.updated_at is None for rp in report_products)

        another_user_guid = make_recipe('registration.tests.utils.industry_operator_user').user_guid
        ReportProductService.save_production_data(
            self.report_version_id,
            self.facility_id,
            [
                {
                    "product_id": 1,
                    "annual_production": 4,
                    "production_data_apr_dec": 4,
                    "production_methodology": "test updated!",
                }
            ],
            another_user_guid,
        )

        report_products = ReportProduct.objects.all()
        assert report_products.count() == 1
        assert report_products[0].created_by.user_guid == self.test_user_guid
        assert report_products[0].created_at is not None
        assert report_products[0].updated_by.user_guid == another_user_guid
        assert report_products[0].updated_at is not None

    def test_retrieves_the_data_sorted_by_product_id(self):
        products = make_recipe("registration.tests.utils.regulated_product", _quantity=3)
        data = [
            {
                "product_id": products[2].id,
                "annual_production": 2,
                "production_data_apr_dec": 3,
                "production_methodology": "test prod method",
            },
            {
                "product_id": products[0].id,
                "annual_production": 2,
                "production_data_apr_dec": 3,
                "production_methodology": "test prod method",
            },
            {
                "product_id": products[1].id,
                "annual_production": 2,
                "production_data_apr_dec": 3,
                "production_methodology": "test prod method",
            },
        ]
        self.facility_report.products.set(products)

        ReportProductService.save_production_data(self.report_version_id, self.facility_id, data, self.test_user_guid)

        return_value = list(ReportProductService.get_production_data(self.report_version_id, self.facility_id))

        assert len(return_value) == 3
        assert return_value[0] == ReportProduct.objects.get(product_id=products[0].id)
        assert return_value[1] == ReportProduct.objects.get(product_id=products[1].id)
        assert return_value[2] == ReportProduct.objects.get(product_id=products[2].id)
