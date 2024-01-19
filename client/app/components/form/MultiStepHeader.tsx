interface MultiStepHeaderProps {
  step: number;
  steps: string[];
}

const MultiStepHeader = ({ step, steps }: MultiStepHeaderProps) => {
  // Reduce the width of the title if there are more than 2 steps
  // so it will break onto a new line
  const titleWidth = steps.length > 2 ? "lg:w-36" : "";
  return (
    <div className="block md:flex flex-row mt-10 mb-6 justify-between w-full">
      {steps.map((s, i) => {
        const isLastStep = i === steps.length - 1;
        const bgColor = i === step ? "bg-bc-yellow" : "bg-bc-primary-blue";

        return (
          <div
            className={`mb-4 flex flex-row items-center ${
              isLastStep ? "grow-0" : "grow"
            }`}
            key={steps[i]}
          >
            <div
              key={s}
              className={`leading-12 text-center rounded-full min-w-[3rem] min-h-[3rem] w-12 h-12 text-white font-bold ${bgColor}`}
            >
              {i + 1}
            </div>
            <div className={`ml-4 h-min w-full ${titleWidth}`}>{steps[i]}</div>

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
