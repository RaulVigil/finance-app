import "./App.css";
import "./index.css";
import AppRouter from "./Routers/AppRouters";
import { AuthProvider } from "./Services/AuthContext"; // ✅

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
