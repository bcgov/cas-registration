import Bread from "@/app/components/navigation/Bread";
import Footer from "@/app/components/layout/Footer";
import Header from "@/app/components/layout/Header";

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
      {children}
      <Footer />
    </>
  );
}
