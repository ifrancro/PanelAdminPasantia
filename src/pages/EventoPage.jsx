/**
 * 📄 EventoPage.jsx
 * Página wrapper para eventos
 */
import React from "react";
import { Routes, Route } from "react-router-dom";
import EventoList from "../components/Evento/EventoList";
import EventoForm from "../components/Evento/EventoForm";

export default function EventoPage() {
    return (
        <Routes>
            <Route index element={<EventoList />} />
            <Route path="create" element={<EventoForm />} />
            <Route path="edit/:id" element={<EventoForm />} />
        </Routes>
    );
}
