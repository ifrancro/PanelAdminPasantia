/**
 * 📄 SoportePage.jsx
 * Página wrapper para tickets de soporte
 */
import React from "react";
import { Routes, Route } from "react-router-dom";
import SoporteList from "../components/Soporte/SoporteList";
import SoporteDetail from "../components/Soporte/SoporteDetail";

export default function SoportePage() {
    return (
        <Routes>
            <Route index element={<SoporteList />} />
            <Route path=":id" element={<SoporteDetail />} />
        </Routes>
    );
}
