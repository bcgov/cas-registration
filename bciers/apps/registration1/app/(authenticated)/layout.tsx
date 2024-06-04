import Bread from "@bciers/components/navigation/Bread";
import Main from "@bciers/components/layout/Main";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Bread
        separator={<span aria-hidden="true"> &gt; </span>}
        capitalizeLinks
      />
      <Main>{children}</Main>
    </>
  );
}
