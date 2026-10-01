export function FeaturePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section>
      <p className="eyebrow">Workspace foundation</p>
      <h1>{title}</h1>
      <p className="intro">{description}</p>
      <div className="empty">
        <h2>Ready for the next step</h2>
        <p>
          This feature has a home in the application. Its editing workflow has
          not been implemented yet.
        </p>
      </div>
    </section>
  );
}
