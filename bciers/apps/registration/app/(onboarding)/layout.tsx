import Main from "@/app/components/layout/Main";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Main
      sx={{
        margin: {
          xs: "140px auto 180px auto",
          md: "80px auto 80px auto",
        },
      }}
    >
      {children}
    </Main>
  );
}
