import { useNavigate } from 'react-router-dom'

const PlusIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
)

export default function Treatments() {
  const navigate = useNavigate()

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Treatments</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage standard treatments, timelines, and resources.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/treatments/add')}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PlusIcon />
          Add Treatment
        </button>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Configure the treatment catalog to keep your care team aligned. Use the button above to add
        new treatment templates.
      </div>
    </section>
  )
}
