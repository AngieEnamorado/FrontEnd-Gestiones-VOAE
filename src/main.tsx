import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { UserProvider } from "./context/UserContext";
import { ProcadProvider } from "./context/ProcadContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <ProcadProvider>
          <App />
        </ProcadProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
);
