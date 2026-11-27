import { Offcanvas } from "react-bootstrap";
import { List, PersonCircle } from "react-bootstrap-icons";
import Logo from "./Logo.jsx";
import navItems from "./navItems.js";
import { useEffect } from "react";

export default function MobileNav({
  show,
  onShow,
  onHide,
  setUserInfo,
  userInfo,
}) {
  useEffect(() => {
    let data = JSON.parse(localStorage.getItem("profile"));

    setUserInfo(data);
  }, []);
  return (
    <>
      <header className="px-mobile-bar">
        <button className="px-icon-btn" onClick={onShow} aria-label="Open menu">
          <List size={24} />
        </button>
        <Logo />
        <button className="px-icon-btn" aria-label="Sign in">
          <PersonCircle size={22} />
        </button>
      </header>

      <Offcanvas
        show={show}
        onHide={onHide}
        className="px-offcanvas"
        data-bs-theme="dark"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title as="span">
            <Logo />
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column">
          {navItems.map(({ id, label, Icon }) => (
            <button key={id} className="px-off-item" onClick={onHide}>
              <Icon size={20} /> {label}
            </button>
          ))}
          <div className="flex-grow-1" />
          <button className="px-off-item" style={{ color: "var(--px-accent)" }}>
            <PersonCircle size={20} />{" "}
            {userInfo?.name === "" ? "Sign In" : userInfo?.name}
          </button>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
