import supabase from "../lib/supabase";

export default function Layout({ user, children }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // simple reset
  };

  return (
    <div>
      {/* TOP BAR */}
      <div style={styles.topbar}>
        <div>LinkUp</div>

        <div style={styles.right}>
          <span style={styles.user}>
            {user?.email || "User"}
          </span>

          <button onClick={handleLogout} style={styles.logout}>
            Log out
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}

const styles = {
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #eee",
    background: "#fff"
  },

  right: {
    display: "flex",
    gap: "10px",
    alignItems: "center"
  },

  user: {
    fontSize: "14px",
    color: "#555"
  },

  logout: {
    padding: "6px 10px",
    border: "none",
    borderRadius: "8px",
    background: "#ff3b30",
    color: "white",
    cursor: "pointer"
  }
};