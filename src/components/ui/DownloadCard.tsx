export function DownloadCard({ datasheet }: { datasheet: string }) {
  if (!datasheet) {
    return (
      <div className="border border-[#D8D8D4] bg-[#F5F5F3] p-5">
        <h2 className="text-xl font-bold">Datasheet Download</h2>
        <p className="mt-2 text-sm text-[#555]">Datasheet is not available yet. Contact our team to confirm technical documentation.</p>
      </div>
    );
  }

  return (
    <a className="block border border-[#D8D8D4] bg-[#F5F5F3] p-5 font-bold hover:border-[#E8820C]" href={datasheet}>
      Download Datasheet
    </a>
  );
}
