import { useState } from "react";
import Login from "./pages/Login";
import CalendarPage from "./pages/CalendarPage";

function App() {
  const [user, setUser] = useState(null);

  return user ? (
    <CalendarPage user={user} />
  ) : (
    <Login setUser={setUser} />
  );
}

export default App;