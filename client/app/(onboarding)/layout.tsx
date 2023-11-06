import Footer from "@/app/components/layout/Footer";
import Header from "@/app/components/layout/Header";
import Main from "@/app/components/layout/Main";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <Main>{children}</Main>
      <Footer />
    </>
  );
}
