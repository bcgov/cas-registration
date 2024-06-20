import Bread from "@/app/components/navigation/Bread";
import Main from "@/app/components/layout/Main";

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
