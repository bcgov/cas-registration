"use client";
import {
  Container,
  Card,
  CardContent,
  Typography,
  FormGroup,
} from "@mui/material";
import { Formik, Field, FieldProps } from "formik";
import * as Yup from "yup";
import { InputField, InputProps } from "@/app/components/form/fields/Input";
// Dynamically load FormStepper on the client side using the ssr option to disable server-rendering.
// 💣 Prevents: Warning: Prop `className` did not match. Server: "MuiStepConnector-root MuiStepConnector-horizontal mui-j5w0w9-MuiStepConnector-root" Client: "MuiStepConnector-root MuiStepConnector-horizontal MuiStepConnector-alternativeLabel Mui-disabled mui-zpcwqm-MuiStepConnector-root"
import dynamic from "next/dynamic";
const FormStepper = dynamic(() => import("../../../components/form/Stepper"), {
  ssr: false,
});

export interface IFormInitialValues {
  name: string;
  email: string;
  password: string;
}

const inputs = [
  {
    name: "name",
    label: "Your Name:",
    placeholder: "Name",
  },
  {
    name: "email",
    type: "email",
    label: "Your Email:",
    placeholder: "E-mail",
  },
  {
    name: "password",
    type: "pasword",
    label: "Your password:",
    placeholder: "Password",
  },
];

// Yup schema to validate the form
const validationSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  email: Yup.string().email().required("Required"),
  password: Yup.string().required("Required").min(3, "Too Short!"),
});

export default function Page() {
  const groupInputs = (inputArray: any[], groupSize: number) => {
    const groupedInputs: any[] = [];

    for (let i = 0; i < inputArray.length; i += groupSize) {
      groupedInputs.push(inputArray.slice(i, i + groupSize));
    }

    return groupedInputs;
  };
  return (
    <>
      <Container sx={{ bgcolor: "#87c1ff4d", paddingY: 3, marginTop: 5 }}>
        <Typography variant="h3" align="center" component="h2">
          Formik Multistep Form
        </Typography>
        <Card sx={{ marginTop: 2 }}>
          <CardContent sx={{ paddingY: 10, paddingX: 5 }}>
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={(values, actions) => {
                // Handle form submission

                console.log(values);
              }}
            >
              <FormStepper>
                {groupInputs(inputs, 2).map((group, groupIndex) => (
                  <FormGroup key={groupIndex} sx={{ width: "30%" }}>
                    {group.map(
                      (
                        input: {
                          name: string;
                          type: string | undefined;
                          label: string;
                          placeholder: string | undefined;
                        },
                        inputIndex: any
                      ) => (
                        <Field key={inputIndex}>
                          {({ form }: FieldProps<string[]>) => (
                            <InputField
                              name={input.name}
                              type={input.type}
                              labelText={input.label}
                              placeholder={input.placeholder}
                              value={form.values[input.name]}
                              isError={!!form.errors[input.name]}
                              errorText={form.errors[input.name]?.toString()}
                              onChange={(e) =>
                                form.setFieldValue(input.name, e.target.value)
                              }
                            />
                          )}
                        </Field>
                      )
                    )}
                  </FormGroup>
                ))}
              </FormStepper>
            </Formik>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
