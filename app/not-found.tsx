import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="sectionAlt">
      <div className="container contentPanel">
        <p>404</p>
        <h1>Page not found</h1>
        <p>The requested page is not part of the current Gaoshuo Steel Wire Rope website.</p>
        <Link className="button buttonAccent" href="/">Return to homepage</Link>
      </div>
    </section>
  );
}
