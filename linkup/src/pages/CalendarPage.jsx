import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import supabase from "../lib/supabase";
import Layout from "../components/Layout";

export default function CalendarPage({ user }) {
  const [availability, setAvailability] = useState([]);

  const fetchData = async () => {
    const { data } = await supabase
      .from("availability")
      .select(`
        date,
        user:users(username)
      `);

    setAvailability(data || []);
  };

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

  const addAvailability = async (date) => {
    const day = date.toISOString().split("T")[0];

    await supabase.from("availability").insert({
      user_id: user.id,
      date: day
    });
  };

  const getUsersForDay = (date) => {
    const day = date.toISOString().split("T")[0];

    return availability
      .filter(a => a.date === day)
      .map(a => a.user.username);
  };

  const getColor = (date) => {
    const count = getUsersForDay(date).length;

    if (count === 6) return "green";
    if (count >= 3) return "orange";
    return null;
  };

  const getInitials = (name) => {
    return name.slice(0, 2).toUpperCase();
  };

return (
  <Layout user={user}>
    <div style={{ background: "#fff", padding: "20px", borderRadius: "16px" }}>
      
      <Calendar
        onClickDay={addAvailability}
        tileClassName={({ date }) => getColor(date)}
        tileContent={({ date }) => {
          const users = getUsersForDay(date);

          if (users.length < 3) return null;

          return (
            <div style={styles.names}>
              {users.map((u, i) => (
                <span key={i} style={styles.badge}>
                  {u.slice(0, 2).toUpperCase()}
                </span>
              ))}
            </div>
          );
        }}
      />

    </div>
  </Layout>
);
}

const styles = {
  names: {
    display: "flex",
    gap: "4px",
    marginTop: "4px",
    flexWrap: "wrap",
    justifyContent: "center"
  },
  badge: {
    fontSize: "10px",
    background: "#eee",
    padding: "2px 5px",
    borderRadius: "6px"
  }
};