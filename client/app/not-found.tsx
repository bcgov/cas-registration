import Container from "@mui/material/Container/Container";
import Link from "@mui/material/Link/Link";
import List from "@mui/material/List/List";
import ListItem from "@mui/material/ListItem/ListItem";
import Typography from "@mui/material/Typography/Typography";
import Footer from "@/app/components/layout/Footer";
import Header from "@/app/components/layout/Header";

export default function NotFound() {
  return (
    <>
      <Header />{" "}
      <Container
        sx={{
          marginTop: 20,
        }}
      >
        <Typography variant="h5" gutterBottom>
          The page you’re looking for is unavailable.
        </Typography>
        <Typography variant="body1" paragraph>
          Suggestions to help you find what you’re looking for:
        </Typography>
        <List>
          <ListItem>
            <Typography component="span">
              Check that the page URL has been entered correctly
            </Typography>
          </ListItem>
          <ListItem>
            <Typography component="span">
              Check that you have access to this page
            </Typography>
          </ListItem>
          <ListItem>
            <Typography component="span">
              Go to the{" "}
              <Link href="/home" color="primary">
                Home Page
              </Link>
            </Typography>
          </ListItem>
        </List>
      </Container>
      <Footer />
    </>
  );
}
