interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="mt-6 px-4">
      <div className="rounded-md border border-[#ff818266] bg-[#ffebe9] px-4 py-3 text-sm text-[#1f2328]">
        {message}
      </div>
    </div>
  );
}
