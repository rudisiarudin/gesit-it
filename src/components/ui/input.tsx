export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
    />
  )
}
