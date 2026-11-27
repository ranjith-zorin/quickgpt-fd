import { useState, useEffect } from "react";
import Collapse from "react-bootstrap/Collapse";
import { useNavigate } from "react-router-dom";
import {
  LayoutSidebar,
  PersonCircle,
  Search,
  ChevronDown,
  ChevronRight,
  Columns,
  Trash,
} from "react-bootstrap-icons";
import Logo from "./Logo.jsx";
import navItems from "./navItems.js";

export default function Sidebar({
  setShow,
  userInfo,
  setUserInfo,
  threads = [],
  activeId = null,
  onNewChat,
  onSelectThread,
  onDeleteThread,
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [recentsOpen, setRecentsOpen] = useState(true);

  useEffect(() => {
    let data = JSON.parse(localStorage.getItem("profile"));
    setUserInfo(data === null ? userInfo : data);
  }, []);

  // threads come from App.jsx: [{ id, title }] (newest first)
  const recentList = threads;

  return (
    <aside className={`px-rail ${open ? "is-open" : ""}`} aria-label="Primary">
      {!open && (
        <button
          className="px-icon-btn mb-3"
          aria-label="Open sidebar"
          title="Open sidebar"
          onClick={() => setOpen(true)}
        >
          <LayoutSidebar size={18} />
        </button>
      )}
      {/* Expanded header: logo + search + toggle */}
      {open && (
        <div className="px-rail-head">
          <Logo />
          <div className="px-rail-spacer" />
          <button className="px-icon-btn" aria-label="Search" title="Search">
            <Search size={16} />
          </button>
          <button
            className="px-icon-btn"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            onClick={() => setOpen(false)}
          >
            <LayoutSidebar size={16} />
          </button>
        </div>
      )}

      {/* Nav (icons only when collapsed, icon + label when expanded) */}
      <nav className="px-rail-nav">
        {navItems.map(({ id, label, Icon }) => (
          <button
            key={id}
            className="px-icon-btn"
            title={label}
            aria-label={label}
            onClick={() => {
              // "New thread" starts a fresh chat with an empty prompt box
              if (label.toLowerCase().includes("new") && onNewChat) {
                onNewChat();
              }
            }}
          >
            <Icon size={20} />
            {open && <span className="px-rail-label">{label}</span>}
          </button>
        ))}
      </nav>

      {/* Expanded-only sections */}
      {open && (
        <div className="px-rail-sections">
          <button
            className="px-rail-section-btn"
            onClick={() => setProjectsOpen((v) => !v)}
            aria-expanded={projectsOpen}
          >
            <span>Projects</span>
            <ChevronDown
              size={14}
              className={projectsOpen ? "" : "px-rail-flip"}
            />
          </button>
          <Collapse in={projectsOpen}>
            <div>
              <p className="px-rail-empty">No projects</p>
            </div>
          </Collapse>

          <button
            className="px-rail-section-btn"
            onClick={() => setRecentsOpen((v) => !v)}
            aria-expanded={recentsOpen}
          >
            <span>Recents</span>
            <ChevronDown
              size={14}
              className={recentsOpen ? "" : "px-rail-flip"}
            />
          </button>
          <Collapse in={recentsOpen}>
            <div>
              {recentList.length === 0 ? (
                <p className="px-rail-empty">No recent sessions</p>
              ) : (
                <ul
                  className="list-unstyled m-0"
                  style={{ maxHeight: "40vh", overflowY: "auto" }}
                >
                  {recentList.map((thread) => (
                    <li
                      key={thread.id}
                      className={`d-flex align-items-center rounded-2 ${
                        thread.id === activeId
                          ? "bg-secondary bg-opacity-25"
                          : ""
                      }`}
                    >
                      <button
                        type="button"
                        title={thread.title}
                        onClick={() =>
                          onSelectThread && onSelectThread(thread.id)
                        }
                        className="btn flex-grow-1 text-start text-truncate border-0 shadow-none px-2 py-2"
                        style={{ color: "#d4d4d4", fontSize: 14, minWidth: 0 }}
                      >
                        {thread.title}
                      </button>
                      <button
                        type="button"
                        aria-label="Delete chat"
                        title="Delete chat"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDeleteThread) onDeleteThread(thread.id);
                        }}
                        className="btn border-0 shadow-none px-2 py-2 flex-shrink-0"
                        style={{ color: "#8a8a8a" }}
                      >
                        <Trash size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Collapse>
        </div>
      )}

      <div className="px-rail-spacer" />

      {/* Collapsed: toggle button at the bottom (click to open) */}
      {!open && (
        <button
          className="px-icon-btn mb-3"
          aria-label="Open sidebar"
          title="Open sidebar"
          onClick={() => setOpen(true)}
        >
          <LayoutSidebar size={18} />
        </button>
      )}

      {/* Expanded: View plans pill */}
      {open && (
        <button className="px-rail-plans" onClick={() => navigate("/pricing")}>
          <Columns size={12} />
          View plans
        </button>
      )}

      <button className="px-signin">
        {userInfo?.name === "" ? (
          <PersonCircle size={22} />
        ) : (
          <img
            src={userInfo?.picture}
            alt={userInfo?.picture}
            width="22px"
            height="22px"
            className="rounded-5"
          />
        )}

        <span className="px-rail-signin-text">
          {userInfo?.name === "" ? "Sign In" : userInfo?.name}
        </span>
        {open && <ChevronRight size={12} className="px-rail-chev" />}
      </button>
      {userInfo?.name !== "" && (
        <button
          className="btn btn-danger py-0 px-1"
          style={{ fontSize: 12 }}
          onClick={() => {
            localStorage.removeItem("profile");
            localStorage.removeItem("token");
            window.location.reload();
          }}
        >
          Logout
        </button>
      )}
    </aside>
  );
}
