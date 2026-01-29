/**
 * 📄 ProductoPage.jsx
 * Página wrapper para el catálogo de productos
 */
import React from "react";
import { Routes, Route } from "react-router-dom";
import ProductoList from "../components/Producto/ProductoList";
import ProductoForm from "../components/Producto/ProductoForm";

export default function ProductoPage() {
    return (
        <Routes>
            {/* Lista de productos */}
            <Route index element={<ProductoList />} />

            {/* Crear nuevo producto */}
            <Route path="create" element={<ProductoForm />} />

            {/* Editar producto existente */}
            <Route path="edit/:id" element={<ProductoForm />} />
        </Routes>
    );
}
