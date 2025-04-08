select o.swrs_facility_id, count(*)
from erc.facility f
join erc.operation o
on f.operation_id = o.id
group by o.swrs_facility_id
order by o.swrs_facility_id;
