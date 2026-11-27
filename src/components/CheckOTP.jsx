import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-bootstrap/Modal";
import usePostData from "../hook/api/postData";

const OTP_LENGTH = 6;

const styles = `
  .ce-page {
    min-height: 100vh;
    background: #151619;
    padding: 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }

  .ce-card {
    position: relative;
    width: 100%;
    max-width: 600px;
    background: #17181b;
    border: 1px solid #2a2b2f;
    border-radius: 10px;
    padding: 56px 24px 52px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
  }

  .ce-close {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: transparent;
    border: 0;
    border-radius: 6px;
    color: #9a9ba0;
    cursor: pointer;
    transition: color 0.15s ease, background-color 0.15s ease;
  }
  .ce-close:hover { color: #ffffff; background: #222327; }
  .ce-close:focus-visible { outline: 2px solid #5aa8b2; outline-offset: 2px; }

  .ce-icon { width: 80px; height: 80px; margin-bottom: 28px; }

  .ce-title {
    font-family: "Tiempos Headline", "Source Serif 4", Georgia, "Times New Roman", serif;
    font-weight: 400;
    font-size: 2rem;
    line-height: 1.2;
    letter-spacing: 0.2px;
    color: #ececee;
    margin: 0 0 14px;
  }

  .ce-subtitle {
    color: #8e8f95;
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0 0 36px;
    word-break: break-word;
  }

  .ce-inner { width: 100%; max-width: 384px; }

  .ce-otp {
    display: flex;
    justify-content: space-between;
    gap: clamp(6px, 3vw, 20px);
    margin-bottom: 20px;
  }

  .ce-otp-input {
    flex: 1 1 0;
    min-width: 0;
    aspect-ratio: 3 / 4;
    max-width: 48px;
    padding: 0;
    text-align: center;
    font-size: 1.4rem;
    font-weight: 500;
    color: #f2f2f4;
    background: #1d1e22;
    border: 1px solid #303136;
    border-radius: 8px;
    caret-color: #5aa8b2;
    transition: border-color 0.15s ease, background-color 0.15s ease;
  }
  .ce-otp-input:focus {
    outline: 1px solid #3f7f88;
    outline-offset: 3px;
    border: 2px solid #5aa8b2;
    background: #1d1e22;
    color: #f2f2f4;
    box-shadow: none;
  }
  .ce-otp-input.is-filled { border-color: #4a4b52; }

  .ce-confirm {
    width: 100%;
    padding: 11px 16px;
    font-size: 1rem;
    font-weight: 500;
    color: #1b1c1f;
    background: #7c7d82;
    border: 0;
    border-radius: 8px;
    transition: background-color 0.15s ease;
  }
  .ce-confirm:disabled { background: #7c7d82; color: #1b1c1f; opacity: 1; cursor: not-allowed; }
  .ce-confirm:not(:disabled) { background: #ececee; color: #17181b; }
  .ce-confirm:not(:disabled):hover { background: #ffffff; }
  .ce-confirm:focus-visible { outline: 2px solid #5aa8b2; outline-offset: 2px; box-shadow: none; }

  /* ---------- Responsive ---------- */
  @media (max-width: 575.98px) {
    .ce-page { padding: 12px; }
    .ce-card { padding: 52px 18px 36px; }
    .ce-icon { width: 68px; height: 68px; margin-bottom: 22px; }
    .ce-title { font-size: 1.65rem; }
    .ce-subtitle { font-size: 0.9rem; margin-bottom: 28px; }
    .ce-otp-input { font-size: 1.2rem; border-radius: 7px; }
  }

  @media (max-width: 359.98px) {
    .ce-card { padding: 48px 12px 28px; }
    .ce-title { font-size: 1.45rem; }
    .ce-otp { gap: 5px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ce-close, .ce-otp-input, .ce-confirm { transition: none; }
  }
`;

function MailIcon() {
  return (
    <svg
      className="ce-icon"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="40" cy="40" r="39" stroke="#3a3b40" strokeWidth="1.5" />
      <circle cx="42" cy="38" r="27" stroke="#4a4b51" strokeWidth="1.5" />
      <path
        d="M52 28 L30 37 L38 40 L41 49 Z"
        stroke="#e4e4e7"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M52 28 L38 40"
        stroke="#e4e4e7"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M36 46 L10 66"
        stroke="#6b6c72"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CheckEmail({
  email = "demo@gmail.com",
  onConfirm,
  onClose,
  closebtn,
}) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef([]);
  const [otpcode, setOtpCode] = useState("");

  const isComplete = digits.every((d) => d !== "");

  const postData = usePostData("/twilio-sms/verify-otp");

  const focusInput = (index) => {
    const el = inputsRef.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const [mobile, setMobile] = useState("");

  const handleChange = (index, e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) return;

    const next = [...digits];
    // Handles typing as well as autofill that inserts multiple characters
    const chars = value.split("");
    let i = index;
    chars.forEach((ch) => {
      if (i < OTP_LENGTH) next[i++] = ch;
    });
    setDigits(next);
    focusInput(Math.min(i, OTP_LENGTH - 1));
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (digits[index]) {
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        next[index - 1] = "";
        setDigits(next);
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusInput(index + 1);
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
    pasted.split("").forEach((ch, i) => (next[i] = ch));
    setDigits(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isComplete) return;
    const code = digits.join("");
    setOtpCode(code);
    console.log("code", code);
    if (onConfirm) onConfirm(code);
    else console.log("Code submitted:", code);
  };

  function handleClick() {
    let text = localStorage.getItem("contact");
    let data = JSON.parse(text);
    postData({ ...data, otp: otpcode });
  }

  useEffect(() => {
    setMobile(JSON.parse(localStorage.getItem("contact")));
  }, []);

  return (
    <Modal show={true} fullscreen={true} size="large">
      <style>{styles}</style>

      <div className="ce-page d-flex align-items-center justify-content-center">
        <div className="ce-card d-flex flex-column align-items-center text-center">
          <button
            type="button"
            className="ce-close"
            aria-label="Close"
            onClick={() => closebtn(false)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 2 L12 12 M12 2 L2 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <MailIcon />

          <h1 className="ce-title">Enter your OTP here </h1>
          <p className="ce-subtitle">
            A OTP has been sent to {mobile?.phoneNumber}
          </p>

          <form className="ce-inner" onSubmit={handleSubmit} noValidate>
            <div className="ce-otp" role="group" aria-label="Verification code">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  autoFocus={i === 0}
                  maxLength={OTP_LENGTH}
                  value={digit}
                  className={`form-control ce-otp-input ${digit ? "is-filled" : ""}`}
                  aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                  onChange={(e) => handleChange(i, e)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>

            <button
              type="submit"
              className="btn ce-confirm"
              disabled={!isComplete}
              onClick={handleClick}
            >
              Confirm
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
