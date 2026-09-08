from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils


class TestThreadsV2Endpoints(CommonTestSetup):
    def setup_method(self):
        self.report = make_recipe("reporting.tests.utils.report")
        self.report_version = make_recipe("reporting.tests.utils.report_version", report=self.report)
        self.endpoint_under_test = f"/api/reporting/v2/report-version/{self.report_version.id}/threads"
        return super().setup_method()

    def test_get_returns_correct_data_when_empty(self):
        response = TestUtils.mock_get_with_auth_role(self, "cas_director", self.endpoint_under_test)
        assert response.status_code == 200
        assert response.json() == {'payload': {'threads': []}}

    def test_get_returns_correct_data_with_data(self):
        thread = make_recipe(
            "reporting.tests.utils.comment_thread", report=self.report, report_version=self.report_version
        )
        comment = make_recipe(
            "reporting.tests.utils.comment", comment_thread=thread, report_version=self.report_version
        )
        response = TestUtils.mock_get_with_auth_role(self, "cas_director", self.endpoint_under_test)
        print("comment response: ", response.json())
        assert response.status_code == 200

        threads = response.json()['payload']['threads']
        assert len(threads) == 1

        response_thread = threads[0]
        assert response_thread['id'] == thread.id
        assert response_thread['report'] == self.report.id
        assert response_thread['report_version'] == self.report_version.id
        assert response_thread['author'] == thread.created_by.get_full_name()  # is blank in the test setup. TODO: fix

        response_comments = response_thread['comments']
        assert len(response_comments) == 1
        assert response_comments[0]['id'] == comment.id
        assert response_comments[0]['comment_thread'] == thread.id
        assert response_comments[0]['comment'] == comment.comment
        assert response_comments[0]['author'] == comment.created_by.get_full_name()
        assert response_comments[0]['report_version'] == self.report_version.id

    response_obj = {
        'payload': {
            'threads': [
                {
                    'comments': [
                        {
                            'author': 'Default Test User',
                            'id': 1,
                            'created_by': '62ed868f-2155-4906-b26f-493d1a6e68dd',
                            'created_at': '2026-09-08T22:47:37.603Z',
                            'updated_by': None,
                            'updated_at': None,
                            'archived_by': None,
                            'archived_at': None,
                            'comment_thread': 1,
                            'report_version': 2,
                            'comment': 'IKqrIUeoHxrFoyUcAJGwhPSVAbPLHqridrrkcuUKiBqZJhAcspYTznyEniMfKGbOEincQTfruOdxVqAqVfukXizVmewbDZSRynfJAgTqCXeqsYsEbJePOMqHpkGKJbGafpptDoNHvYtFqMZaOQEsZkprgYNZpxiFbBbAFFYTyJkoVPuzXbsVkEWLBdrWizdfpiZzaUuMXsoBSSpfSDlDXisBEAmdYtyDzqvdBdlnTqRfpJDzaMQcqNoNdoOQMELqdJyOZtYPXMKCZnWZExkECkEGjoPuKIKNfTVouxbqPxMw',
                        }
                    ],
                    'facility_name': 'Facility 01',
                    'id': 1,
                    'created_by': '62ed868f-2155-4906-b26f-493d1a6e68dd',
                    'created_at': '2026-09-08T22:47:37.603Z',
                    'updated_by': None,
                    'updated_at': None,
                    'archived_by': None,
                    'archived_at': None,
                    'report': 2,
                    'report_version': 2,
                    'facility': 'b87adf6e-5cfa-4041-aca8-e3de294c3696',
                }
            ]
        }
    }
