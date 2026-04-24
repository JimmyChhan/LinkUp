export default function Layout({ children, user }) {
  const handleLogout = () => {
    window.location.reload(); // resets session
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <header style={styles.header}>
          <div>
            <h1>LinkUp</h1>
            <p style={{ fontSize: "12px", color: "#888" }}>
              {user.username}
            </p>
          </div>

          <button onClick={handleLogout} style={styles.logout}>
            Log out
          </button>
        </header>

        {children}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "20px" },
  container: { maxWidth: "900px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px"
  },
  logout: {
    padding: "8px 10px",
    border: "none",
    borderRadius: "10px",
    background: "#ff3b30",
    color: "white",
    cursor: "pointer"
  }
};