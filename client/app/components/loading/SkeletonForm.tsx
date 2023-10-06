import { Container, Paper, Grid, Button, Skeleton } from "@mui/material";

export default function LoadingForm() {
  // Simulate loading by rendering Skeleton components
  const renderLoadingFields = () => {
    const fields = [];
    for (let i = 0; i < 5; i++) {
      fields.push(
        <Grid item xs={12} key={i}>
          <Skeleton variant="text" height={48} />
        </Grid>,
      );
    }
    return fields;
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} style={{ padding: 16 }}>
        <form>
          {renderLoadingFields()}
          <Button variant="contained" color="primary" fullWidth disabled>
            Loading...
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
