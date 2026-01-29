/**
 * 📄 HubPage.jsx
 * Página wrapper para el módulo de Hubs
 */
import React from "react";
import { Routes, Route } from "react-router-dom";
import HubList from "../components/Hub/HubList";
import HubForm from "../components/Hub/HubForm";

export default function HubPage() {
    return (
        <Routes>
            {/* Lista de hubs */}
            <Route index element={<HubList />} />

            {/* Crear nuevo hub */}
            <Route path="create" element={<HubForm />} />

            {/* Editar hub existente */}
            <Route path="edit/:id" element={<HubForm />} />
        </Routes>
    );
}
