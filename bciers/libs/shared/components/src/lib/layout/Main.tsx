type MainProps = {
  children: React.ReactNode;
};

const Main = ({ children }: MainProps) => {
  return (
    <main className="bg-white relative left-1/2 transform -translate-x-1/2 w-screen max-w-none grow">
      <div className="w-full max-w-page mx-auto padding-page">{children}</div>
    </main>
  );
};

export default Main;
