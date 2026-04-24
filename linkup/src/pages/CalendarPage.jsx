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

  // 👇 DELETE CONFIRM STATE
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ---------------- USER ----------------
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
  }, []);

  // ---------------- FETCH ----------------
  const fetchData = async () => {
    const { data } = await supabase
      .from("availability")
      .select(`
        id,
        date,
        user_id,
        user:profiles(username)
      `);

    setAvailability(data || []);
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

  // ---------------- LOGIC ----------------
  const toggleDay = (date) => {
    const day = date.toISOString().split("T")[0];

    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const handleDayClick = (date) => {
    const day = date.toISOString().split("T")[0];

    if (mode === "view") {
      const users = getUsersForDay(date);

      setSelectedDayInfo({
        date: day,
        users,
        count: users.length
      });
      return;
    }

    if (mode === "add") {
      toggleDay(date);
      return;
    }

    // ✅ REMOVE MODE → ask confirmation instead of deleting instantly
    if (mode === "remove") {
      setDeleteConfirm(day);
    }
  };

  const confirmAvailability = async () => {
    const payload = selectedDays.map((day) => ({
      user_id: user.id,
      date: day
    }));

    const { error } = await supabase
      .from("availability")
      .insert(payload);

    if (!error) {
      setSelectedDays([]);
      fetchData();
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    await supabase
      .from("availability")
      .delete()
      .eq("user_id", user.id)
      .eq("date", deleteConfirm);

    setDeleteConfirm(null);
    fetchData();
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const getUsersForDay = (date) => {
    const day = date.toISOString().split("T")[0];

    return availability
      .filter((a) => a.date === day)
      .map((a) => a.user?.username)
      .filter(Boolean);
  };

  const getColor = (date) => {
    const count = getUsersForDay(date).length;
    if (count >= 1) return "green-day";
    return "";
  };

  // ---------------- UI ----------------
  return (
    <div style={styles.background}>
      <Layout user={user}>
        <div style={styles.page}>
          <div style={styles.card}>

            {/* HEADER */}
            <div style={styles.header}>
              <div style={styles.modes}>
                <button onClick={() => setMode("view")} style={btn(mode === "view")}>View</button>
                <button onClick={() => setMode("add")} style={btn(mode === "add")}>Add</button>
                <button onClick={() => setMode("remove")} style={btn(mode === "remove")}>Remove</button>
              </div>
            </div>

            {/* CONFIRM ADD */}
            {mode === "add" && (
              <button onClick={confirmAvailability} style={styles.confirm}>
                Confirm Availability
              </button>
            )}

            {/* CALENDAR */}
            <div style={styles.calendarWrapper}>
              <Calendar
                onClickDay={handleDayClick}
                tileClassName={({ date }) => {
                  const day = date.toISOString().split("T")[0];
                  if (selectedDays.includes(day)) return "selected";
                  return getColor(date);
                }}
                tileContent={({ date }) => {
                  const users = getUsersForDay(date);
                  const count = users.length;

                  if (count === 0) return null;

                  return (
                    <div style={styles.tileContent}>
                      <div style={styles.countBadge}>{count}</div>

                      <div style={styles.initialsRow}>
                        {users.slice(0, 2).map((u, i) => (
                          <span key={i} style={styles.initials}>
                            {u.slice(0, 2).toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
            </div>

          </div>
        </div>
      </Layout>

      {/* ================= VIEW MODAL ================= */}
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

      {/* ================= DELETE CONFIRM MODAL ================= */}
      {deleteConfirm && (
        <div style={styles.modalOverlay} onClick={cancelDelete}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

            <h3>Remove Date?</h3>
            <p>Are you sure you want to remove:</p>

            <div style={{ fontWeight: "bold", margin: "10px 0" }}>
              {deleteConfirm}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={cancelDelete} style={styles.cancelBtn}>
                Cancel
              </button>

              <button onClick={confirmDelete} style={styles.deleteBtn}>
                Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
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
  background: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(-45deg, #f5f5f7, #e8ecf3, #fff, #f9f9f9)",
    backgroundSize: "400% 400%"
  },

  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  card: {
    width: 460,
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(10px)",
    padding: 20,
    borderRadius: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14
  },

  header: {
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },

  modes: {
    display: "flex",
    gap: 6
  },

  calendarWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },

  confirm: {
    width: "100%",
    padding: 10,
    border: "none",
    borderRadius: 12,
    background: "#34c759",
    color: "#fff",
    fontWeight: 600
  },

  tileContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    marginTop: 2
  },

  countBadge: {
    fontSize: 10,
    fontWeight: 700,
    background: "#007aff",
    color: "#fff",
    borderRadius: 999,
    padding: "2px 6px"
  },

  initialsRow: {
    display: "flex",
    gap: 3
  },

  initials: {
    width: 14,
    height: 14,
    fontSize: 8,
    borderRadius: "50%",
    background: "#34c759",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
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

  cancelBtn: {
    flex: 1,
    padding: 8,
    border: "none",
    borderRadius: 10,
    background: "#ddd",
    cursor: "pointer"
  },

  deleteBtn: {
    flex: 1,
    padding: 8,
    border: "none",
    borderRadius: 10,
    background: "#ff3b30",
    color: "#fff",
    cursor: "pointer"
  },

  loading: {
    padding: 20,
    textAlign: "center"
  }
};