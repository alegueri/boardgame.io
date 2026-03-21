import { useState, useEffect, useRef } from 'react';

interface AnswerInputProps {
  onSubmit: (value: number) => void;
  disabled?: boolean;
}

export function AnswerInput({ onSubmit, disabled }: AnswerInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue('');
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  function handleSubmit() {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      onSubmit(num);
      setValue('');
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }

  function padDigit(d: string) {
    if (disabled) return;
    setValue(v => v + d);
  }

  function padDelete() {
    setValue(v => v.slice(0, -1));
  }

  return (
    <div className="mm-answer-input">
      <input
        ref={inputRef}
        type="number"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled}
        className="mm-answer-field"
        placeholder="Your answer…"
        autoComplete="off"
      />
      <div className="mm-keypad">
        {['7','8','9','4','5','6','1','2','3'].map(d => (
          <button key={d} className="mm-keypad-btn" onClick={() => padDigit(d)} disabled={disabled}>{d}</button>
        ))}
        <button className="mm-keypad-btn mm-keypad-clear" onClick={padDelete} disabled={disabled}>⌫</button>
        <button className="mm-keypad-btn" onClick={() => padDigit('0')} disabled={disabled}>0</button>
        <button className="mm-keypad-btn mm-keypad-submit" onClick={handleSubmit} disabled={disabled || value === ''}>✓</button>
      </div>
    </div>
  );
}
