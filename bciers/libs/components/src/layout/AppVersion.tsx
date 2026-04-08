const AppVersion: React.FC = () => {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;
  if (!version) return null;

  return (
    <span className="text-white text-sm opacity-75" aria-label="App version">
      v{version}
    </span>
  );
};

export default AppVersion;
