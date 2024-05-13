import { Bread } from '@bciers/components';
import { Main } from '@bciers/components/server';

export default function DashboardLayout({
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
