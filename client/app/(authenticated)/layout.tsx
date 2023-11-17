import Bread from "@/app/components/navigation/Bread";
import Footer from "@/app/components/layout/Footer";
import Header from "@/app/components/layout/Header";
import Main from "@/app/components/layout/Main";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <Bread
        separator={<span aria-hidden="true"> &gt; </span>}
        capitalizeLinks
      />
      <Main>{children}</Main>
      <Footer />
    </>
  );
}
