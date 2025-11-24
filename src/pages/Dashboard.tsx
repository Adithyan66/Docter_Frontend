const stats = [
  { label: 'Active Patients', value: '32' },
  { label: 'Consultations Today', value: '14' },
  { label: 'Pending Reports', value: '6' },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Overview of today’s workload.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="text-3xl font-semibold text-slate-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

