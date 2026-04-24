import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import supabase from "../lib/supabase";
import Layout from "../components/Layout";

export default function CalendarPage({ user }) {
  const [availability, setAvailability] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [mode, setMode] = useState("add"); // add | remove | view
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);

  // ---------------- FETCH ----------------
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("availability")
      .select(`
        id,
        date,
        user_id,
        user:users(username)
      `);

    if (!error) setAvailability(data || []);
  };

  // ---------------- REALTIME ----------------
  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("availability-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "availability" },
        () => fetchData()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ---------------- ADD SELECTION ----------------
  const toggleDay = (date) => {
    const day = date.toISOString().split("T")[0];

    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  // ---------------- CLICK DAY ----------------
  const handleDayClick = async (date) => {
    const day = date.toISOString().split("T")[0];

    // 👁️ VIEW MODE
    if (mode === "view") {
      const users = availability
        .filter((a) => a.date === day)
        .map((a) => a.user?.username);

      setSelectedDayInfo({ date: day, users });
      return;
    }

    // 🟢 ADD MODE
    if (mode === "add") {
      toggleDay(date);
      return;
    }

    // 🔴 REMOVE MODE
    const { error } = await supabase
      .from("availability")
      .delete()
      .eq("user_id", user.id)
      .eq("date", day);

    if (error) alert(error.message);

    fetchData();
  };

  // ---------------- CONFIRM ADD ----------------
  const confirmAvailability = async () => {
    if (selectedDays.length === 0) return;

    const inserts = selectedDays.map((day) => ({
      user_id: user.id,
      date: day
    }));

    const { error } = await supabase
      .from("availability")
      .insert(inserts);

    if (error) {
      alert(error.message);
      return;
    }

    setSelectedDays([]);
    fetchData();
  };

  // ---------------- USERS PER DAY ----------------
  const getUsersForDay = (date) => {
    const day = date.toISOString().split("T")[0];

    return availability
      .filter((a) => a.date === day)
      .map((a) => a.user?.username);
  };

  // ---------------- COLOR ----------------
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
              <p style={styles.subtitle}>
                Mode: {mode.toUpperCase()}
              </p>
            </div>

            {/* MODE BUTTONS */}
            <div style={{ display: "flex", gap: "6px" }}>

              <button onClick={() => setMode("add")} style={{
                ...styles.modeBtn,
                background: mode === "add" ? "#2ecc71" : "#eee"
              }}>
                ADD
              </button>

              <button onClick={() => setMode("remove")} style={{
                ...styles.modeBtn,
                background: mode === "remove" ? "#ff3b30" : "#eee"
              }}>
                REMOVE
              </button>

              <button onClick={() => setMode("view")} style={{
                ...styles.modeBtn,
                background: mode === "view" ? "#007aff" : "#eee"
              }}>
                VIEW
              </button>

            </div>
          </div>

          {/* CONFIRM */}
          {mode === "add" && (
            <button onClick={confirmAvailability} style={styles.confirm}>
              Confirm selection
            </button>
          )}

          {/* CALENDAR */}
          <Calendar
            onClickDay={handleDayClick}
            tileClassName={({ date }) => {
              const day = date.toISOString().split("T")[0];

              if (selectedDays.includes(day)) return "selected";

              return getColor(date);
            }}
            tileContent={({ date }) => {
              const users = getUsersForDay(date);

              if (users.length === 0) return null;

              return (
                <div style={styles.names}>
                  {users.map((u, i) => (
                    <span key={i} style={styles.badge}>
                      {u?.slice(0, 2).toUpperCase()}
                    </span>
                  ))}
                </div>
              );
            }}
          />

        </div>
      </div>

      {/* ---------------- VIEW POPUP ---------------- */}
      {selectedDayInfo && (
        <div style={styles.modalOverlay} onClick={() => setSelectedDayInfo(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

            <h3>{selectedDayInfo.date}</h3>

            {selectedDayInfo.users.length === 0 ? (
              <p>No one is available</p>
            ) : (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {selectedDayInfo.users.map((u, i) => (
                  <span key={i} style={styles.badge}>
                    {u?.slice(0, 2).toUpperCase()}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => setSelectedDayInfo(null)}
              style={styles.closeBtn}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}

// ---------------- STYLES ----------------
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
    alignItems: "center"
  },

  subtitle: {
    fontSize: "12px",
    color: "#888",
    margin: 0
  },

  modeBtn: {
    padding: "6px 10px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },

  confirm: {
    width: "100%",
    margin: "10px 0",
    padding: "8px 12px",
    border: "none",
    borderRadius: "10px",
    background: "#007aff",
    color: "white",
    cursor: "pointer"
  },

  names: {
    display: "flex",
    gap: "4px",
    justifyContent: "center",
    marginTop: "4px",
    flexWrap: "wrap"
  },

  badge: {
    fontSize: "9px",
    background: "rgba(0,0,0,0.08)",
    padding: "2px 5px",
    borderRadius: "6px"
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    width: "300px",
    textAlign: "center"
  },

  closeBtn: {
    marginTop: "10px",
    padding: "6px 10px",
    border: "none",
    borderRadius: "8px",
    background: "#007aff",
    color: "white",
    cursor: "pointer"
  }
};