import Pagination from '@components/common/Pagination'
import type { VisitResponseDto } from '@api/visits'

type TreatmentCourseVisitsProps = {
  visits: VisitResponseDto[]
  visitsPagination: {
    page: number
    totalPages: number
    total: number
  }
  visitsSearch: string
  isLoadingVisits: boolean
  formatDateWithTime: (dateString?: string) => string
  onSearchChange: (value: string) => void
  onPageChange: (page: number) => void
  onEditVisit: (visit: VisitResponseDto) => void
  onDeleteVisit: (visit: VisitResponseDto) => void
  onImageClick: (imageUrl: string) => void
  isStaff?: boolean
}

export default function TreatmentCourseVisits({
  visits,
  visitsPagination,
  visitsSearch,
  isLoadingVisits,
  formatDateWithTime,
  onSearchChange,
  onPageChange,
  onEditVisit,
  onDeleteVisit,
  onImageClick,
  isStaff = false,
}: TreatmentCourseVisitsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Visits ({visitsPagination.total})</h3>
        <div className="w-64">
          <input
            type="text"
            value={visitsSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by notes..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {isLoadingVisits ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : visits.length > 0 ? (
        <>
          <div className="space-y-4 mb-6">
            {visits.map((visit) => (
              <div key={visit.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Visit on {formatDateWithTime(visit.visitDate)}
                  </h4>
                  <div className="flex items-center gap-2">
                    {!isStaff && (
                      <>
                        <button
                          onClick={() => onEditVisit(visit)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-100 to-yellow-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-yellow-200 hover:to-yellow-300 dark:from-yellow-800/30 dark:to-yellow-700/30 dark:text-slate-200 dark:hover:from-yellow-700/40 dark:hover:to-yellow-600/40"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => onDeleteVisit(visit)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-100 to-red-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-red-200 hover:to-red-300 dark:from-red-800/30 dark:to-red-700/30 dark:text-slate-200 dark:hover:from-red-700/40 dark:hover:to-red-600/40"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {visit.billedAmount ? (
                      <span className="rounded-lg bg-green-100 px-3 py-1 text-lg font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        ₹{visit.billedAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 dark:text-slate-400">No payment</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 items-stretch">
                  <div className="w-1/2 flex">
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 w-full flex flex-col">
                      <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Notes</h5>
                      {visit.notes ? (
                        <p className="text-sm text-slate-900 dark:text-white whitespace-pre-line">{visit.notes}</p>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">No notes</p>
                      )}
                    </div>
                  </div>

                  <div className="w-1/2 flex flex-col gap-3">
                    <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                      <h5 className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">Prescription</h5>
                      {visit.prescription ? (
                        <>
                          {visit.prescription.diagnosis && visit.prescription.diagnosis.length > 0 ? (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Diagnosis: </span>
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                {visit.prescription.diagnosis.join(', ')}
                              </span>
                            </div>
                          ) : null}
                          {visit.prescription.items && visit.prescription.items.length > 0 ? (
                            <div className="space-y-1">
                              {visit.prescription.items.map((item, idx) => (
                                <div key={idx} className="text-xs text-blue-700 dark:text-blue-300">
                                  <span className="font-medium">{item.medicineName}</span>
                                  {item.dosage && <span> - {item.dosage}</span>}
                                  {item.frequency && <span>, {item.frequency}</span>}
                                  {item.duration && <span> ({item.duration})</span>}
                                </div>
                              ))}
                            </div>
                          ) : null}
                          {(!visit.prescription.diagnosis || visit.prescription.diagnosis.length === 0) &&
                            (!visit.prescription.items || visit.prescription.items.length === 0) && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">No prescription</p>
                            )}
                        </>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">No prescription</p>
                      )}
                    </div>

                    {visit.media && visit.media.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {visit.media.map((media, idx) => (
                          <div key={media.id || idx} className="relative group aspect-square">
                            <img
                              src={media.url}
                              alt={media.notes || `Media ${idx + 1}`}
                              className="h-full w-full rounded-lg object-cover border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => onImageClick(media.url)}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="truncate">{media.type}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400">No images</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {visitsPagination.totalPages > 1 && (
            <Pagination
              currentPage={visitsPagination.page}
              totalPages={visitsPagination.totalPages}
              onPageChange={onPageChange}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12 text-sm text-slate-600 dark:text-slate-400">No visits found</div>
      )}
    </div>
  )
}

