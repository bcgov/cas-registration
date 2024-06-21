type MainProps = {
  children: React.ReactNode;
};

const Main = ({ children }: MainProps) => {
  return (
    <main className="w-full max-w-page min-h-full mx-auto padding-page">
      {children}
    </main>
  );
};

export default Main;
