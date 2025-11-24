const patients = [
  { name: 'Sarah Collins', condition: 'Hypertension', status: 'Follow up' },
  { name: 'James Wright', condition: 'Diabetes', status: 'Pending labs' },
  { name: 'Lily Adams', condition: 'Asthma', status: 'Stable' },
]

export default function Patients() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Patients</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Recent patients requiring attention.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">
                Condition
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-300">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {patients.map((patient) => (
              <tr key={patient.name}>
                <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                  {patient.name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">
                  {patient.condition}
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                    {patient.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

