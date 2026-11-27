import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Display,
  ChevronDown,
  Grid3x3Gap,
  Mic,
  Soundwave,
} from "react-bootstrap-icons";

export default function PromptBox({
  setHdg,
  placeholder,
  setPlaceholder,
  handleOpen,
  setUserInfo,
  userInfo,
  handleClick,
  text,
  setText,
  
}) {
  const [mode, setMode] = useState("computer");
  const [bgcolor, setSetColor] = useState("#181a1d");
  useEffect(() => {
    let data = JSON.parse(localStorage.getItem("profile"));

    setUserInfo(data == null ? userInfo : data);
  }, []);
  console.log("userInfo:", userInfo);

  return (
    <div className="px-prompt" style={{ backgroundColor: `${bgcolor}` }}>
      <textarea
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label="Prompt"
        onKeyDown={(e) => {
          // Enter sends, Shift+Enter makes a new line
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleClick();
          }
        }}
      />

      <div className="px-prompt-row">
        <button className="px-icon-btn" aria-label="Add attachment">
          <Plus
            size={20}
            onClick={() => userInfo?.name === "" && handleOpen(true)}
          />
        </button>

        <div className="px-mode" role="group" aria-label="Mode">
          <button
            className={mode === "search" ? "active" : ""}
            onClick={() => {
              setMode("search");
              setPlaceholder("Ask anything...");
              setSetColor("#181a1d");
              setHdg("What do you want to know?");
            }}
          >
            <Search size={13} />{" "}
            <span className="d-none d-md-inline">Search</span>
          </button>
          <button
            className={mode === "computer" ? "active" : ""}
            onClick={() => {
              setMode("computer");
              setSetColor("#182529");

              setHdg("What should we work on?");
              setPlaceholder("Do anything...");
            }}
          >
            <Display size={14} />{" "}
            <span className="d-none d-md-inline">Computer</span>{" "}
            <ChevronDown size={10} />
          </button>
        </div>

        <div className="ms-auto d-flex align-items-center gap-2">
          <button className="px-model">
            <span className="px-model-label">Model</span>
            <ChevronDown size={10} />
          </button>
          <button className="px-icon-btn" aria-label="Dictate">
            <Mic size={16} />
          </button>
          <button className="px-send" aria-label="Voice mode">
            <Soundwave size={16} onClick={handleClick} />
          </button>
        </div>
      </div>
    </div>
  );
}
