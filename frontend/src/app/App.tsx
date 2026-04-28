import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { apiFetch } from "./api";

function App() {
  useEffect(() => {
    apiFetch("/health")
      .then((data) => console.log("Backend connected:", data))
      .catch((error) => console.error("Backend error:", error));
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
