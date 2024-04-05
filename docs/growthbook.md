# Growthbook

Documentation on how to implement a growthbook feature flag for our NextJS application.

## Client Key

The client key for local development can be retrieved by logging into https://app.growthbook.io/ and navigating to `SDK Connections`. Use the dev key for local development.

## Using a feature flag

Feature flags are created using the growthbook UI at https://app.growthbook.io/ the credentials to log into this service can be found in the team 1Password.
In order to use a feature flag that was created in growthbook, the following code will need to be added to the file where the feature
that should be hidden behind the flag is.

### Client components

The implementation for Client components vs Server components is slightly different. This is an example for a Client component:

```typescript
import {
  GrowthBook,
  GrowthBookProvider
} from "@growthbook/growthbook-react";
import { useMemo, useEffect, useState } from "react";
import { env } from 'next-runtime-env';

const CLIENT_KEY = env('NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY')
const growthbook = new GrowthBook({
  apiHost: "https://cdn.growthbook.io",
  clientKey: CLIENT_KEY,
  enableDevMode: true,
});

export default function Page() {
  const [isClient, setIsClient] = useState(false)

  /*
    Running the fetch to the growthbook API inside a useMemo cuts down on the amount of fetches done,
    however it does mean that any on/off toggling done in the Growthbook dashboard while a user is using the app
    will not take effect the page is refreshed. We decided this fit our use case, since we're unlikely to be
    toggling things on/off outside of releases to production.
  */
  useMemo(() => {
    const fetchGrowthbook = async () => {
      try {
        const data = await fetch(
          `https://cdn.growthbook.io/api/features/${CLIENT_KEY}`
        )
          .then((res) => res.json())
          .then((res) => {
            growthbook.setFeatures(res.features);
          });
        return data;
      } catch (e) {
        console.error(e);
      }
    };
    fetchGrowthbook();
  }, []);

  /*
    Elements toggled on by growthbook trigger an error because the pre-rendered html does not match the final client html.
    Using the stateful boolean isClient in this useEffect hook ensures that the code toggled by growthbook is only rendered on the client & avoids the mismatch error.
  */
  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <GrowthBookProvider growthbook>
      <div>
        {growthbook.isOn("test-obps") && isClient && (
          <h1>This header will only show if the "test-obps" feature in growthbook is toggled "on"</h1>
        )}
        <p>
          This text block is unaffected by the growthbook feature flag
        </p>
      </div>
    </GrowthBookProvider>
  );
}
```

### Server components

Server components are a bit simpler. Here is an example for a server component:

```typescript

import { Suspense } from "react";
import { GrowthBook } from "@growthbook/growthbook";

const CLIENT_KEY = process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY;
const growthbook = new GrowthBook({
  apiHost: "https://cdn.growthbook.io",
  clientKey: CLIENT_KEY,
  enableDevMode: true,
});

const ServerComponentPage = async () => {
  // Load growthbook features
  await growthbook.loadFeatures();

  return (
    <Suspense fallback={<Loading />}>
      {growthbook.isOn('test-obps') && <h1>I am toggled by the growthbook feature flag</h1>}
      <p>I am not toggled by the growthbook feature flag</p>
    </Suspense>
  );
};

export default ServerComponentPage;

```
## Other Resources
[Growthbook NextJS Docs](https://docs.growthbook.io/guide/nextjs-and-growthbook)
[NextJS Hydration Error](https://nextjs.org/docs/messages/react-hydration-error#solution-1-using-useeffect-to-run-on-the-client-only)
