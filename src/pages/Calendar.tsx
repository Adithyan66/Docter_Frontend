const appointments = [
  { time: '09:00 AM', patient: 'Noah Garcia', type: 'Telemedicine' },
  { time: '11:30 AM', patient: 'Amelia Clark', type: 'In-person' },
  { time: '02:15 PM', patient: 'Lucas Turner', type: 'Procedure' },
]

export default function Calendar() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Calendar</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Upcoming schedule.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {appointments.map((appointment) => (
          <div
            key={appointment.time}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-xs uppercase text-slate-500 dark:text-slate-400">
              {appointment.type}
            </p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {appointment.time}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-300">{appointment.patient}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

