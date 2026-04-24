import { useEffect, useState } from "react";
import supabase from "./lib/supabase";
import Login from "./pages/Login";
import CalendarPage from "./pages/CalendarPage";

export default function App() {

  const [user, setUser] = useState(null);

  if (!user) {

    return <Login setUser={setUser} />;

  }
  return <CalendarPage user={user} />;

  // 🔐 Load session on refresh
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };

    getSession();

    // 👂 Listen to login/logout changes
    const { data } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => data.subscription.unsubscribe();
  }, []);

  if (!user) return <Login />;

  return <CalendarPage user={user} />;
}