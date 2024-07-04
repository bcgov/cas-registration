type MainProps = {
  children: React.ReactNode;
};

const Main = ({ children }: MainProps) => {
  return (
    <main className="w-full max-w-page mx-auto padding-page grow">
      {children}
    </main>
  );
};

export default Main;
