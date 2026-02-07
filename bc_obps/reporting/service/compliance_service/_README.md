# Before:

Pulp and paper: chemical pulp is the unique product to include in the industrial process emissions.

- Math:
  - A = all industrial emissions allocated to "Pulp and paper: chemical pulp"
  - B = **all** biogenic emissions in the report, that are also industrial process emissions (overlapping)
  - Real industrial process emissions = A - B

This works because "Pulp and paper: chemical pulp" is the only product generating industrial process emissions for the Chemical Pulp industry.

Tightening rate and reduction factor to compute emissions limit is the one of the P&P industry.

# After:

There are 2 products that can include industrial process: ("Pulp and paper: chemical pulp", "Pulp and paper: lime recovery kiln")

- Math for each product:
  - A = all industrial emissions allocated to "<product>"
  - B = **all** biogenic emissions that are also industrial process emissions (overlapping)
  - C = B \* percentage of biogenic attributable to "<product>" on the Activity page
  - Real industrial process emissions = A - C

Tightening rate and reduction factor are pulled from the exception table, defaulting to P&P industry
