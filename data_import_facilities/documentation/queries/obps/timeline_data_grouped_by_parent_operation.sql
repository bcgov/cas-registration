select operation_id, count(*)
from erc.facility_designated_operation_timeline ft
join erc.operation o
on ft.operation_id = o.id
group by operation_id
order by o.swrs_facility_id;
