import fetchRegistryPageData from "./fetchRegistryPageData";

interface UnitRow extends Record<string, unknown> {
  quantity: number;
  status: string;
}

interface SummaryCard {
  label: string;
  value: number;
}

const numberFormatter = new Intl.NumberFormat("en-CA");

export default async function Cards() {
  const [accounts, projects, units] = await Promise.all([
    fetchRegistryPageData("accounts", {
      sort_field: "name",
      sort_order: "asc",
    }),
    fetchRegistryPageData("projects", {
      sort_field: "name",
      sort_order: "asc",
    }),
    fetchRegistryPageData<UnitRow>("units", { paginate_result: false }),
  ]);

  const totals = units.rows.reduce(
    (result, unit) => {
      const quantity = Number(unit.quantity) || 0;
      if (unit.status === "Issued") result.issued += quantity;
      if (unit.status === "Active") result.active += quantity;
      if (unit.status === "Retired") result.retired += quantity;
      return result;
    },
    { issued: 0, active: 0, retired: 0 },
  );

  const cards: SummaryCard[] = [
    { label: "Accounts", value: accounts.row_count },
    { label: "Projects", value: projects.row_count },
    { label: "Issued units", value: totals.issued },
    { label: "Active units", value: totals.active },
    { label: "Retired units", value: totals.retired },
  ];

  return (
    <section
      aria-label="Registry totals"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8"
    >
      {cards.map(({ label, value }) => (
        <article
          className="min-h-[204px] rounded-2xl border border-solid border-gray-300 bg-white px-5 py-7 sm:px-8"
          key={label}
        >
          <h3 className="text-xl font-medium text-gray-600 sm:text-l">
            {label}
          </h3>
          <p className="mt-2 text-3xl font-bold text-[#003366] sm:text-2xl">
            {numberFormatter.format(value)}
          </p>
        </article>
      ))}
    </section>
  );
}
