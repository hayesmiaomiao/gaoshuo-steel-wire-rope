export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="border border-dashed border-[#D8D8D4] bg-[#F5F5F3] p-8">
      <h2 className="text-xl font-bold text-[#171717]">{title}</h2>
      <p className="mt-2 text-[#4a4a46]">{message}</p>
    </div>
  );
}
