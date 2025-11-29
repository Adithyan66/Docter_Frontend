import { useParams, useNavigate } from 'react-router-dom'
import treatmentLogo from '@assets/treatment.png'
import RotatingSpinner from '@components/spinner/TeethRotating'

export default function TreatmentDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-md bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-900 lg:flex-row lg:items-center lg:gap-6">
        <img src={treatmentLogo} alt="treatment" className="w-[120px] h-[120px]" />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Treatment Details</h1>
          <p className="text-slate-600 dark:text-slate-300">
            View comprehensive treatment information.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/treatments')}
          className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-500 dark:bg-slate-500 dark:hover:bg-slate-400"
        >
          Back to Treatments
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center py-12">
          <p className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Treatment Details Page
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
            Treatment ID: {id}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            This page will display detailed treatment information.
          </p>
        </div>
      </div>
    </section>
  )
}

