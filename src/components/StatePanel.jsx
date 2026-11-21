export default function StatePanel({
  variant = 'empty',
  title,
  message,
  actionLabel,
  onAction,
  children,
}) {
  const isError = variant === 'error'
  const mark = variant === 'loading' ? null : isError ? '!' : '—'

  return (
    <section
      className={`state-panel state-${variant}`}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
    >
      <span className="state-mark" aria-hidden="true">
        {variant === 'loading' ? <span className="state-spinner" /> : mark}
      </span>
      <div>
        <h3>{title}</h3>
        {message && <p>{message}</p>}
        {children}
        {actionLabel && onAction && (
          <button type="button" className="btn ghost state-action" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </section>
  )
}
