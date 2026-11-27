import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Check, ArrowRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("token")) || null;
  } catch {
    return null;
  }
}

// loads Razorpay checkout.js once
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const plans = [
  {
    _id: "basic",
    name: "Basic",
    price: 10,
    credits: 100,
    features: [
      "100 text generations",
      "50 image generations",
      "Standard support",
      "Access to basic models",
    ],
  },
  {
    _id: "pro",
    name: "Pro",
    price: 20,
    credits: 500,
    features: [
      "500 text generations",
      "200 image generations",
      "Priority support",
      "Access to pro models",
      "Faster response time",
    ],
  },
  {
    _id: "premium",
    name: "Premium",
    price: 30,
    credits: 1000,
    features: [
      "1000 text generations",
      "500 image generations",
      "24/7 VIP support",
      "Access to premium models",
      "Dedicated account manager",
    ],
  },
];

// colors taken from the screenshot
const C = {
  page: "#1b1b1b",
  card: "#212121",
  border: "#2e2e2e",
  text: "#f5f5f4",
  muted: "#a3a3a3",
  feature: "#b5b5b5",
  link: "#6ea8fe",
  blue: "#4d8dff",
};

const YEARLY_DISCOUNT = 0.17;
const money = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

/* Line-art plant icon: more branches as the plan level goes up */
function PlantIcon({ level }) {
  const rows = { 1: [40], 2: [34, 48], 3: [28, 40, 52] }[level] || [40];
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 64 64"
      fill="none"
      stroke={C.text}
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="32" cy="10" r="7" />
      <circle cx="32" cy="10" r="2.5" />
      <line x1="32" y1="17" x2="32" y2="60" />
      {rows.map((sy) =>
        [-1, 1].map((s) => (
          <g key={`${sy}-${s}`}>
            <line x1="32" y1={sy} x2={32 + s * 11} y2={sy - 9} />
            <circle cx={32 + s * 13.3} cy={sy - 10.9} r="3" />
          </g>
        )),
      )}
    </svg>
  );
}

/* Monthly / Yearly pill shown on the middle card */
function BillingToggle({ yearly, onChange }) {
  const base = {
    border: "1px solid transparent",
    background: "transparent",
    color: C.muted,
    borderRadius: 999,
    padding: "3px 12px",
    fontSize: 12.5,
    lineHeight: 1.4,
    whiteSpace: "nowrap",
  };
  const active = { ...base, border: "1px solid #bdbdbd", color: "#fff" };

  return (
    <div
      className="d-inline-flex align-items-center"
      style={{
        background: "#121212",
        border: `1px solid ${C.border}`,
        borderRadius: 999,
        padding: 3,
      }}
    >
      <button
        type="button"
        aria-pressed={!yearly}
        style={!yearly ? active : base}
        onClick={() => onChange(false)}
      >
        Monthly
      </button>
      <button
        type="button"
        aria-pressed={yearly}
        style={yearly ? active : base}
        onClick={() => onChange(true)}
      >
        Yearly · <span style={{ color: C.blue }}>Save 17%</span>
      </button>
    </div>
  );
}

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [credits, setCredits] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    axios
      .get(`${API_URL}/api/credit/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) setCredits(res.data.credits);
      })
      .catch(() => {});
  }, []);

  const handleSelect = async (plan) => {
    const token = getToken();
    if (!token) {
      setMessage({ type: "error", text: "Please sign in on the home page first." });
      return;
    }
    if (paying) return;

    setPaying(true);
    setMessage({ type: "", text: "" });
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Could not load Razorpay. Check your internet connection.");

      // 1) backend creates the Razorpay order
      const { data } = await axios.post(
        `${API_URL}/api/credit/purchase`,
        { planId: plan._id, billing: yearly ? "yearly" : "monthly" },
        { headers },
      );
      if (!data.success) throw new Error(data.message);

      // 2) open Razorpay checkout
      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,
        name: "MernGPT",
        description: `${plan.name} plan`,
        theme: { color: "#4d8dff" },
        handler: async (response) => {
          // 3) after payment, backend verifies signature and adds credits
          try {
            const verify = await axios.post(
              `${API_URL}/api/credit/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers },
            );
            if (!verify.data.success) throw new Error(verify.data.message);
            setCredits(verify.data.credits);
            setMessage({ type: "success", text: "Payment successful! Credits added to your account." });
            setTimeout(() => navigate("/"), 1500);
          } catch (error) {
            setMessage({
              type: "error",
              text: error.response?.data?.message || error.message || "Payment verification failed.",
            });
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });

      rzp.on("payment.failed", (response) => {
        setMessage({ type: "error", text: response.error?.description || "Payment failed. Please try again." });
        setPaying(false);
      });

      rzp.open();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || error.message || "Something went wrong.",
      });
      setPaying(false);
    }
  };

  return (
    <section
      className="min-vh-100 py-5"
      style={{ background: C.page, color: C.text }}
    >
      <div className="container">
        {credits !== null && (
          <p className="text-center mb-3" style={{ color: C.muted }}>
            You have <strong style={{ color: C.text }}>{credits}</strong> credits left
          </p>
        )}
        {message.text && (
          <div
            className="text-center mb-4"
            style={{ color: message.type === "success" ? "#7ee787" : "#ff7b72" }}
            role="status"
          >
            {message.text}
          </div>
        )}

        <h2
          className="text-center fw-normal"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 30,
            marginBottom: 36,
          }}
        >
          Plans that grow with you
        </h2>

        <div className="row g-3 justify-content-center">
          {plans.map((plan, index) => {
            const isFirst = index === 0;
            const prev = index > 0 ? plans[index - 1].name : null;
            const shown = yearly
              ? plan.price * (1 - YEARLY_DISCOUNT)
              : plan.price;

            return (
              <div key={plan._id} className="col-12 col-md-9 col-lg-4">
                <div
                  className="h-100 d-flex flex-column rounded-4 overflow-hidden"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  {/* top section */}
                  <div style={{ padding: 24 }}>
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
                      <PlantIcon level={index + 1} />
                      {index === 1 && (
                        <BillingToggle yearly={yearly} onChange={setYearly} />
                      )}
                    </div>

                    <h3
                      className="m-0"
                      style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.2 }}
                    >
                      {plan.name}
                    </h3>
                    <p
                      style={{
                        color: C.muted,
                        fontSize: 14.5,
                        margin: "4px 0 26px",
                      }}
                    >
                      {plan.credits} credits
                    </p>

                    <div
                      className="d-flex align-items-center flex-wrap gap-2"
                      style={{ marginBottom: 18 }}
                    >
                      <span
                        style={{ fontSize: 28, fontWeight: 500, lineHeight: 1 }}
                      >
                        ₹{money(shown)}
                      </span>
                      <span
                        style={{
                          color: C.muted,
                          fontSize: 12,
                          lineHeight: 1.25,
                        }}
                      >
                        INR / month
                        <br />
                        billed {yearly ? "yearly" : "monthly"}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn w-100"
                      onClick={() => handleSelect(plan)}
                      disabled={paying}
                      style={{
                        background: isFirst ? "#404040" : "#eeeeee",
                        color: isFirst ? "#f0f0f0" : "#1f1f1f",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 12px",
                        fontSize: 15,
                        fontWeight: 500,
                      }}
                    >
                      {paying ? "Please wait..." : `Get ${plan.name} plan`}
                    </button>
                    <div
                      className="text-center"
                      style={{ color: C.muted, fontSize: 12.5, marginTop: 8 }}
                    >
                      No commitment · Cancel anytime
                    </div>
                  </div>

                  {/* divider + features */}
                  <div
                    className="flex-grow-1"
                    style={{ borderTop: `1px solid ${C.border}`, padding: 24 }}
                  >
                    {prev && (
                      <p
                        style={{
                          color: C.feature,
                          fontSize: 14.5,
                          marginBottom: 8,
                        }}
                      >
                        {index === 1
                          ? `Everything in ${prev} and:`
                          : `Everything in ${prev}, plus:`}
                      </p>
                    )}
                    <ul className="list-unstyled m-0 d-flex flex-column gap-2">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="d-flex align-items-start gap-2"
                          style={{
                            color: C.feature,
                            fontSize: 14.5,
                            lineHeight: 1.35,
                          }}
                        >
                          <Check
                            size={16}
                            color={C.muted}
                            className="flex-shrink-0"
                            style={{ marginTop: 2 }}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center" style={{ marginTop: 28 }}>
          <a
            href="#"
            className="d-inline-flex align-items-center gap-1"
            style={{ color: C.link, fontSize: 14.5, textDecoration: "none" }}
          >
            <span style={{ textDecoration: "underline" }}>
              See Team and Enterprise plans
            </span>
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
