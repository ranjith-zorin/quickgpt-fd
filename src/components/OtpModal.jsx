import { useRef, useState } from "react";
import { Modal, Form, Button, CloseButton } from "react-bootstrap";
import "./OtpModal.css";

const OTP_LENGTH = 6;

export default function OtpModal({
  show = true,
  email = "ranjithzorin@gmail.com",
  onClose = () => {},
  onConfirm = () => {},
}) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef([]);

  const isComplete = digits.every((d) => d !== "");

  const focusAt = (i) => inputsRef.current[i]?.focus();

  const handleChange = (e, i) => {
    const value = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = value;
    setDigits(next);
    if (value && i < OTP_LENGTH - 1) focusAt(i + 1);
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      const next = [...digits];
      next[i - 1] = "";
      setDigits(next);
      focusAt(i - 1);
    } else if (e.key === "ArrowLeft" && i > 0) {
      focusAt(i - 1);
    } else if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) {
      focusAt(i + 1);
    } else if (e.key === "Enter" && isComplete) {
      onConfirm(digits.join(""));
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, idx) => (next[idx] = ch));
    setDigits(next);
    focusAt(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      dialogClassName="otp-dialog"
      contentClassName="otp-content"
      backdropClassName="otp-backdrop"
      onEntered={() => focusAt(0)}
    >
      <CloseButton className="otp-close" onClick={onClose} aria-label="Close" />

      <Modal.Body className="otp-body">
        {/* Icon */}
        <div className="otp-icon" aria-hidden="true">
          <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
            <circle cx="40" cy="40" r="39.5" stroke="#34393f" />
            <circle cx="40" cy="40" r="28.5" stroke="#6b7076" />
            <path
              d="M5 71.5 L14 63.5"
              stroke="#6b7076"
              strokeWidth="1.2"
              strokeDasharray="2.5 3"
              strokeLinecap="round"
            />
            <g
              stroke="#e8e8e6"
              strokeWidth="1.6"
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              <path d="M28 38.5 L52.5 27.5 L45.5 52.5 L38.5 43.5 Z" />
              <path d="M38.5 43.5 L52.5 27.5" />
              <path d="M38.5 43.5 L38 50.5 L42 46.5" />
            </g>
          </svg>
        </div>

        <h2 className="otp-title">Check your email</h2>
        <p className="otp-subtitle">
          A temporary sign-in link has been sent to
          <br />
          {email}
        </p>

        <Form
          className="otp-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (isComplete) onConfirm(digits.join(""));
          }}
        >
          <div className="otp-inputs" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <Form.Control
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                className="otp-input"
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={d}
                aria-label={`Digit ${i + 1}`}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>

          <Button type="submit" className="otp-confirm" disabled={!isComplete}>
            Confirm
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}