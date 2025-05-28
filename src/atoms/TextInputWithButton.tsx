import React from 'react';
import { ChangeEventHandler, FormEventHandler, useRef } from 'react';

interface TextInputWithButtonProps {
  onSubmit: (text: string) => void;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  placeholder?: string;
  buttonText?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  autoFocus?: boolean;
}

export function TextInputWithButton({
  onSubmit,
  onChange,
  disabled = false,
  placeholder = 'Enter text',
  buttonText = 'Submit',
  className = '',
  inputClassName = '',
  buttonClassName = '',
  autoFocus = false,
}: TextInputWithButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!inputRef.current) {
      return;
    }

    const text = inputRef.current.value;
    if (text.trim()) {
      onSubmit(text);
      inputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className={`join w-full ${className}`}>
      <input
        type="text"
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`input input-bordered join-item flex-1 ${inputClassName}`}
        ref={inputRef}
        autoFocus={autoFocus}
      />
      <button 
        type="submit" 
        disabled={disabled} 
        className={`btn btn-primary join-item ${buttonClassName}`}
      >
        {buttonText}
      </button>
    </form>
  );
}
