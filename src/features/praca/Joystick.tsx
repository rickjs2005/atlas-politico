"use client";

// O joystick (o mesmo desenho da Cidade do Voto): um manche redondo no canto,
// para andar no toque. Não é a única forma de andar: as setas e W A S D valem
// sempre, e sem a cena os lugares são botões.

import { useRef, useState } from "react";

export function Joystick({ onMove }: { onMove: (x: number, y: number) => void }) {
  const base = useRef<HTMLDivElement>(null);
  const [ponta, setPonta] = useState({ x: 0, y: 0 });
  const ativo = useRef<number | null>(null);
  const RAIO = 48;
  const mover = (evento: React.PointerEvent) => {
    if (ativo.current !== evento.pointerId || base.current === null) return;
    const r = base.current.getBoundingClientRect();
    let x = evento.clientX - (r.left + r.width / 2);
    let y = evento.clientY - (r.top + r.height / 2);
    const d = Math.hypot(x, y);
    if (d > RAIO) {
      x = (x / d) * RAIO;
      y = (y / d) * RAIO;
    }
    setPonta({ x, y });
    onMove(x / RAIO, -y / RAIO);
  };
  const soltar = () => {
    ativo.current = null;
    setPonta({ x: 0, y: 0 });
    onMove(0, 0);
  };
  return (
    <div
      ref={base}
      aria-hidden="true"
      data-joystick
      className="absolute bottom-8 left-8 h-32 w-32 touch-none rounded-full border-2 border-stage-ink/30 bg-stage/60 shadow-md select-none"
      onPointerDown={(evento) => {
        ativo.current = evento.pointerId;
        evento.currentTarget.setPointerCapture(evento.pointerId);
        mover(evento);
      }}
      onPointerMove={mover}
      onPointerUp={soltar}
      onPointerCancel={soltar}
    >
      <div className="absolute top-1/2 left-1/2 h-14 w-14 rounded-full bg-action/80 shadow" style={{ transform: `translate(calc(-50% + ${ponta.x}px), calc(-50% + ${ponta.y}px))` }} />
    </div>
  );
}
