import { useRef, useEffect, useState } from 'react'
import TreatmentCard from '@components/treatment/TreatmentCard'
import PageHeader from '@components/common/PageHeader'
import { useAddTreatment } from '@hooks/data/useAddTreatment'
import treatmentLogo from '@assets/treatment.png'
import ConfirmationModal from '@components/common/ConfirmationModal'

const labelStyles = 'block text-xs font-medium text-slate-600 mb-1.5 dark:text-slate-300'
const inputStyles =
  'w-full bg-transparent border-0 border-b-2 border-slate-200 px-0 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400'
const textareaStyles =
  'w-full bg-transparent border-0 border-b-2 border-slate-200 px-0 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 resize-none dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400'

const processEscapeSequences = (text: string): string => {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\\\/g, '\\')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
}

export default function AddTreatment() {
  const {
    form,
    isSubmitting,
    isLoading,
    isEditMode,
    summaryData,
    handleFieldChange,
    handleRegularVisitIntervalChange,
    addStep,
    addAftercare,
    addRisk,
    removeArrayEntry,
    clearField,
    submitForm,
    performSubmit,
    validateForm,
    setForm,
  } = useAddTreatment()

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSaveClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (validateForm()) {
      setShowConfirmModal(true)
    }
  }

  const handleConfirmSave = () => {
    setShowConfirmModal(false)
    performSubmit()
  }

  useEffect(() => {
    const textarea = descriptionTextareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [form.description])

  if (isLoading) {
    return (
      <section className="flex items-center justify-center space-y-6">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title={isEditMode ? 'Edit Treatment' : 'Add Treatment'}
        description={
          isEditMode
            ? 'Update treatment template details.'
            : 'Build standardized treatment templates for your care team.'
        }
        image={{
          src: treatmentLogo,
          alt: 'teeth',
          className: 'w-[120px] h-[120px]',
        }}
      />
      <form id="add-treatment-form" onSubmit={submitForm} className="space-y-8">
        <div className="flex flex-col gap-8 xl:flex-row">
          <div className="flex flex-1 flex-col gap-6">
            <div className="rounded-2xl bg-white/60 p-6 backdrop-blur-sm transition-shadow hover:shadow-md dark:bg-slate-900">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
                <div className="flex flex-col gap-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Core Details
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label className={labelStyles}>Name*</label>
                      <input
                        type="text"
                        className={inputStyles}
                        value={form.name}
                        onChange={(event) => handleFieldChange('name', event.target.value)}
                        placeholder="Enter treatment name"
                        required
                      />
                    </div>
                    <div>
                      <label className={labelStyles}>Description</label>
                      <textarea
                        ref={descriptionTextareaRef}
                        className={`${textareaStyles} min-h-[100px] overflow-hidden`}
                        value={form.description}
                        onChange={(event) => {
                          handleFieldChange('description', event.target.value)
                          const textarea = event.target
                          textarea.style.height = 'auto'
                          textarea.style.height = `${textarea.scrollHeight}px`
                        }}
                        placeholder="Describe the treatment..."
                      />
                    </div>
                    <div className="space-y-3 pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={form.isOneTime}
                          onChange={(event) => handleFieldChange('isOneTime', event.target.checked)}
                          className="h-4 w-4 rounded border-2 border-slate-300 text-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 group-hover:border-blue-400 dark:border-slate-600"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          One-time treatment
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                {!form.isOneTime && (
                  <div className="flex flex-col gap-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Duration (months)
                    </h3>
                    <div className="space-y-5">
                      <div>
                        <label className={labelStyles}>Minimum</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          className={inputStyles}
                          value={form.minDuration}
                          onChange={(event) => handleFieldChange('minDuration', event.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className={labelStyles}>Maximum</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          className={inputStyles}
                          value={form.maxDuration}
                          onChange={(event) => handleFieldChange('maxDuration', event.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className={labelStyles}>Average</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          className={inputStyles}
                          value={form.avgDuration}
                          onChange={(event) => handleFieldChange('avgDuration', event.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {!form.isOneTime && (
                  <div className="flex flex-col gap-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Regular Visit Interval
                    </h3>
                    <div className="space-y-5">
                      <div>
                        <label className={labelStyles}>Interval</label>
                        <input
                          type="number"
                          min="0"
                          className={inputStyles}
                          value={form.regularVisitInterval.interval}
                          onChange={(event) => handleRegularVisitIntervalChange('interval', event.target.value)}
                          placeholder="Enter interval"
                        />
                      </div>
                      <div>
                        <label className={labelStyles}>Unit</label>
                        <select
                          className={inputStyles}
                          value={form.regularVisitInterval.unit}
                          onChange={(event) => handleRegularVisitIntervalChange('unit', event.target.value)}
                        >
                          <option value="">Select unit</option>
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                          <option value="months">Months</option>
                          <option value="years">Years</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Fees
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label className={labelStyles}>Minimum</label>
                      <input
                        type="number"
                        min="0"
                        className={inputStyles}
                        value={form.minFees}
                        onChange={(event) => handleFieldChange('minFees', event.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className={labelStyles}>Maximum</label>
                      <input
                        type="number"
                        min="0"
                        className={inputStyles}
                        value={form.maxFees}
                        onChange={(event) => handleFieldChange('maxFees', event.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className={labelStyles}>Average</label>
                      <input
                        type="number"
                        min="0"
                        className={inputStyles}
                        value={form.avgFees}
                        onChange={(event) => handleFieldChange('avgFees', event.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Procedure Steps
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <textarea
                        className={`${textareaStyles} min-h-[80px] flex-1`}
                        placeholder="Enter a step..."
                        value={form.currentStep}
                        onChange={(event) => handleFieldChange('currentStep', event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                            event.preventDefault()
                            addStep()
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="mt-1 h-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
                        onClick={addStep}
                        disabled={!form.currentStep.trim()}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Aftercare & Follow Up
                  </h3>
                  <div className="space-y-5">
                    <div className="flex gap-3">
                      <textarea
                        className={`${textareaStyles} min-h-[80px] flex-1`}
                        placeholder="Enter aftercare instruction..."
                        value={form.currentAftercare}
                        onChange={(event) => handleFieldChange('currentAftercare', event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                            event.preventDefault()
                            addAftercare()
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="mt-1 h-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
                        onClick={addAftercare}
                        disabled={!form.currentAftercare.trim()}
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-3 pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={form.followUpRequired}
                          onChange={(event) => handleFieldChange('followUpRequired', event.target.checked)}
                          className="h-4 w-4 rounded border-2 border-slate-300 text-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 group-hover:border-blue-400 dark:border-slate-600"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Follow-up required
                        </span>
                      </label>
                      {form.followUpRequired && (
                        <div>
                          <label className={labelStyles}>Follow-up after days</label>
                          <input
                            type="number"
                            min="0"
                            className={inputStyles}
                            value={form.followUpAfterDays}
                            onChange={(event) =>
                              handleFieldChange('followUpAfterDays', event.target.value)
                            }
                            placeholder="Enter days"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Risks
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <textarea
                        className={`${textareaStyles} min-h-[80px] flex-1`}
                        placeholder="Enter a risk..."
                        value={form.currentRisk}
                        onChange={(event) => handleFieldChange('currentRisk', event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                            event.preventDefault()
                            addRisk()
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="mt-1 h-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
                        onClick={addRisk}
                        disabled={!form.currentRisk.trim()}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <aside className="xl:sticky xl:top-6 xl:h-fit xl:w-96">
            <div className="rounded-2xl bg-white/60 p-6 backdrop-blur-sm transition-shadow hover:shadow-md dark:bg-slate-900">
              <div className="flex flex-col gap-4">
                <TreatmentCard
                  treatment={{
                    name: summaryData.name,
                    description: summaryData.description,
                    isOneTime: summaryData.isOneTime,
                    minDuration: summaryData.minDuration,
                    maxDuration: summaryData.maxDuration,
                    avgDuration: summaryData.avgDuration,
                    regularVisitInterval: summaryData.regularVisitInterval,
                    minFees: summaryData.minFees,
                    maxFees: summaryData.maxFees,
                    avgFees: summaryData.avgFees,
                    followUpRequired: summaryData.followUpRequired,
                    followUpAfterDays: summaryData.followUpAfterDays,
                    steps: summaryData.steps,
                    aftercare: summaryData.aftercare,
                    risks: summaryData.risks,
                    images: isEditMode ? summaryData.images : undefined,
                  }}
                  onRemoveStep={(index) => removeArrayEntry('steps', index)}
                  onRemoveAftercare={(index) => removeArrayEntry('aftercare', index)}
                  onRemoveRisk={(index) => removeArrayEntry('risks', index)}
                  onClearFollowUp={() => {
                    clearField('followUpRequired')
                    clearField('followUpAfterDays')
                  }}
                  processEscapeSequences={processEscapeSequences}
                />
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveClick}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:cursor-pointer hover:from-blue-200 hover:to-blue-300 disabled:cursor-not-allowed disabled:opacity-60 dark:from-blue-800/30 dark:to-blue-700/30 dark:text-slate-200 dark:hover:from-blue-700/40 dark:hover:to-blue-600/40"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-transparent dark:border-slate-200"></span>
                        {isEditMode ? 'Updating...' : 'Saving...'}
                      </>
                    ) : (
                      isEditMode ? 'Update Treatment' : 'Save Treatment'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </form>
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSave}
        title={isEditMode ? 'Update Treatment' : 'Save Treatment'}
        message={
          isEditMode
            ? 'Are you sure you want to update this treatment? This will save all your changes.'
            : 'Are you sure you want to save this treatment? This will create a new treatment template.'
        }
        confirmText={isEditMode ? 'Update' : 'Save'}
        cancelText="Cancel"
        confirmButtonClassName="bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
      />
    </section>
  )
}
