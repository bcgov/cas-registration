'use client';

import { Button, Grid } from '@mui/material';
import { signIn } from 'next-auth/react';
import Main from 'registration/components/layout/Main';

export default function Index() {
  const handleIdirLogin = () => {
    signIn('keycloak', undefined, { kc_idp_hint: 'idir' });
  };

  return (
    <Main>
      <Grid
        container
        spacing={2}
        sx={{
          marginTop: '24px',
          marginBottom: '48px',
        }}
      >
        Login:
        <Button
          variant="outlined"
          className="w-full md:max-w-[70%]"
          onClick={handleIdirLogin}
        >
          Log in with IDIR
        </Button>
      </Grid>
    </Main>
  );
}
