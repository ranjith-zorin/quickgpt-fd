import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../api";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import MobileNumber from "./components/MobileNumber";
import CheckOtp from "./components/CheckOTP";
export default function SignInModal({
  handleOpen,
  handleClose,
  show,
  setShow,
  userInfo,
  setUserInfo,
}) {
  const [email, setEmail] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    console.log("Continue with email:", email);
  };

  const responseGoogle = async (authResult) => {
    console.log("Authorization code:", authResult);
    try {
      if (authResult["code"]) {
        const result = await googleAuth(authResult["code"]);
        console.log("result ", result);
        const userobj = result?.data?.user;
        const token = result?.data?.token;

        const { name, email, picture } = result?.data?.user;
        {
          window.location.reload();
          localStorage.setItem("profile", JSON.stringify(userobj));
          localStorage.setItem("token", JSON.stringify(token));
        }
      }
    } catch (error) {
      console.error("Error while requesting google code :", error);
    }
  };
  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  const [mobile, setMobile] = useState({});

  function handleShow(arg) {
    setShowOtp(arg);
  }
  return (
    <>
      {showOtp ? (
        <CheckOtp closebtn={handleShow}></CheckOtp>
      ) : (
        <Modal
          animation={false}
          show={show}
          onHide={handleClose}
          centered
          dialogClassName="signin-dialog"
          contentClassName="signin-content"
          backdropClassName="signin-backdrop"
        >
          <button
            type="button"
            className="signin-x"
            aria-label="Close"
            onClick={handleClose}
          >
            ×
          </button>

          <Modal.Body className="signin-body">
            <h2 className="signin-title">Sign in to create Projects</h2>
            <p className="signin-sub">
              Set instructions, organize sources, and collaborate with
              coworkers.
            </p>

            <div className="signin-actions">
              <button
                type="button"
                className="signin-btn signin-google"
                onClick={googleLogin}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    fill="#202124"
                    d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
                  />
                </svg>
                Continue with  Google
              </button>

              <MobileNumber defaultCountry="IN" handleShow={handleShow} />
              <button type="button" className="signin-btn signin-apple">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 384 512"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
                  />
                </svg>
                Continue with Apple
              </button>
            </div>

            <hr className="signin-divider" />

            <Form onSubmit={handleEmailSubmit} className="signin-form">
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="signin-input"
              />
              <button
                type="submit"
                className="signin-btn signin-email"
                disabled={!email.trim()}
              >
                Continue with email
              </button>
            </Form>

            <button type="button" className="signin-sso">
              Single sign-on (SSO)
            </button>

            <button
              type="button"
              className="signin-close"
              onClick={handleClose}
            >
              Close
            </button>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
}
