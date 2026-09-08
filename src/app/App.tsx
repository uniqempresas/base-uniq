import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { ModulosProvider } from "./contexts/ModulosContext";

export default function App() {
  return (
    <AuthProvider>
      <ModulosProvider>
        <RouterProvider router={router} />
      </ModulosProvider>
    </AuthProvider>
  );
}
