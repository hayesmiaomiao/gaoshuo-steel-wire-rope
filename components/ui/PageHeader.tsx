import styles from "./PageElements.module.css";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      <div className="container">
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h1>{title}</h1>
        <p className={styles.lead}>{description}</p>
        {children}
      </div>
    </header>
  );
}
