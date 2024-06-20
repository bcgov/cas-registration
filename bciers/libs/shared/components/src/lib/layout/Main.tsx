type MainProps = {
  children: React.ReactNode;
};

const Main = ({ children }: MainProps) => {
  return (
    <main className="w-full max-w-[1536px] min-h-full mx-auto px-4 sm:px-6 pb-48 sm:pb-20">
      {children}
    </main>
  );
};

export default Main;
