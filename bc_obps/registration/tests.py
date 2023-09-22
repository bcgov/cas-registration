from django.test import TestCase

from .models import User


class UserModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Set up non-modified objects used by all test methods
        User.objects.create(
            user_guid="00000000-0000-0000-0000-000000000000",
            first_name="fname-test",
            last_name="lname-test",
            mailing_address="12 34 Street, Test",
            email="test@example.com",
            phone_number="12345678900",
            business_guid="11111111-1111-1111-1111-111111111111",
            position_title="test",
        )

    def test_first_name_label(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        field_label = testUser._meta.get_field("first_name").verbose_name
        self.assertEqual(field_label, "first name")

    def test_first_name_max_length(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        max_length = testUser._meta.get_field("first_name").max_length
        self.assertEqual(max_length, 1000)

    def test_last_name_label(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        field_label = testUser._meta.get_field("last_name").verbose_name
        self.assertEqual(field_label, "last name")

    def test_last_name_max_length(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        max_length = testUser._meta.get_field("last_name").max_length
        self.assertEqual(max_length, 1000)

    def test_mailing_address_label(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        field_label = testUser._meta.get_field("mailing_address").verbose_name
        self.assertEqual(field_label, "mailing address")

    def test_mailing_address_max_length(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        max_length = testUser._meta.get_field("mailing_address").max_length
        self.assertEqual(max_length, 1000)

    def test_email_label(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        field_label = testUser._meta.get_field("email").verbose_name
        self.assertEqual(field_label, "email")

    def test_email_max_length(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        max_length = testUser._meta.get_field("email").max_length
        self.assertEqual(max_length, 254)

    def test_phone_number_label(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        field_label = testUser._meta.get_field("phone_number").verbose_name
        self.assertEqual(field_label, "phone number")

    def test_position_title_label(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        field_label = testUser._meta.get_field("position_title").verbose_name
        self.assertEqual(field_label, "position title")
