import React from "react";
import { Routes, Route } from "react-router-dom";
import LogroList from "../components/Logro/LogroList";
import LogroForm from "../components/Logro/LogroForm";

export default function LogroPage() {
    return (
        <Routes>
            <Route index element={<LogroList />} />
            <Route path="create" element={<LogroForm />} />
            <Route path="edit/:id" element={<LogroForm />} />
        </Routes>
    );
}
