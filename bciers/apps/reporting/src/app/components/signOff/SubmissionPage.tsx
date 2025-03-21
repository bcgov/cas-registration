import Check from "@bciers/components/icons/Check";
import Link from "next/link";
import { getTodaysDateWithTime } from "@reporting/src/app/utils/formatDate";
import formatTimestamp from "@bciers/utils/src/formatTimestamp";

const SubmissionPage = () => {
  const currentDate = formatTimestamp(getTodaysDateWithTime());

  return (
    <div className="flex items-center justify-center">
      <section className="flex flex-col items-center justify-center max-w-[600px] mx-auto h-[20vh] mt-40">
        {" "}
        {/* Adjusted height and added margin-top */}
        <div className="flex flex-col items-center justify-center">
          {Check}
          <div className="flex flex-col items-center justify-center mt-5">
            <h3 className="mb-2 mt-4">Successful Submission</h3>
            <p className="m-0">You successfully submitted your report.</p>
            <p className="m-0">Submission time: {currentDate}</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center mt-20">
          <Link className="link-button-outlined" href="/reports">
            Return to Report Table
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SubmissionPage;
