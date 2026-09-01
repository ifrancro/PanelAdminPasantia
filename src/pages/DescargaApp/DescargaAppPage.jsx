/**
 * 📲 DescargaAppPage
 * Landing pública para descargar la app móvil de Expande (Flutter).
 *
 * Ruta: /expande/app/descarga-oficial
 * - Pública: NO requiere autenticación (la abre quien escanea el QR).
 * - Aislada del panel: no usa AuthContext, layout ni Tailwind del panel;
 *   sus estilos viven en DescargaAppPage.css con el prefijo .expdl-.
 *
 * Para actualizar los enlaces de las tiendas basta con cambiar STORE_LINKS.
 */
import React, { useEffect } from "react";
import logoExpande from "../../assets/expande-logo.png";
import iconoExpande from "../../assets/expande-icono.png";
import "./DescargaAppPage.css";

const STORE_LINKS = {
  ios: "https://apps.apple.com/?itscg=10000&itsct=app-appstore-nav-200918",
  android: "https://play.google.com/apps/testing/com.nutritionclubs.app",
};

export default function DescargaAppPage() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Descargar la app | EXPANDE";
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className="expdl-page">
      <main className="expdl-card">
        <div className="expdl-logo">
          <img src={logoExpande} alt="EXPANDE" />
        </div>

        <div className="expdl-hero">
          <span className="expdl-blob expdl-blob-1" />
          <span className="expdl-blob expdl-blob-2" />
          <div className="expdl-phone">
            <div className="expdl-screen">
              <img src={iconoExpande} alt="" />
            </div>
          </div>
          <div className="expdl-dl-badge" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#12263f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
          </div>
        </div>

        <h1 className="expdl-title">
          Descargar la app
          <br />
          en <span className="expdl-accent">tu dispositivo</span>
        </h1>
        <p className="expdl-subtitle">
          Expande te acompaña en cada paso.
          <br />
          Descarga la app y aprovecha todas sus funcionalidades.
        </p>

        <div className="expdl-stores">
          <a
            className="expdl-store-btn expdl-ios"
            href={STORE_LINKS.ios}
            rel="noopener noreferrer"
          >
            <span className="expdl-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#12263f" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.365 1.43c0 1.14-.47 2.28-1.24 3.11-.83.9-2.18 1.6-3.29 1.51-.13-1.1.42-2.27 1.16-3.02.83-.86 2.28-1.5 3.37-1.6zM20.5 17.02c-.55 1.27-.81 1.84-1.52 2.96-.99 1.56-2.39 3.5-4.12 3.51-1.54.02-1.94-1-4.03-.99-2.09.01-2.53 1.01-4.07.98-1.73-.02-3.05-1.77-4.04-3.33C-.06 15.9-.31 11.3 1.7 8.86c1-1.28 2.58-2.03 4.06-2.03 1.51 0 2.46 1 3.71 1 1.21 0 1.95-1 3.7-1 1.32 0 2.72.72 3.71 1.96-3.26 1.79-2.73 6.45.42 8.02z" />
              </svg>
            </span>
            <span className="expdl-label">
              <small>Descargar en</small>
              <strong>App Store</strong>
            </span>
            <span className="expdl-chev">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </a>

          <a
            className="expdl-store-btn expdl-android"
            href={STORE_LINKS.android}
            rel="noopener noreferrer"
          >
            <span className="expdl-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#57b947" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.6 9.48l1.84-3.18c.16-.28.06-.64-.22-.8a.6.6 0 0 0-.82.22l-1.86 3.23a11.4 11.4 0 0 0-9.08 0L5.6 5.72a.6.6 0 0 0-.82-.22c-.28.16-.38.52-.22.8L6.4 9.48A10.8 10.8 0 0 0 1 18h22a10.8 10.8 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
              </svg>
            </span>
            <span className="expdl-label">
              <small>Descargar en</small>
              <strong>Google Play</strong>
            </span>
            <span className="expdl-chev">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </a>
        </div>

        <div className="expdl-security">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>Tu seguridad es importante. Descarga desde tiendas oficiales.</span>
        </div>

        <div className="expdl-footer">© 2026 EXPANDE. Todos los derechos reservados.</div>
      </main>
    </div>
  );
}
