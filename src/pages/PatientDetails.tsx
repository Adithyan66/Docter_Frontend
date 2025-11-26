import { useParams } from 'react-router-dom'

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>()

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Patient Details</h1>
      <p className="text-slate-600 dark:text-slate-300">
        Patient ID: {id}
      </p>
      <p className="text-slate-600 dark:text-slate-300">
        Patient details page will be implemented here.
      </p>
    </section>
  )
}

