"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="sectionAlt">
      <div className="container contentPanel">
        <h1>Unable to display this page</h1>
        <p>The page could not be rendered. Please try again.</p>
        <button className="button buttonAccent" onClick={reset} type="button">Try again</button>
      </div>
    </section>
  );
}
