import styles from './error.module.css';

/* eslint-disable-next-line */
export interface ErrorProps {}

export function Error(props: ErrorProps) {
  return (
    <div className={styles['container']}>
      <h1>Sample shared error message</h1>
    </div>
  );
}

export default Error;
