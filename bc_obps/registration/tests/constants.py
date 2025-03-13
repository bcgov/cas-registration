from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.files.base import ContentFile

OPERATOR_FIXTURE = ("mock/operator.json",)
USER_FIXTURE = ("mock/user.json",)
ADDRESS_FIXTURE = ("mock/address.json",)
OPERATION_FIXTURE = ("mock/operation.json",)
CONTACT_FIXTURE = ("mock/contact.json",)
DOCUMENT_FIXTURE = ("mock/document.json",)
BC_OBPS_REGULATED_OPERATION_FIXTURE = ("mock/bc_obps_regulated_operation.json",)
BC_GREENHOUSE_GAS_ID_FIXTURE = ("mock/bc_greenhouse_gas_id.json",)
FACILITY_FIXTURE = ("mock/facility.json",)
RESTART_EVENT_FIXTURE = ("mock/restart_event.json",)
TEMPORARY_SHUTDOWN_EVENT_FIXTURE = ("mock/temporary_shutdown_event.json",)
CLOSURE_EVENT_FIXTURE = ("mock/closure_event.json",)
TRANSFER_EVENT_FIXTURE = ("mock/transfer_event.json",)

MOCK_FILE = (ContentFile(bytes("testtesttesttest", encoding='utf-8'), "testfile.pdf"),)

MOCK_UPLOADED_FILE = SimpleUploadedFile("test1.txt", b"Hello, world!", content_type="text/plain")

MOCK_UPLOADED_FILE_2 = SimpleUploadedFile("test2.txt", b"Hello, world!", content_type="text/plain")

TIMESTAMP_COMMON_FIELDS = [
    ("created_at", "created at", None, None),
    ("created_by", "created by", None, None),
    ("updated_at", "updated at", None, None),
    ("updated_by", "updated by", None, None),
    ("archived_at", "archived at", None, None),
    ("archived_by", "archived by", None, None),
]
