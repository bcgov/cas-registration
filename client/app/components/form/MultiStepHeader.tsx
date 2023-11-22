interface MultiStepHeaderProps {
  step: number;
  steps: string[];
}

const MultiStepHeader = ({ step, steps }: MultiStepHeaderProps) => {
  return (
    <div className="block md:flex flex-row mt-10 mb-6 justify-between w-full">
      {steps.map((s, i) => {
        const isLastStep = i === steps.length - 1;
        const bgColor =
          i === step
            ? "bg-bc-gov-yellow"
            : "bg-bc-gov-primary-brand-color-blue";

        return (
          <div
            className={`mb-4 flex flex-row items-center ${
              isLastStep ? "grow-0" : "grow"
            }`}
            key={steps[i]}
          >
            <div
              key={s}
              className={`leading-12 text-center rounded-full w-12 h-12 text-white font-bold ${bgColor}`}
            >
              {i + 1}
            </div>
            <div className={`ml-4 h-min `}>{steps[i]}</div>
            {!isLastStep && (
              <div className="hidden lg:block mx-4 grow">
                <hr className="border-black" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MultiStepHeader;
