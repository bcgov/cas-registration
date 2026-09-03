// Higher-order component to wrap a report page with comment functionality

import CommentsDrawer from "../comments/CommentsDrawer";

export default function withReportComments<
  TPageProps extends { version_id: number },
>(WrappedPage: React.FC<TPageProps>) {
  const WrappedComponent: React.FC<TPageProps> = (props) => {
    return (
      <>
        <WrappedPage {...props} />
        <CommentsDrawer version_id={props.version_id} />
      </>
    );
  };

  return WrappedComponent;
}
