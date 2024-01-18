import { Primary, Secondary } from './Button.css';

export type ButtonProps = {
  children: React.ReactNode;
  isPrimary?: boolean;
};

export function Button({ children, ...props }: ButtonProps) {
  const className = props.isPrimary ? Primary : Secondary;

  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}
