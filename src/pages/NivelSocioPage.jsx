import React from "react";
import { Routes, Route } from "react-router-dom";
import NivelSocioList from "../components/NivelSocio/NivelSocioList";
import NivelSocioForm from "../components/NivelSocio/NivelSocioForm";

export default function NivelSocioPage() {
    return (
        <Routes>
            <Route index element={<NivelSocioList />} />
            <Route path="create" element={<NivelSocioForm />} />
            <Route path="edit/:id" element={<NivelSocioForm />} />
        </Routes>
    );
}
