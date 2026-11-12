import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GithubRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    if (!code) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:8080/auth/github/doLogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("login failed");
        return res.json();
      })
      .then((payload: {data: { token: string; nickname: string }}) => {
        localStorage.setItem("token", payload.data.token);
        localStorage.setItem("nickname", payload.data.nickname);
        navigate("/main");
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  return <div>깃헙 로그인 진행중...</div>;
}
