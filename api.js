import axios from "axios";

const api = axios.create({
  baseURL: "https://quickgpt-s0gi.onrender.com",
});

export const googleAuth = (code) => api.get(`/auth/google?code=${code}`);
