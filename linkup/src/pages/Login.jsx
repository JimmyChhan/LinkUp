import { useState } from "react";
import supabase from "../lib/supabase";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (error || !data) {
      alert("Invalid login");
      return;
    }

    setUser(data);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>LinkUp</h2>

        <input
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.button}>
          Log in
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
  gap: "10px",
  textAlign: "center"
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
    background: "#2ecc71",
    color: "white",
    cursor: "pointer"
  }
};