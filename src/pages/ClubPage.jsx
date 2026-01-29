/**
 * 📄 ClubPage.jsx
 * Página wrapper para el módulo de Clubes
 * Maneja las rutas anidadas: lista y detalle
 */
import React from "react";
import { Routes, Route } from "react-router-dom";
import ClubList from "../components/Club/ClubList";
import ClubDetail from "../components/Club/ClubDetail";

export default function ClubPage() {
    return (
        <Routes>
            {/* Lista de clubes */}
            <Route index element={<ClubList />} />

            {/* Detalle de un club (para ver, aprobar, rechazar) */}
            <Route path=":id" element={<ClubDetail />} />
        </Routes>
    );
}
