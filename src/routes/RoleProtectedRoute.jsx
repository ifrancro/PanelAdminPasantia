import React from "react";
import { useAuth } from "../context/AuthContext";
import { hasRole } from "../utils/roles";
import AccessDenied from "./AccessDenied";

/**
 * Autorización por rol. Requiere sesión válida (ProtectedRoute padre).
 */
export default function RoleProtectedRoute({ allowedRoles, children }) {
    const { user } = useAuth();

    if (!hasRole(user, allowedRoles)) {
        return <AccessDenied />;
    }

    return children;
}
