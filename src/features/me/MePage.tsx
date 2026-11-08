import { useAuth } from '../../auth/AuthContext'
import { Icon } from '../../components/Icon'
import { useToast } from '../../components/Toast'
import { useClearAll, useLoadSampleData, useVisitViews } from '../../data/hooks'
import { repo } from '../../data'

export function MePage() {
  const toast = useToast()
  const { user, signOut } = useAuth()
  const { views } = useVisitViews()
  const sample = useLoadSampleData()
  const clearAll = useClearAll()

  const onExport = async () => {
    const json = await repo.exportData()
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `taco-journal-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.show('Exported! Photos aren’t included yet.')
  }

  const onClear = async () => {
    if (!window.confirm('Erase your whole journal, including photos, from this device? This can’t be undone.')) return
    await clearAll.mutateAsync()
    toast.show('Journal cleared.')
  }

  return (
    <div>
      <header className="px-4 pt-6 pb-4">
        <h1 className="font-display text-3xl font-bold">Me</h1>
        <p className="text-muted">Your taco headquarters.</p>
      </header>

      <div className="space-y-4 px-4">
        <section className="card flex items-center gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-full border-2 border-ink bg-sun font-display text-2xl font-bold">
            {(user?.name[0] ?? '🌮').toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-semibold">{user?.name}</p>
            <p className="truncate text-sm text-muted">{user?.email}</p>
          </div>
          <button type="button" className="btn btn-secondary btn-sm shrink-0" onClick={() => void signOut()}>
            Sign out
          </button>
        </section>

        <section className="card space-y-2">
          <h2 className="font-display text-lg font-semibold">
            <span aria-hidden="true">📱</span> Stored on this device
          </h2>
          <p className="text-sm text-muted">
            For now your journal lives in this browser only — {views.length}{' '}
            {views.length === 1 ? 'entry' : 'entries'}. Clearing your browser data will erase it, so export now and
            then. Accounts and cloud sync are coming.
          </p>
        </section>

        <section className="card space-y-3">
          <h2 className="font-display text-lg font-semibold">Your data</h2>
          <button type="button" className="btn btn-secondary w-full" onClick={() => void onExport()} disabled={views.length === 0}>
            <Icon name="download" size={18} /> Export as JSON
          </button>
          <button
            type="button"
            className="btn btn-secondary w-full"
            onClick={() => sample.mutate(undefined, { onSuccess: () => toast.show('Sample tacos added!') })}
            disabled={sample.isPending}
          >
            🌮 {sample.isPending ? 'Plating…' : 'Add sample tacos'}
          </button>
          <button
            type="button"
            className="btn btn-danger w-full"
            onClick={() => void onClear()}
            disabled={clearAll.isPending}
          >
            <Icon name="trash" size={18} /> Erase everything
          </button>
        </section>

        <p className="pt-2 text-center text-xs text-muted">Taco Journal · v0.1 · made with salsa</p>
      </div>
    </div>
  )
}
