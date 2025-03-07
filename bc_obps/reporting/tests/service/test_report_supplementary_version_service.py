from django.test import TestCase
from unittest.mock import MagicMock, call, patch
from model_bakery import baker
from reporting.service.report_supplementary_version_service import ReportSupplementaryVersionService

class ReportSupplementaryVersionServiceTests(TestCase):
    def setUp(self):
        # Use the baker recipe to create ReportVersion instances.
        self.old_report_version = baker.make_recipe('reporting.tests.utils.report_version')
        self.new_report_version = baker.make_recipe('reporting.tests.utils.report_version')

    @patch("reporting.services.report_supplementary_version_service.clone_report_version_operation")
    def test_clone_report_version_representatives(self, mock_create):
        """
        Test that the cloning method for report operation representatives 
        correctly creates new representative objects for a new report version by duplicating the data from the old report version.
        """       

        # Act: Run the cloning method.
        ReportSupplementaryVersionService.clone_report_version_representatives(
            self.old_report_version, self.new_report_version
        )

        # Ensure the service was called with the correct params
        mock_create.assert_called_once_with( self.old_report_version, self.new_report_version)
