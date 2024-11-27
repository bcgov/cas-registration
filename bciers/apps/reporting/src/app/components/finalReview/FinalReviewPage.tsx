import { HasReportVersion } from "../../utils/defaultPageFactoryTypes";

const FinalReviewPage: React.FC<HasReportVersion> = ({ version_id }) => {
  return <>Final Review Version ID: {version_id}</>;
};

export default FinalReviewPage;
