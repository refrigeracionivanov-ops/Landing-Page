import { useState } from 'react';
import type { FaqBloque } from '../../../tipos';

interface Props {
  bloque: FaqBloque;
}

function Item({ pregunta, respuesta }: { pregunta: string; respuesta: string }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4 ca-foco"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
      >
        <span className="font-semibold text-slate-900 text-base">{pregunta}</span>
        <svg
          className={`size-5 text-blue-600 shrink-0 transition-transform ${abierto ? 'rotate-45' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
      {abierto && (
        <p className="pb-5 text-slate-500 leading-relaxed">{respuesta}</p>
      )}
    </div>
  );
}

export default function Faq({ bloque }: Props) {
  return (
    <section id="ca-preguntas" className="bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-8">
        {bloque.titulo && (
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-10 text-center">
            {bloque.titulo}
          </h2>
        )}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6">
          {bloque.preguntas?.map((p) => (
            <Item key={p._key} pregunta={p.pregunta} respuesta={p.respuesta} />
          ))}
        </div>
      </div>
    </section>
  );
}
