import pytest
from model_bakery import baker

from registry.models import Account, Issuance, Unit
from service.data_access_service.account_service import AccountDataAccessService

pytestmark = pytest.mark.django_db


def test_account_getters_include_unit_quantities():
    account = baker.make(Account)
    account_without_units = baker.make(Account)
    issuance = baker.make(Issuance, account=account)
    baker.make(Unit, issuance=issuance, status=Unit.Status.ISSUED, quantity=7)
    baker.make(Unit, issuance=issuance, status=Unit.Status.ACTIVE, quantity=4)
    baker.make(Unit, issuance=issuance, status=Unit.Status.RETIRED, quantity=3)
    baker.make(Unit, issuance=issuance, status=Unit.Status.CANCELLED, quantity=2)

    account_with_totals = AccountDataAccessService.get_by_id(account.id)
    assert account_with_totals.issued_quantity == 7
    assert account_with_totals.active_quantity == 4
    assert account_with_totals.retired_quantity == 3

    all_accounts = {item.id: item for item in AccountDataAccessService.get_all_accounts()}
    assert all_accounts[account.id].issued_quantity == 7
    assert all_accounts[account.id].active_quantity == 4
    assert all_accounts[account.id].retired_quantity == 3
    assert all_accounts[account_without_units.id].issued_quantity == 0
    assert all_accounts[account_without_units.id].active_quantity == 0
    assert all_accounts[account_without_units.id].retired_quantity == 0