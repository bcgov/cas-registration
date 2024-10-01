import React, {
  createContext,
  ReactElement,
  useContext,
  useState,
} from "react";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import {
  operationReviewSchema,
  operationReviewUiSchema,
} from "@reporting/src/data/jsonSchema/operations";
import { RJSFSchema } from "@rjsf/utils";

const taskListElements: TaskListElement[] = [
  {
    type: "Section",
    title: "Operation information",
    isExpanded: true,
    elements: [
      { type: "Page", title: "Review Operation information", isChecked: true },
      { type: "Page", title: "Person responsible", isActive: true },
      { type: "Page", title: "Review facilities" },
    ],
  },
];

export const FormContext = createContext<{
  taskList: TaskListElement[];
  setTaskList: (taskList: TaskListElement[]) => void;
  formData: any;
  setFormData: (formData: FormData) => void;
  formSchema: RJSFSchema;
  setFormSchema: (formData: RJSFSchema) => void;
  formUiSchema: RJSFSchema;
  setFormUiSchema: (formUiSchema: RJSFSchema) => void;
  formSubmitHandler: () => void;
  setFormSubmitHandler: (formSubmitHandler: () => void) => void;
}>({
  taskList: taskListElements,
  formData: {},
  formSchema: {},
  formUiSchema: {},
  formSubmitHandler(): void {},
  setFormSubmitHandler(formSubmitHandler: () => void): void {},
  setFormData(formData: FormData): void {},
  setFormSchema(formData: RJSFSchema): void {},
  setFormUiSchema(formUiSchema: RJSFSchema): void {},
  setTaskList(taskList: TaskListElement[]): void {},
});

export const FormContextProvider: React.FC<{ children: ReactElement }> = ({
  children,
}) => {
  const [taskList, setTaskList] = useState<TaskListElement[]>(taskListElements);
  const [formSchema, setFormSchema] = useState<RJSFSchema>({});
  const [formUiSchema, setFormUiSchema] = useState<RJSFSchema>({});
  const [formData, setFormData] = useState<any>({});
  const [formSubmitHandler, setFormSubmitHandler] = useState<() => void>(
    () => () => {},
  );

  return (
    <FormContext.Provider
      value={{
        taskList,
        setTaskList,
        formData,
        setFormData,
        formSchema,
        setFormSchema,
        formUiSchema,
        setFormUiSchema,
        formSubmitHandler,
        setFormSubmitHandler,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => useContext(FormContext);
