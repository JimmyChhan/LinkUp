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
        <h2 style={styles.title}>Link-Up Calendar</h2>

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

// ---------------- STYLES ----------------
const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    // smooth gray premium gradient
    background: "linear-gradient(-45deg, #0b0b0b, #1a1a1a, #2a2a2a, #f2f2f2)",
    backgroundSize: "400% 400%",
    animation: "gradientMove 12s ease infinite"
  },

  card: {
    width: "340px",
    padding: "22px",
    borderRadius: "18px",

    // glass effect
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",

    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",

    display: "flex",
    flexDirection: "column",
    gap: "12px",

    color: "rgba(255,255,255,0.95)"
  },

  title: {
    textAlign: "center",
    marginBottom: "6px",
    fontWeight: 600
  },

  input: {
    padding: "12px",
    borderRadius: "10px",

    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(0,0,0,0.35)",

    color: "white",
    fontSize: "14px",
    outline: "none"
  },

  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",

    background: "linear-gradient(90deg, #3a3a3a, #6a6a6a)",
    color: "white",

    cursor: "pointer",
    fontWeight: 600
  },

  secondary: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    cursor: "pointer"
  }
};