import { Sample } from '@bciers/components';
import { Grid } from '@mui/material';
import Main from 'registration/components/layout/Main';

export default function Index() {
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
        Here is a sample shared component, to prove the work!
        <Sample />
      </Grid>
    </Main>
  );
}
