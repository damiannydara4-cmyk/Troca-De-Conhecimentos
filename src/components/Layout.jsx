import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

/* Ao trocar de tela, volta ao topo da página */
function RolarParaOTopo() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/* Moldura comum a todas as telas: cabeçalho, conteúdo (<Outlet />) e rodapé */
export default function Layout() {
  return (
    <div className="app-page">
      <RolarParaOTopo />
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}