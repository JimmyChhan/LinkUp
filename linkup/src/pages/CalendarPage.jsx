import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import supabase from "../lib/supabase";
import Layout from "../components/Layout";

export default function CalendarPage({ user }) {
  const [availability, setAvailability] = useState([]);
  const [mode, setMode] = useState(true);

  // ---------------- FETCH ----------------
  const fetchData = async () => {
    const { data } = await supabase
      .from("availability")
      .select(`
        id,
        date,
        user_id,
        user:users(username)
      `);

    setAvailability(data || []);
  };

  // ---------------- REALTIME ----------------
  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("availability")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "availability" },
        () => fetchData()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ---------------- ADD ----------------
  const addAvailability = async (date) => {
    const day = date.toISOString().split("T")[0];

    await supabase.from("availability").insert({
      user_id: user.id,
      date: day
    });
  };

  // ---------------- REMOVE ----------------
  const removeAvailability = async (date) => {
    const day = date.toISOString().split("T")[0];

    await supabase
      .from("availability")
      .delete()
      .eq("user_id", user.id)
      .eq("date", day);
  };

  // ---------------- CLICK DAY ----------------
  const handleDayClick = async (date) => {
    if (mode) {
      await addAvailability(date);
    } else {
      await removeAvailability(date);
    }
  };

  // ---------------- HELPERS ----------------
  const getUsersForDay = (date) => {
    const day = date.toISOString().split("T")[0];

    return availability
      .filter(a => a.date === day)
      .map(a => a.user?.username);
  };

  const getColor = (date) => {
    const count = getUsersForDay(date).length;

    if (count === 6) return "full";
    if (count >= 3) return "mid";
    if (count >= 1) return "low";
    return "none";
  };

  // ---------------- UI ----------------
  return (
    <Layout user={user}>
      <div style={styles.page}>
        <div style={styles.card}>

          {/* HEADER */}
          <div style={styles.header}>
            <div>
              <h2>Availability</h2>
              <p style={{ fontSize: "12px", color: "#888" }}>
                {mode ? "Select days you're available" : "Select days you're NOT available"}
              </p>
            </div>

            <button
              onClick={() => setMode(!mode)}
              style={{
                ...styles.toggle,
                background: mode ? "#2ecc71" : "#ff3b30"
              }}
            >
              {mode ? "ADD" : "REMOVE"}
            </button>
          </div>

          {/* CALENDAR */}
          <Calendar
            onClickDay={handleDayClick}
            tileClassName={({ date }) => getColor(date)}
          />

        </div>
      </div>
    </Layout>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f7"
  },

  card: {
    width: "420px",
    background: "#fff",
    padding: "18px",
    borderRadius: "24px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
  },

  toggle: {
    padding: "8px 10px",
    border: "none",
    borderRadius: "10px",
    color: "white",
    cursor: "pointer"
  }
};