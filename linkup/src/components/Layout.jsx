export default function Layout({ children, user }) {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>LinkUp</h1>
            <p style={styles.subtitle}>Shared availability calendar</p>
          </div>

          <div style={styles.user}>
            {user?.username}
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f6f8",
    display: "flex",
    justifyContent: "center",
    padding: "20px"
  },
  container: {
    width: "100%",
    maxWidth: "900px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700"
  },
  subtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#666"
  },
  user: {
    background: "#fff",
    padding: "8px 12px",
    borderRadius: "10px",
    fontSize: "14px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  }
};