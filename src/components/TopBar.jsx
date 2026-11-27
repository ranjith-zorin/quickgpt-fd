import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Display, List } from "react-bootstrap-icons";

const API_URL = import.meta.env.VITE_API_URL;

export default function TopBar() {
  const navigate = useNavigate();
  const [credits, setCredits] = useState(null);

  useEffect(() => {
    let token = null;
    try {
      token = JSON.parse(localStorage.getItem("token"));
    } catch {
      token = null;
    }
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

  return (
    <div className="px-topbar">
      <button className="px-link" onClick={() => navigate("/pricing")}>
        Usage{credits !== null && ` · ${credits} credits`}
      </button>
      <button className="px-link" aria-label="Display"><Display size={16} /></button>
      <button className="px-link" aria-label="Menu"><List size={18} /></button>
    </div>
  );
}
