"use client";

interface MultiStepHeaderProps {
  step: number;
  steps: string[];
}

const MultiStepHeader = ({ step, steps }: MultiStepHeaderProps) => {
  return (
    <div className="flex flex-row my-10 justify-between w-full">
      {steps.map((s, i) => {
        const isLastStep = i === steps.length - 1;
        const bgColor =
          i === step
            ? "bg-bc-gov-yellow"
            : "bg-bc-gov-primary-brand-color-blue";

        return (
          <div
            className={`flex flex-row items-center ${
              isLastStep ? "grow-0" : "grow"
            }`}
            key={step}
          >
            <div
              key={s}
              className={`leading-12 text-center rounded-full w-12 h-12 text-white font-bold ${bgColor}`}
            >
              {i + 1}
            </div>
            <div className="ml-4 h-min">{steps[i]}</div>
            {!isLastStep && (
              <div className="mx-4 grow">
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
