import { actionHandler } from "@bciers/actions";
import { WidgetProps } from "@rjsf/utils";

const useFileUploadWidget = (
  endpoint: string,
  method: "PUT" | "PATCH" | "POST",
  pathToRevalidate?: string,
): [typeof formContext, typeof submitWithFiles] => {
  const files: Record<string, File> = {};

  const formContext = {
    onFileSelected: (file: File, propName: string) => {
      files[propName] = file;
    },
  };

  // Proxy for the actionHandler, using a multipart/form-data encoding instead
  const submitWithFiles = async (formData: any) => {
    const formDataWithFiles = new FormData();

    formDataWithFiles.append("details", JSON.stringify(formData));

    for (const [propName, file] of Object.entries(files)) {
      formDataWithFiles.append(propName, file);
    }

    return await actionHandler(endpoint, method, pathToRevalidate, {
      body: formDataWithFiles,
    });
  };

  return [formContext, submitWithFiles];
};

const NewFileWidget: React.FC<WidgetProps> = (props) => {
  const { onChange, name, registry } = props;

  if (!registry.formContext?.onFileSelected) {
    throw new Error(
      "NewFileWidget is being used without the useFileUploadWidget context. File uploads will not work.",
    );
  }

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
      new file widget: <input type="file" onChange={handleChange} />
    </>
  );
};

export { NewFileWidget as default, useFileUploadWidget };
