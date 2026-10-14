import React from 'react';

export default function ConhecimentoOferecido({ conhecimento = "asas", onVer }) {
  return (
    <div className="co-page">
      <style>{css}</style>
      <main className="co-card" role="status">
        <svg className="co-icone" width="44" height="44" viewBox="0 0 24 24" aria-hidden="true"
          fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 13 9 19 20 4" />
        </svg>
        <h1>Conhecimento oferecido!</h1>
        <p>
          Sua oferta de <strong>{conhecimento}</strong> foi publicada e já está visível para a comunidade.
        </p>
        <button type="button" className="btn co-btn" onClick={onVer}>Ver área de conhecimentos</button>
      </main>
    </div>
  );
}

const css = `
@import url("https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap");
.co-page{min-height:100vh;display:grid;place-items:center;padding:1.5rem;background:#F8FAFC;color:#111827;font-family:"Caveat","Segoe Print",cursive}
.co-card{width:100%;max-width:420px;background:#fff;border:2px solid #111827;box-shadow:0 0 0 1px #E5E7EB;padding:3.2rem 3rem;text-align:center}
.co-icone{display:block;margin:0 auto 2.2rem}
.co-card h1{font-size:2.2rem;font-weight:700;margin:0 0 1.2rem}
.co-card p{font-size:1.15rem;line-height:1.7;margin:0 0 1.6rem}
.co-card strong{font-weight:700}
.co-btn{display:block;width:100%;background:#A3E635;color:#111827;border:2px solid #111827;border-radius:0;padding:1rem;font-family:inherit;font-size:1.2rem;font-weight:700}
.co-btn:hover{background:#8FD11F;color:#111827;border-color:#111827}
.co-btn:focus-visible{outline:3px solid #111827;outline-offset:3px}
`;
