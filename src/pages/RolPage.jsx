import React from "react";
import { Routes, Route } from "react-router-dom";
import RolList from "../components/Rol/RolList";
import RolForm from "../components/Rol/RolForm";

/**
 * 📄 RolPage
 * Página wrapper para el CRUD de Roles
 */
export default function RolPage() {
    return (
        <Routes>
            <Route index element={<RolList />} />
            <Route path="create" element={<RolForm />} />
            <Route path="edit/:id" element={<RolForm />} />
        </Routes>
    );
}
