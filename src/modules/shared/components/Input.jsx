function Input({ id, label, error = '', className = '', ...restProps }) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-med-text-main"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`w-full border rounded-lg px-3.5 py-2.5 text-sm bg-white text-med-text-main placeholder-med-text-muted transition focus:outline-none focus:ring-2 focus:ring-med-primary-600 focus:border-transparent ${
          error ? 'border-red-400 bg-red-50/20' : 'border-med-border'
        } ${className}`}
        {...restProps}
      />
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-red-700 font-medium"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
