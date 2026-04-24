import { useState } from "react";
import supabase from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) alert(error.message);
  };

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) alert(error.message);
    else alert("Check your email to confirm signup");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={{ textAlign: "center" }}>Link-Up Calendar</h2>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.button}>
          Log In
        </button>

        <button onClick={handleSignup} style={styles.secondary}>
          Sign Up
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f7"
  },
  card: {
    width: "320px",
    padding: "20px",
    borderRadius: "16px",
    background: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  input: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ddd"
  },
  button: {
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    background: "#007aff",
    color: "white",
    cursor: "pointer"
  },
  secondary: {
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    background: "#eee",
    cursor: "pointer"
  }
};