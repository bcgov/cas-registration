import unittest
from common.tests.squash_integrity_base import SquashIntegrityTestBase


@unittest.skip("Remove this line to run the test")
class TestComplianceSquashIntegrity(SquashIntegrityTestBase):
    __test__ = True
    SNAPSHOT_APPS = ["compliance"]
    SNAPSHOT_PATH = "compliance/fixtures/snapshots/db_snapshot.json"
