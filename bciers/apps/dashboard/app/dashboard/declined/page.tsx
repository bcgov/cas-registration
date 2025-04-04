import { AlertIcon } from "@bciers/components/icons";

export default function Page() {
  return (
    <section
      className="text-center my-20 text-2xl flex flex-col gap-3"
      data-testid="dashboard-pending-message"
    >
      <span>
        <AlertIcon />
      </span>
      <div style={{ fontSize: "16px" }}>
        <p>Your access request was declined.</p>
        <p>
          If you believe this is an error and you should be granted access,
          please contact an administrator.
        </p>
      </div>
    </section>
  );
}
