import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import supabase from "../lib/supabase";
import Layout from "../components/Layout";

const TOTAL_USERS = 6;

export default function CalendarPage() {
  const [user, setUser] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [mode, setMode] = useState("view");
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);
  const [removeConfirm, setRemoveConfirm] = useState(null);

  // ---------------- GET USER ----------------
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    getUser();
  }, []);

  // ---------------- FETCH ----------------
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("availability")
      .select(`
        id,
        date,
        user_id,
        user:profiles(username)
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
        fetchData
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (!user) return <div style={styles.loading}>Loading...</div>;

  // ---------------- TOGGLE DAYS ----------------
  const toggleDay = (date) => {
    const day = date.toISOString().split("T")[0];

    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  // ---------------- CLICK DAY ----------------
  const handleDayClick = (date) => {
    const day = date.toISOString().split("T")[0];

    if (mode === "view") {
      const users = getUsersForDay(date);

      setSelectedDayInfo({
        date: day,
        users,
        count: users.length,
      });

      return;
    }

    if (mode === "add") {
      toggleDay(date);
      return;
    }

    if (mode === "remove") {
      setRemoveConfirm(day);
    }
  };

  // ---------------- CONFIRM ADD ----------------
  const confirmAvailability = async () => {
    const payload = selectedDays.map((day) => ({
      user_id: user.id,
      date: day,
    }));

    const { error } = await supabase
      .from("availability")
      .insert(payload);

    if (error) {
      alert(error.message);
      return;
    }

    setSelectedDays([]);
    fetchData();
  };

  // ---------------- CONFIRM REMOVE ----------------
  const confirmRemove = async () => {
    if (!removeConfirm) return;

    const { error } = await supabase
      .from("availability")
      .delete()
      .eq("user_id", user.id)
      .eq("date", removeConfirm);

    if (error) {
      alert(error.message);
      return;
    }

    setRemoveConfirm(null);
    fetchData();
  };

  const cancelRemove = () => setRemoveConfirm(null);

  // ---------------- USERS PER DAY ----------------
  const getUsersForDay = (date) => {
    const day = date.toISOString().split("T")[0];

    return availability
      .filter((a) => a.date === day)
      .map((a) => a.user?.username)
      .filter(Boolean);
  };

  // ---------------- COLOR (GREEN IF >=1) ----------------
  const getColor = (date) => {
    const count = getUsersForDay(date).length;

    if (count >= 1) return "greenday";
    return "";
  };

  return (
    <Layout user={user}>
      <div style={styles.page}>
        <div style={styles.card}>

          {/* HEADER */}
          <div style={styles.header}>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setMode("view")} style={btn(mode === "view")}>View</button>
              <button onClick={() => setMode("add")} style={btn(mode === "add")}>Add</button>
              <button onClick={() => setMode("remove")} style={btn(mode === "remove")}>Remove</button>
            </div>
          </div>

          {/* CONFIRM */}
          {mode === "add" && (
            <button onClick={confirmAvailability} style={styles.confirm}>
              Confirm Availability
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
              const count = getUsersForDay(date);

              if (count.length === 0) return null;

              return (
                <div style={styles.cellContent}>
                  {/* NUMBER BADGE */}
                  <div style={styles.countBadge}>
                    {count.length}
                  </div>

                  {/* MINI AVATARS */}
                  <div style={styles.avatarRow}>
                    {count.slice(0, 3).map((u, i) => (
                      <div key={i} style={styles.avatar}>
                        {u.slice(0, 2).toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          />

        </div>
      </div>

      {/* VIEW POPUP */}
      {selectedDayInfo && (
        <div style={styles.modalOverlay} onClick={() => setSelectedDayInfo(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedDayInfo.date}</h3>
            <p>{selectedDayInfo.count} available</p>

            {selectedDayInfo.users.map((u, i) => (
              <div key={i} style={styles.userRow}>{u}</div>
            ))}

            <button onClick={() => setSelectedDayInfo(null)} style={styles.closeBtn}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* REMOVE CONFIRM */}
      {removeConfirm && (
        <div style={styles.modalOverlay} onClick={cancelRemove}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Remove availability?</h3>
            <p><b>{removeConfirm}</b></p>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={confirmRemove} style={styles.deleteBtn}>Remove</button>
              <button onClick={cancelRemove} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

// ---------------- BUTTON ----------------
const btn = (active) => ({
  padding: "8px 10px",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  background: active ? "#007aff" : "#eee",
  color: active ? "#fff" : "#000"
});

// ---------------- STYLES ----------------
const styles = {
page: {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f5f5f7",
  padding: 20
},

card: {
  width: 460,
  background: "#fff",
  padding: 20,
  borderRadius: 24,
  boxShadow: "0 10px 40px rgba(0,0,0,0.08)",

  display: "flex",
  flexDirection: "column",
  alignItems: "center",  
  gap: 12
},

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  confirm: {
    width: "100%",
    margin: "10px 0",
    padding: 10,
    border: "none",
    borderRadius: 12,
    background: "#34c759",
    color: "#fff",
    fontWeight: 600
  },

  cellContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 2
  },

  countBadge: {
    fontSize: 10,
    fontWeight: 700,
    background: "#007aff",
    color: "#fff",
    borderRadius: 999,
    padding: "2px 6px",
    marginBottom: 2
  },

  avatarRow: {
    display: "flex",
    gap: 2
  },

  avatar: {
    width: 16,
    height: 16,
    fontSize: 8,
    borderRadius: "50%",
    background: "#34c759",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  greenday: {
    background: "rgba(52, 199, 89, 0.18)",
    borderRadius: 10
  },

  userRow: {
    padding: 6,
    background: "#f2f2f7",
    marginTop: 6,
    borderRadius: 8
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  modal: {
    background: "#fff",
    padding: 20,
    borderRadius: 16,
    width: 300
  },

  closeBtn: {
    marginTop: 10,
    width: "100%",
    padding: 8,
    border: "none",
    borderRadius: 10,
    background: "#007aff",
    color: "#fff"
  },

  deleteBtn: {
    flex: 1,
    padding: 10,
    border: "none",
    borderRadius: 10,
    background: "#ff3b30",
    color: "#fff"
  },

  cancelBtn: {
    flex: 1,
    padding: 10,
    border: "none",
    borderRadius: 10,
    background: "#eee"
  },

  loading: {
    padding: 20,
    textAlign: "center"
  }
};