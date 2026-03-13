import unittest
from common.tests.squash_integrity_base import SquashIntegrityTestBase


@unittest.skip("Remove this line to run the test")
class TestRegistrationSquashIntegrity(SquashIntegrityTestBase):
    __test__ = True
    SNAPSHOT_APPS = ["registration"]
    SNAPSHOT_PATH = "registration/fixtures/snapshots/db_snapshot.json"
    # User is not seeded by migrations; the test conftest creates one automatically
    KNOWN_EXCLUSION_KEYS = {"registration.User"}
