function StatsCards({ stats }) {
  return (
    <section className="provider-modern-stats-grid">
      {stats.map((stat, index) => (
        <article
          key={stat.id}
          className={`provider-modern-stat-card provider-stat-${stat.id} provider-animate-in`}
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <div className="provider-modern-stat-icon">{stat.icon}</div>
          <div>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <span>{stat.helper}</span>
          </div>
        </article>
      ))}
    </section>
  );
}

export default StatsCards;
