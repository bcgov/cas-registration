import { TitleFieldProps } from "@rjsf/utils";

function GroupTitleFieldTemplate(props: TitleFieldProps) {
  const { id, title } = props;

  return (
    <header id={id} className="text-bc-bg-blue my-4 text-lg">
      {title}
    </header>
  );
}

export default GroupTitleFieldTemplate;
