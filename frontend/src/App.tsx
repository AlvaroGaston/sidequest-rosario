import { BrowserRouter, Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { QuestsPage } from "./pages/QuestsPage";
import { QuestDetailPage } from "./pages/QuestDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminPage } from "./pages/admin/AdminPage";
import { QuestFormPage } from "./pages/admin/QuestFormPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="quests" element={<QuestsPage />} />
          <Route path="quests/:id" element={<QuestDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route
            path="perfil"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute role="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/quests/new"
            element={
              <ProtectedRoute role="admin">
                <QuestFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/quests/:id/edit"
            element={
              <ProtectedRoute role="admin">
                <QuestFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/usuarios"
            element={
              <ProtectedRoute role="admin">
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
