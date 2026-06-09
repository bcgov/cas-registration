import { WidgetProps } from "@rjsf/utils";


const useFileUpload = (endpoint: string, method: "PUT" | "PATCH" |"POST", pathToRevalidate?: string) => {

  const files: Record<string, File> = {};

  const formContext = { onFileSelected: (file: File, propName: string) => {
    files[propName] = file;
  } };

  // Proxy for the actionHandler, using a multipart/form-data encoding instead
  const submitWithFiles = (formData: object) => {

  }

};

const NewFileWidget: React.FC<WidgetProps> = (props) => {
  const { onChange, name, registry } = props;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      registry.formContext.onFileSelected(file, name);
    }
    // From the RJSF perspective this will just be a string with the file name.
    onChange(file?.name);
  };

  return (
    <>
      test
      <input type="file" onChange={handleChange} />
    </>
  );
};

export default NewFileWidget;
