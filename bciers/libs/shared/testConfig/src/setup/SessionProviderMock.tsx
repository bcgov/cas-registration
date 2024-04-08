// Needed to put this in a tsx file since .ts files are not allowed to have jsx

const SessionProviderMock = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export default SessionProviderMock;
