import styles from './Error.module.css';

/* eslint-disable-next-line */
export interface ErrorProps {}

export function Error(props: ErrorProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Error!</h1>
    </div>
  );
}

export default Error;
