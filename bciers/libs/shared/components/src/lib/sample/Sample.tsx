import styles from "./Sample.module.css";

/* eslint-disable-next-line */
export interface SampleProps {
  exampleProp: string;
}

export function Sample(props: SampleProps) {
  return (
    <div className={styles.container}>
      <h1>Welcome to Sample!</h1>
      {props.exampleProp}
    </div>
  );
}

export default Sample;
