import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";

export default defaultPageFactory(() => (
  <div className="flex flex-col items-center justify-center py-12">
    <h2 className="text-2xl font-bold mb-4 text-bc-bg-blue">
      View Report History
    </h2>
    <p className="text-bc-text text-lg mb-2">
      This feature is <b>coming soon</b>.
    </p>
    <p className="text-bc-text text-center max-w-xl">
      You’ll be able to view the history of report versions for this report.
    </p>
  </div>
));
