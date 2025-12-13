import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./App";

import { GoogleOAuthProvider } from "@react-oauth/google";


const container = document.getElementById("root");
const root = createRoot(container);

const basename = "tripiazone";
const local = "";

root.render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
 
      <BrowserRouter basename={local}>
        <App />
      </BrowserRouter>

  </GoogleOAuthProvider>
);
