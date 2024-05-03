import Container from "@mui/material/Container/Container";
import Skeleton from "@mui/material/Skeleton";

export default function SkeletonField() {
  // Simulate loading by rendering Skeleton components
  return (
    <>
      <Container sx={{ width: 300 }}>
        <Skeleton animation="wave" />
      </Container>
    </>
  );
}
