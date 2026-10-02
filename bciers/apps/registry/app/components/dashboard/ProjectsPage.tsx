import SchemaDataGrid from "./SchemaDataGrid";
import fetchRegistryPageData from "./fetchRegistryPageData";
import type { DashboardSearchParams } from "./types";
import { projectSchema } from "@/registry/data/jsonSchema/project";

interface ProjectRow extends Record<string, unknown> {
  id: number;
}

async function getProjects(searchParams: DashboardSearchParams) {
  return fetchRegistryPageData<ProjectRow>("projects", {
    ...searchParams,
    name: searchParams.project_name,
    sort_field: searchParams.sort_field ?? "name",
    sort_order: searchParams.sort_order ?? "asc",
  });
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams;
}) {
  const initialData = await getProjects(searchParams);

  return (
    <div className="space-y-4 py-4">
      <h3 className="text-xl font-semibold">Projects</h3>
      <SchemaDataGrid
        schema={projectSchema}
        initialData={initialData}
        resource="projects"
      />
    </div>
  );
}