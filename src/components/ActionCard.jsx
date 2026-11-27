export default function ActionCard({ variant, Icon, title, badge, children, onClick }) {
  return (
    <button className={`px-card-action px-card-${variant}`} onClick={onClick}>
      <h2>
        <Icon size={17} />
        {title}
        {badge && <span className="px-badge-new">{badge}</span>}
      </h2>
      <p>{children}</p>
    </button>
  );
}
