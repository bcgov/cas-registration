const GenerateNewEntrantFormMessageDefault = (applicationUrl: string) => {
  return (
    <div className="max-w-[900px]">
      <p>
        Please download and complete the following application form template to
        receive designation as a New Entrant in the B.C. OBPS.
      </p>
      <p>
        Download{" "}
        <a href={applicationUrl} target="_blank" rel="noopener noreferrer">
          application form template
        </a>
      </p>
      <p>Please upload the completed form below.</p>
    </div>
  );
};

export { GenerateNewEntrantFormMessageDefault };
