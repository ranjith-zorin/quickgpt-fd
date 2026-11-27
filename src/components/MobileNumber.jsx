import { useEffect, useMemo, useRef, useState } from "react";
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import usePostData from "../hook/api/postData";
import toast from "react-hot-toast";
// Make sure Bootstrap CSS is loaded once in your app:
// import "bootstrap/dist/css/bootstrap.min.css";
//
// Install:  npm install formik yup

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const COUNTRIES = [
  {
    code: "IN",
    name: "India",
    dial: "+91",
    len: 10,
    pattern: /^[6-9]\d{9}$/,
    patternMsg: "Indian mobile numbers start with 6, 7, 8 or 9.",
  },
  { code: "US", name: "United States", dial: "+1", len: 10 },
  { code: "GB", name: "United Kingdom", dial: "+44", len: 10 },
  { code: "CA", name: "Canada", dial: "+1", len: 10 },
  { code: "AU", name: "Australia", dial: "+61", len: 9 },
  { code: "AE", name: "United Arab Emirates", dial: "+971", len: 9 },
  { code: "SA", name: "Saudi Arabia", dial: "+966", len: 9 },
  { code: "SG", name: "Singapore", dial: "+65", len: 8 },
  { code: "MY", name: "Malaysia", dial: "+60", len: 9 },
  { code: "LK", name: "Sri Lanka", dial: "+94", len: 9 },
  { code: "BD", name: "Bangladesh", dial: "+880", len: 10 },
  { code: "NP", name: "Nepal", dial: "+977", len: 10 },
  { code: "PK", name: "Pakistan", dial: "+92", len: 10 },
  { code: "DE", name: "Germany", dial: "+49", len: 10 },
  { code: "FR", name: "France", dial: "+33", len: 9 },
  { code: "IT", name: "Italy", dial: "+39", len: 10 },
  { code: "ES", name: "Spain", dial: "+34", len: 9 },
  { code: "NL", name: "Netherlands", dial: "+31", len: 9 },
  { code: "CH", name: "Switzerland", dial: "+41", len: 9 },
  { code: "SE", name: "Sweden", dial: "+46", len: 9 },
  { code: "JP", name: "Japan", dial: "+81", len: 10 },
  { code: "KR", name: "South Korea", dial: "+82", len: 10 },
  { code: "CN", name: "China", dial: "+86", len: 11 },
  { code: "HK", name: "Hong Kong", dial: "+852", len: 8 },
  { code: "ID", name: "Indonesia", dial: "+62", len: 10 },
  { code: "PH", name: "Philippines", dial: "+63", len: 10 },
  { code: "TH", name: "Thailand", dial: "+66", len: 9 },
  { code: "VN", name: "Vietnam", dial: "+84", len: 9 },
  { code: "ZA", name: "South Africa", dial: "+27", len: 9 },
  { code: "NG", name: "Nigeria", dial: "+234", len: 10 },
  { code: "KE", name: "Kenya", dial: "+254", len: 9 },
  { code: "EG", name: "Egypt", dial: "+20", len: 10 },
  { code: "BR", name: "Brazil", dial: "+55", len: 11 },
  { code: "MX", name: "Mexico", dial: "+52", len: 10 },
  { code: "AR", name: "Argentina", dial: "+54", len: 10 },
  { code: "NZ", name: "New Zealand", dial: "+64", len: 9 },
];

// Lookup by ISO code (used for UI: flag, name, highlight)
const findCountry = (code) =>
  COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];

// Lookup by dial code (used for form values / validation)
const findByDial = (dial) =>
  COUNTRIES.find((c) => c.dial === dial) || COUNTRIES[0];

const flagUrl = (code, w = 40) =>
  `https://flagcdn.com/w${w}/${code.toLowerCase()}.png`;

/* ------------------------------------------------------------------ */
/* Yup validation schema                                               */
/* ------------------------------------------------------------------ */

const validationSchema = Yup.object({
  // countryCode now holds the dial code, e.g. "+91"
  countryCode: Yup.string()
    .oneOf(
      [...new Set(COUNTRIES.map((c) => c.dial))],
      "Select a valid country.",
    )
    .required("Select a country."),

  phoneNumber: Yup.string()
    .trim()
    .required("Enter your mobile number.")
    .matches(/^\d+$/, "Use digits only.")
    .test("length-by-country", function (value) {
      if (!value) return true; // "required" already handles empty
      const c = findByDial(this.parent.countryCode);
      if (value.length !== c.len) {
        return this.createError({
          message: `Enter a ${c.len}-digit number for ${c.dial}.`,
        });
      }
      return true;
    })
    .test("pattern-by-country", function (value) {
      if (!value) return true;
      const c = findByDial(this.parent.countryCode);
      if (c.pattern && value.length === c.len && !c.pattern.test(value)) {
        return this.createError({ message: c.patternMsg });
      }
      return true;
    }),
});

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const css = `
.pplx-phone {
  --pp-bg: #191a1a;
  --pp-surface: #202222;
  --pp-raised: #2b2d2d;
  --pp-border: #3a3d3d;
  --pp-text: #e8e8e6;
  --pp-muted: #8d9191;
  --pp-accent: #20b8cd;
  --pp-accent-soft: rgba(32, 184, 205, 0.16);
  --pp-danger: #e5736a;
  --pp-danger-soft: rgba(229, 115, 106, 0.16);
  font-family: "Inter", "FK Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif;
  color: var(--pp-text);
  width: 100%;
  max-width: 420px;
}
.pplx-phone .pp-label { color: var(--pp-muted); font-size: .875rem; font-weight: 500; margin-bottom: .5rem; }

.pplx-phone .pp-field {
  background: var(--pp-surface);
  border: 1px solid var(--pp-border);
  border-radius: 14px;
  transition: border-color .15s, box-shadow .15s;
  flex-wrap: nowrap;
}
.pplx-phone .pp-field:hover { border-color: #4a4e4e; }
.pplx-phone .pp-field.is-focus { border-color: var(--pp-accent); box-shadow: 0 0 0 3px var(--pp-accent-soft); }
.pplx-phone .pp-field.is-invalid { border-color: var(--pp-danger); }
.pplx-phone .pp-field.is-invalid.is-focus { box-shadow: 0 0 0 3px var(--pp-danger-soft); }

.pplx-phone .pp-trigger {
  background: transparent; border: 0; color: var(--pp-text);
  display: flex; align-items: center; gap: .5rem;
  padding: 0 .5rem 0 .875rem; height: 52px;
  border-radius: 14px 0 0 14px;
}
.pplx-phone .pp-trigger:hover { background: var(--pp-raised); }
.pplx-phone .pp-trigger:focus-visible { outline: 2px solid var(--pp-accent); outline-offset: -2px; }
.pplx-phone .pp-flag { width: 22px; height: 22px; border-radius: 50%; object-fit: cover; flex: none; background: var(--pp-raised); }
.pplx-phone .pp-dial { color: var(--pp-muted); font-variant-numeric: tabular-nums; }
.pplx-phone .pp-chev { width: 14px; height: 14px; color: var(--pp-muted); transition: transform .15s; }
.pplx-phone .pp-chev.open { transform: rotate(180deg); }
.pplx-phone .pp-sep { width: 1px; align-self: stretch; margin: 12px 0; background: var(--pp-border); }

.pplx-phone .pp-input {
  background: transparent !important; border: 0 !important; box-shadow: none !important;
  color: var(--pp-text) !important; height: 52px; padding: 0 1rem;
  font-size: 1rem; letter-spacing: .01em; font-variant-numeric: tabular-nums;
  min-width: 0;
}
.pplx-phone .pp-input::placeholder { color: #5f6363; }

.pplx-phone .pp-menu {
  position: absolute; z-index: 1050; left: 0; right: 0; top: calc(100% + 8px);
  background: var(--pp-surface); border: 1px solid var(--pp-border);
  border-radius: 14px; box-shadow: 0 16px 40px rgba(0,0,0,.45); overflow: hidden;
}
.pplx-phone .pp-search { padding: .625rem; border-bottom: 1px solid var(--pp-border); }
.pplx-phone .pp-search input {
  background: var(--pp-bg); border: 1px solid var(--pp-border); color: var(--pp-text);
  border-radius: 10px; padding: .5rem .75rem; font-size: .9rem; width: 100%;
}
.pplx-phone .pp-search input::placeholder { color: var(--pp-muted); }
.pplx-phone .pp-search input:focus { outline: 0; border-color: var(--pp-accent); }

.pplx-phone .pp-list { max-height: 260px; overflow-y: auto; padding: .375rem; margin: 0; list-style: none; }
.pplx-phone .pp-list::-webkit-scrollbar { width: 8px; }
.pplx-phone .pp-list::-webkit-scrollbar-thumb { background: var(--pp-border); border-radius: 8px; }
.pplx-phone .pp-item {
  display: flex; align-items: center; gap: .75rem; width: 100%;
  background: transparent; border: 0; color: var(--pp-text);
  padding: .5rem .625rem; border-radius: 10px; text-align: left; font-size: .925rem;
}
.pplx-phone .pp-item .pp-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pplx-phone .pp-item .pp-code { color: var(--pp-muted); font-variant-numeric: tabular-nums; }
.pplx-phone .pp-item.active { background: var(--pp-raised); }
.pplx-phone .pp-item.selected .pp-name { color: var(--pp-accent); }
.pplx-phone .pp-empty { padding: 1rem; text-align: center; color: var(--pp-muted); font-size: .9rem; }

.pplx-phone .pp-hint { font-size: .8rem; margin: .5rem 0 1rem; color: var(--pp-muted); min-height: 1.2em; }
.pplx-phone .pp-hint.error { color: var(--pp-danger); }

.pplx-phone .pp-submit {
  width: 100%; height: 48px; border: 0; border-radius: 12px;
  background: var(--pp-accent); color: #04252b; font-weight: 600; font-size: .95rem;
  transition: opacity .15s, background-color .15s;
}
.pplx-phone .pp-submit:hover:not(:disabled) { background: #3cc9dc; }
.pplx-phone .pp-submit:focus-visible { outline: 2px solid var(--pp-text); outline-offset: 2px; }
.pplx-phone .pp-submit:disabled { background: var(--pp-raised); color: var(--pp-muted); cursor: not-allowed; }

@media (max-width: 575.98px) {
  .pplx-phone .pp-trigger { padding-left: .625rem; gap: .375rem; }
  .pplx-phone .pp-input { padding: 0 .75rem; }
  .pplx-phone .pp-list { max-height: 220px; }
}
@media (prefers-reduced-motion: reduce) {
  .pplx-phone * { transition: none !important; }
}
`;

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Chevron({ open }) {
  return (
    <svg
      className={`pp-chev ${open ? "open" : ""}`}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.5 6l4.5 4.5L12.5 6" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Form body (uses Formik context)                                     */
/* ------------------------------------------------------------------ */

function PhoneFields({ label, onChange, defaultCountry }) {
  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setFieldValue,
    setFieldTouched,
  } = useFormikContext();

  // ISO code is UI-only (flag + highlighted row), because dial codes are not
  // unique (+1 = US and Canada). The Formik value is the dial code.
  const [iso, setIso] = useState(
    () => defaultCountry || findByDial(values.countryCode).code,
  );
  const countryCode = findCountry(iso); // selected country object

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);

  const wrapRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const postData = usePostData("/twilio-sms/send-otp");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase() === q,
    );
  }, [query]);

  // Close the menu on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Reset and focus search when the menu opens
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(
      Math.max(
        0,
        COUNTRIES.findIndex((c) => c.code === countryCode.code),
      ),
    );
    const t = setTimeout(() => searchRef.current?.focus(), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the active row in view
  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  // Report changes to the parent
  const emit = (c, n) =>
    onChange?.({
      countryCode: c.dial, // dial code
      phoneNumber: n,
      e164: n ? `${c.dial}${n}` : "",
      valid: validationSchema.isValidSync({
        countryCode: c.dial,
        phoneNumber: n,
      }),
    });

  const pickCountry = async (c) => {
    const trimmed = values.phoneNumber.slice(0, c.len);
    setOpen(false);
    setIso(c.code);
    await setFieldValue("countryCode", c.dial, false); // dial instead of ISO
    await setFieldValue("phoneNumber", trimmed, true); // re-run validation with the new country
    emit(c, trimmed);
  };

  const onNumber = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, countryCode.len);
    setFieldValue("phoneNumber", digits, true);
    emit(countryCode, digits);
  };

  const onSearchKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) pickCountry(filtered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const errorMsg =
    touched.phoneNumber && (errors.phoneNumber || errors.countryCode);
  const invalid = Boolean(errorMsg);

  
  async function handleClick(e) {
    const { phoneNumber, countryCode } = values;
    try {
      const res = await postData({ phoneNumber, countryCode });
      console.log("res", res);
      if (res.success !== false) {
        toast.success(res.msg);
        localStorage.setItem(
          "contact",
          JSON.stringify({ phoneNumber, countryCode }),
        );
        console.log("saved to localStorage");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log("error ", error);
      toast.error("Something went wrong");
    }
  }

  return (
    <Form noValidate ref={wrapRef} className="pplx-phone">
      <style>{css}</style>

      <label className="pp-label d-block" htmlFor="pp-phone-input">
        {label}
      </label>

      <div className="position-relative">
        <div
          className={`input-group pp-field ${focused ? "is-focus" : ""} ${invalid ? "is-invalid" : ""}`}
        >
          <button
            type="button"
            className="pp-trigger"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={`Country: ${countryCode.name} ${countryCode.dial}`}
            onClick={() => setOpen((o) => !o)}
          >
            <img className="pp-flag" src={flagUrl(countryCode.code)} alt="" />
            <span className="pp-dial">{countryCode.dial}</span>
            <Chevron open={open} />
          </button>

          <span className="pp-sep" />

          <input
            id="pp-phone-input"
            name="phoneNumber"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            className="form-control pp-input"
            placeholder={"0".repeat(countryCode.len)}
            value={values.phoneNumber}
            onChange={onNumber}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              setFieldTouched("phoneNumber", true, true);
            }}
            aria-invalid={invalid}
            aria-describedby="pp-phone-hint"
          />
        </div>

        {open && (
          <div className="pp-menu">
            <div className="pp-search">
              <input
                ref={searchRef}
                type="text"
                placeholder="Search country or code"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onSearchKey}
              />
            </div>

            {filtered.length === 0 ? (
              <div className="pp-empty">
                No country found. Try a different name or code.
              </div>
            ) : (
              <ul className="pp-list" role="listbox" ref={listRef}>
                {filtered.map((c, i) => (
                  <li
                    key={c.code}
                    role="option"
                    aria-selected={c.code === countryCode.code}
                  >
                    <button
                      type="button"
                      tabIndex={-1}
                      className={`pp-item ${i === active ? "active" : ""} ${c.code === countryCode.code ? "selected" : ""}`}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => pickCountry(c)}
                    >
                      <img
                        className="pp-flag"
                        src={flagUrl(c.code)}
                        alt=""
                        loading="lazy"
                      />
                      <span className="pp-name">{c.name}</span>
                      <span className="pp-code">{c.dial}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div
        id="pp-phone-hint"
        className={`pp-hint ${invalid ? "error" : ""}`}
        role={invalid ? "alert" : undefined}
      >
        {invalid ? errorMsg : "We'll send a verification code to this number."}
      </div>

      <button
        type="submit"
        className="pp-submit"
        disabled={!isValid || !values.phoneNumber || isSubmitting}
        onClick={handleClick}
      >
        {isSubmitting ? "Sending…" : "Continue with phone"}
      </button>
    </Form>
  );
}

/* ------------------------------------------------------------------ */
/* Public component                                                    */
/* ------------------------------------------------------------------ */

export default function MobileNumber({
  label = "Mobile number",
  defaultCountry = "IN",
  onChange,
  onSubmit,
  handleShow,
}) {
  const initialValues = {
    countryCode: findCountry(defaultCountry).dial, // e.g. "+91"
    phoneNumber: "",
  };

  const handleSubmit = async (values, helpers) => {
    const payload = {
      countryCode: values.countryCode, // "+91"
      phoneNumber: values.phoneNumber,
      e164: `${values.countryCode}${values.phoneNumber}`,
    };
    try {
      await onSubmit?.(payload);
      handleShow?.(payload); // e.g. open the OTP modal
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      validateOnMount
    >
      <PhoneFields
        label={label}
        onChange={onChange}
        defaultCountry={defaultCountry}
      />
    </Formik>
  );
}
