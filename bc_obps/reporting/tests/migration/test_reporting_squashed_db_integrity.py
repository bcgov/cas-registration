import unittest
from common.tests.squash_integrity_base import SquashIntegrityTestBase


@unittest.skip("Remove this line to run the test")
class TestReportingSquashIntegrity(SquashIntegrityTestBase):
    __test__ = True
    SNAPSHOT_APPS = ["reporting"]
    SNAPSHOT_PATH = "reporting/fixtures/snapshots/db_snapshot.json"
