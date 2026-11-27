import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Copy, Volume2, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import Sidebar from "./components/Sidebar.jsx";
import MobileNav from "./components/MobileNav.jsx";
import TopBar from "./components/TopBar.jsx";
import Hero from "./components/Hero.jsx";
import PromptBox from "./components/PromptBox.jsx";
import QuickLinks from "./components/QuickLinks.jsx";
import ActionCards from "./components/ActionCards.jsx";
import SignInModel from "./SignInModel.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

const API_URL = import.meta.env.VITE_API_URL;

// token is saved in localStorage as a JSON string (see SignInModel.jsx)
function getToken() {
  try {
    return JSON.parse(localStorage.getItem("token")) || null;
  } catch {
    return null;
  }
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.msg ||
    error?.message ||
    "Something went wrong"
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hdg, setHdg] = useState("What do you want to know?");
  const [placeholder, setPlaceholder] = useState("Do anything...");
  const [show, setShow] = useState(false);
  const [text, setText] = useState("");

  // chats come from the backend: [{ _id, name, messages: [{ role, content, isImage, timestamp }] }]
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null); // null = new chat
  const [sending, setSending] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState(""); // shown while AI is answering

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    picture: "",
  });

  const handleClose = () => setShow(false);
  const handleOpen = () => setShow(true);

  // load chat history from backend when the page opens
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    axios
      .get(`${API_URL}/api/chat/get`, { headers: authHeaders() })
      .then((res) => {
        if (res.data.success) {
          setChats(res.data.chats || []);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((error) => toast.error(getErrorMessage(error)));
  }, []);

  const activeChat = chats.find((c) => c._id === activeId) || null;
  const messages = activeChat ? activeChat.messages : [];
  const hidebox = messages.length === 0 && !pendingPrompt; // true = show Hero + ActionCards
  const threads = chats.map((c) => ({ id: c._id, title: c.name }));

  function handleNewChat() {
    setActiveId(null);
    setText("");
    setMenuOpen(false);
  }

  function handleSelectThread(id) {
    setActiveId(id);
    setText("");
    setMenuOpen(false);
  }

  async function handleDeleteThread(id) {
    try {
      const res = await axios.post(
        `${API_URL}/api/chat/delete`,
        { chatId: id },
        { headers: authHeaders() },
      );
      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }
      setChats((prev) => prev.filter((c) => c._id !== id));
      if (id === activeId) setActiveId(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function handleSend() {
    const prompt = text.trim();
    if (!prompt || sending) return;

    // must be signed in to chat
    if (!getToken()) {
      setShow(true);
      return;
    }

    setSending(true);
    setPendingPrompt(prompt);
    setText("");

    try {
      // 1) make a new chat on the server if none is open
      let chatId = activeId;
      if (!chatId) {
        const created = await axios.get(`${API_URL}/api/chat/create`, {
          headers: authHeaders(),
        });
        if (!created.data.success) throw new Error(created.data.message);

        const newChat = created.data.chat;
        chatId = newChat._id;
        setChats((prev) => [newChat, ...prev]);
        setActiveId(chatId);
      }

      // 2) send the prompt; backend saves both messages and returns the updated chat
      const res = await axios.post(
        `${API_URL}/api/message/text`,
        { chatId, prompt },
        { headers: authHeaders() },
      );
      if (!res.data.success) throw new Error(res.data.message);

      const updated = res.data.chat;
      setChats((prev) => [
        updated,
        ...prev.filter((c) => c._id !== updated._id),
      ]);
    } catch (error) {
      setText(prompt); // give the text back so the user can try again
      toast.error(getErrorMessage(error));
    } finally {
      setPendingPrompt("");
      setSending(false);
    }
  }

  return (
    <div className="px-shell">
      <Sidebar
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        threads={threads}
        activeId={activeId}
        onNewChat={handleNewChat}
        onSelectThread={handleSelectThread}
        onDeleteThread={handleDeleteThread}
      />
      <MobileNav
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        show={menuOpen}
        onShow={() => setMenuOpen(true)}
        onHide={() => setMenuOpen(false)}
      />

      <GoogleOAuthProvider clientId="1074742899256-phh24ibpo2826v6mdn9i248lclv0b7gk.apps.googleusercontent.com">
        <SignInModel
          handleOpen={handleOpen}
          handleClose={handleClose}
          show={show}
          setShow={setShow}
          setUserInfo={setUserInfo}
          userInfo={userInfo}
        />
      </GoogleOAuthProvider>

      <div className="px-main">
        <TopBar />

        {/* Chat messages */}
        {!hidebox && (
          <div className="container py-4" style={{ maxWidth: 820 }}>
            <div className="d-flex flex-column gap-4">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={m._id || i} className="d-flex justify-content-end">
                    <div
                      className="bg-secondary bg-opacity-25 text-light rounded-4 px-3 py-2"
                      style={{ maxWidth: "75%", whiteSpace: "pre-wrap" }}
                    >
                      {m.isImage ? (
                        <img src={m.content} alt="" style={{ maxWidth: "100%" }} />
                      ) : (
                        m.content
                      )}
                    </div>
                  </div>
                ) : (
                  <div key={m._id || i} className="d-flex flex-column gap-2">
                    {m.isImage ? (
                      <img src={m.content} alt="" style={{ maxWidth: "100%" }} />
                    ) : (
                      <p
                        className="mb-0 text-light"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {m.content}
                      </p>
                    )}
                    <div className="d-flex gap-3 text-secondary">
                      <Copy
                        size={16}
                        role="button"
                        onClick={() => navigator.clipboard?.writeText(m.content)}
                      />
                      <Volume2 size={16} role="button" />
                      <ThumbsUp size={16} role="button" />
                      <ThumbsDown size={16} role="button" />
                      <RefreshCw size={16} role="button" />
                    </div>
                  </div>
                ),
              )}

              {/* message being sent, before the server replies */}
              {pendingPrompt && (
                <>
                  <div className="d-flex justify-content-end">
                    <div
                      className="bg-secondary bg-opacity-25 text-light rounded-4 px-3 py-2"
                      style={{ maxWidth: "75%", whiteSpace: "pre-wrap" }}
                    >
                      {pendingPrompt}
                    </div>
                  </div>
                  <p className="mb-0 text-secondary">Thinking...</p>
                </>
              )}
            </div>
          </div>
        )}

        <main className="px-content">
          <div className="px-content-inner">
            {hidebox && <Hero hdg={hdg} />}
            <PromptBox
              userInfo={userInfo}
              setUserInfo={setUserInfo}
              handleOpen={handleOpen}
              setHdg={setHdg}
              setPlaceholder={setPlaceholder}
              placeholder={placeholder}
              handleClick={handleSend}
              setText={setText}
              text={text}
              hidebox={hidebox}
            />
            <QuickLinks />

            {hidebox && <ActionCards />}
          </div>
        </main>
      </div>
    </div>
  );
}
