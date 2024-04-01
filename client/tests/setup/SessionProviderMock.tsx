// Needed to put this in a tsx file and import it in mocks.ts

const SessionProviderMock = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export default SessionProviderMock;
