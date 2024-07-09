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
      {steps.map((title, index) => {
        const isLastStep = index === steps.length - 1;
        const isActiveStep = index === step;
        const bgColor = isActiveStep ? "bg-bc-yellow" : "bg-bc-bg-blue";
        const fontColor = isActiveStep ? "bg-bc-bg-blue" : "white";

        return (
          <div
            className={`mb-4 flex flex-row items-center ${
              isLastStep ? "grow-0" : "grow"
            }`}
            key={steps[index]}
          >
            <div
              key={title}
              className={`leading-12 text-center rounded-full min-w-[3rem] min-h-[3rem] w-12 h-12 text-${fontColor} font-bold ${bgColor}`}
            >
              {index + 1}
            </div>
            <div
              className={`ml-4 h-min ${titleWidth}`}
              data-testid="multistep-header-title"
            >
              {steps[index]}
            </div>

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
