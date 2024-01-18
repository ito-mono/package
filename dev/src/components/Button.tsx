export type ButtonProps = {
  children: React.ReactNode;
};

export function Button({ children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>;
}
