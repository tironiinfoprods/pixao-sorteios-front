// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { SelectionContext } from "./selectionContext";
import HomePage from "./HomePage";
import NumbersPage from "./NumbersPage";
import AccountPage from "./AccountPage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

import { AuthProvider } from "./authContext";
import ProtectedRoute from "./ProtectedRoute";
import NonAdminRoute from "./NonAdminRoute";
import AdminRoute from "./AdminRoute";

import AdminDashboard from "./AdminDashboard";
import AdminSorteios from "./AdminSorteios";
import AdminClientes from "./AdminClientes";
import AdminVencedores from "./AdminVencedores";
import AdminUsersPage from "./AdminUsersPage";
import DrawBoardPage from "./DrawBoardPage";
import AdminOpenDrawBuyers from "./AdminOpenDrawBuyers";
import InfoproductsPage from "./InfoproductsPage.jsx";

import PrivacyPolicy from './PrivacyPolicy';
import TermsOfUse from './TermsOfUse';
import ResponsibleGaming from './ResponsibleGaming'; // <-- Jogo Responsável

// ⬇️ NOVO: lista os e-books por seções (categorias)
import Infoprodutos from "./Infoprodutos";

export default function App() {
  const [selecionados, setSelecionados] = React.useState([]);
  const limparSelecao = React.useCallback(() => setSelecionados([]), []);

  return (
    <AuthProvider>
      <SelectionContext.Provider value={{ selecionados, setSelecionados, limparSelecao }}>
        <BrowserRouter>
          <Routes>
            {/* HOME (não-admin) */}
            <Route
              path="/"
              element={
                <NonAdminRoute>
                  <HomePage />
                </NonAdminRoute>
              }
            />

            {/* NOVO: catálogo de e-books por categoria/ seção */}
            <Route
              path="/infoprodutos"
              element={
                <NonAdminRoute>
                  <Infoprodutos />
                </NonAdminRoute>
              }
            />

            {/* TABELA DE NÚMEROS em tela separada (não-admin) */}
            <Route
              path="/numeros"
              element={
                <NonAdminRoute>
                  <NumbersPage />
                </NonAdminRoute>
              }
            />

            <Route path="/cadastro" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* CONTA: autenticado e não-admin */}
            <Route
              path="/conta"
              element={
                <ProtectedRoute>
                  <NonAdminRoute>
                    <AccountPage />
                  </NonAdminRoute>
                </ProtectedRoute>
              }
            />

            {/* ADMIN (somente admin) */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/sorteios"
              element={
                <AdminRoute>
                  <AdminSorteios />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/clientes"
              element={
                <AdminRoute>
                  <AdminClientes />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/vencedores"
              element={
                <AdminRoute>
                  <AdminVencedores />
                </AdminRoute>
              }
            />
            <Route path="/admin/AdminClientesUser" element={<AdminUsersPage />} />
            <Route path="/me/draw/:id" element={<DrawBoardPage />} />
            <Route path="/admin/sorteiosAtivos" element={<AdminOpenDrawBuyers />} />
            <Route path="/admin/infoproducts" element={<InfoproductsPage />} />

            {/* Páginas estáticas */}
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos" element={<TermsOfUse />} />
        <Route path="/jogo-responsavel" element={<ResponsibleGaming />} />
          </Routes>
        </BrowserRouter>
      </SelectionContext.Provider>
    </AuthProvider>
  );
}
