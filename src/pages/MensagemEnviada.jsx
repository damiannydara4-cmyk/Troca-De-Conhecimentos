import React from 'react';

export default function MensagemEnviada({ email = "dasds@fsdd", onVoltar }) {
  return (
    <div className="me-page">
      <style>{css}</style>
      <main className="me-card" role="status">
        {/* Envelope em lilás #DDD6FE */}
        <svg className="me-icone" width="52" height="38" viewBox="0 0 52 38" aria-hidden="true">
          <rect x="1" y="1" width="50" height="36" rx="4" fill="#DDD6FE" />
          <path d="M3 5 26 22 49 5" fill="none" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1>Mensagem enviada!</h1>
        <p>
          Nossa equipe entrará em contato em até 2 dias úteis no e-mail <strong>{email}</strong>.
        </p>
        <button type="button" className="btn me-btn" onClick={onVoltar}>Voltar ao início</button>
      </main>
    </div>
  );
}

const css = `
@import url("https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap");
.me-page{min-height:100vh;display:grid;place-items:center;padding:1.5rem;background:#F8FAFC;color:#111827;font-family:"Caveat","Segoe Print",cursive}
.me-card{width:100%;max-width:420px;background:#fff;border:2px solid #111827;box-shadow:0 0 0 1px #E5E7EB;padding:3.2rem 3rem;text-align:center}
.me-icone{display:block;margin:0 auto 2.2rem}
.me-card h1{font-size:2.2rem;font-weight:700;margin:0 0 1.2rem}
.me-card p{font-size:1.15rem;line-height:1.7;margin:0 0 1.6rem}
.me-card strong{font-weight:700}
.me-btn{display:block;width:100%;background:#A3E635;color:#111827;border:2px solid #111827;border-radius:0;padding:1rem;font-family:inherit;font-size:1.2rem;font-weight:700}
.me-btn:hover{background:#8FD11F;color:#111827;border-color:#111827}
.me-btn:focus-visible{outline:3px solid #111827;outline-offset:3px}
`;
