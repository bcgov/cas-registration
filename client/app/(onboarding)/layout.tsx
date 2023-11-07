import Footer from "@/app/components/layout/Footer";
import Header from "@/app/components/layout/Header";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
