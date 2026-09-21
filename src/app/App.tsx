import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { ModulosProvider } from "./contexts/ModulosContext";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <AuthProvider>
      <ModulosProvider>
        <RouterProvider router={router} />
        {/* Container global de toasts (sonner). Sem ele, todo toast.success/toast.error
            do app é silencioso. top-center evita sobrepor os bottom-sheets do mobile. */}
        <Toaster position="top-center" />
      </ModulosProvider>
    </AuthProvider>
  );
}
