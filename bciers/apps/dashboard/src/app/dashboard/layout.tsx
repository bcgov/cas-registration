import { Bread } from '@bciers/components';
import { Main } from '@bciers/components/server';
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
