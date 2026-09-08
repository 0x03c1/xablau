export default function Switch({ id, label, hint, checked, onChange }) {
  return (
    <div className="switch">
      <div className="switch__text">
        <label htmlFor={id}>{label}</label>
        {hint ? <p className="switch__hint">{hint}</p> : null}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        className="switch__control"
        onClick={() => onChange(!checked)}
      >
        <span className="switch__thumb" aria-hidden="true" />
        <span className="visually-hidden">{label}</span>
      </button>
    </div>
  );
}
