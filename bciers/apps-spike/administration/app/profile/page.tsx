import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import Header from "@/administration/app/components/profile/ProfileHeader";
import Page from "@/administration/app/components/profile/ProfilePage";

export default defaultPageFactory(Page, {
  header: Header,
});
