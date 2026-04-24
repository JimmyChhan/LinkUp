import { useEffect, useState } from "react";
import supabase from "./lib/supabase";
import Login from "./pages/Login";
import CalendarPage from "./pages/CalendarPage";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user || null);
  };

  if (!user) return <Login />;

  return <CalendarPage user={user} />;
}