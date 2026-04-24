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
    .maybeSingle();

  if (error) {
    console.log(error);
    return;
  }

  if (!data) {
    alert("Invalid login");
    return;
  }

  setUser(data);
};

  return (
    <div>
      <h2>Link-Up</h2>
      <input onChange={e => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleLogin}>Log In</button>
    </div>
  );
}