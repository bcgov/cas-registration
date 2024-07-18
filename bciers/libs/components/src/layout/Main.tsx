type MainProps = {
  children: React.ReactNode;
};

const Main = ({ children }: MainProps) => {
  return (
    <main className="w-full flex flex-col flex-grow max-w-page mx-auto padding-page">
      {children}
    </main>
  );
};

export default Main;
