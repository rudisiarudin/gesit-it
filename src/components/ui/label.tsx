export function Label({
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="block text-sm mb-1 font-medium" {...props}>{children}</label>
}
