// A prévia da investigação, na entrada e no hub do jogo (D-155): a Praça do
// Mural ao anoitecer, desenhada em SVG com os tokens do palco. É leve de
// propósito: nenhum pacote 3D chega antes de a pessoa decidir jogar. O que
// está aqui é uma representação, sem rosto de ninguém e sem cor de partido.

interface PracaPreviewProps {
  className?: string;
  /** Com `true`, a figura não recebe nome para leitores de tela: quem a usa já descreveu ao lado. */
  decorative?: boolean;
}

export function PracaPreview({ className = "", decorative = false }: PracaPreviewProps) {
  return (
    <svg
      viewBox="0 0 640 400"
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : "A Praça do Mural ao anoitecer: um coreto, a Câmara ao fundo, o mural com notas pregadas e um poste aceso. É uma representação."}
      focusable="false"
      data-previa-da-praca
    >
      <defs>
        <linearGradient id="previa-ceu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#111613" />
          <stop offset="0.65" stopColor="#1c2a2c" />
          <stop offset="1" stopColor="#2a3c3b" />
        </linearGradient>
        <radialGradient id="previa-luz" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f0c66b" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#f0c66b" stopOpacity="0.14" />
          <stop offset="1" stopColor="#f0c66b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Céu e horizonte */}
      <rect width="640" height="400" fill="url(#previa-ceu)" />
      <g fill="#faf8f2" opacity="0.7">
        <circle cx="72" cy="48" r="1.4" />
        <circle cx="150" cy="30" r="1" />
        <circle cx="236" cy="62" r="1.2" />
        <circle cx="398" cy="28" r="1" />
        <circle cx="470" cy="66" r="1.5" />
        <circle cx="560" cy="40" r="1" />
        <circle cx="610" cy="84" r="1.2" />
        <circle cx="320" cy="90" r="0.9" />
      </g>
      <circle cx="548" cy="70" r="22" fill="#faf8f2" opacity="0.9" />

      {/* Casario ao fundo */}
      <g>
        <rect x="0" y="178" width="70" height="62" fill="#2b3a37" />
        <rect x="70" y="190" width="58" height="50" fill="#33433d" />
        <rect x="128" y="172" width="66" height="68" fill="#2b3a37" />
        <rect x="452" y="186" width="62" height="54" fill="#33433d" />
        <rect x="514" y="176" width="70" height="64" fill="#2b3a37" />
        <rect x="584" y="190" width="56" height="50" fill="#33433d" />
        <g fill="#f0c66b" opacity="0.55">
          <rect x="18" y="196" width="8" height="10" />
          <rect x="44" y="196" width="8" height="10" />
          <rect x="146" y="192" width="8" height="10" />
          <rect x="172" y="192" width="8" height="10" />
          <rect x="470" y="204" width="8" height="10" />
          <rect x="534" y="196" width="8" height="10" />
          <rect x="560" y="196" width="8" height="10" />
          <rect x="602" y="208" width="8" height="10" />
        </g>
      </g>

      {/* A Câmara: quatro colunas, frontão e escadaria */}
      <g>
        <rect x="236" y="150" width="168" height="90" fill="#3b4a46" />
        <polygon points="226,152 320,118 414,152" fill="#4c5c57" />
        <g fill="#e7e0cf">
          <rect x="252" y="158" width="10" height="82" />
          <rect x="288" y="158" width="10" height="82" />
          <rect x="342" y="158" width="10" height="82" />
          <rect x="378" y="158" width="10" height="82" />
        </g>
        <rect x="306" y="196" width="28" height="44" fill="#1c241e" />
        <rect x="232" y="240" width="176" height="6" fill="#d9cfb8" />
        <rect x="240" y="246" width="160" height="6" fill="#cfc4ab" />
      </g>

      {/* O chão da praça: calçada e a rua em volta */}
      <rect x="0" y="252" width="640" height="148" fill="#2d3833" />
      <path d="M0 262 Q160 254 320 262 T640 262 V400 H0 Z" fill="#3a4740" />
      <g stroke="#1c241e" strokeWidth="4" fill="none" opacity="0.5">
        <path d="M0 300 Q80 288 160 300 T320 300 T480 300 T640 300" />
        <path d="M0 344 Q80 332 160 344 T320 344 T480 344 T640 344" />
      </g>

      {/* Ipês: amarelo e roxo, as cores das árvores da praça */}
      <g>
        <rect x="88" y="252" width="6" height="40" fill="#5a4330" />
        <circle cx="91" cy="236" r="30" fill="#b9aedb" />
        <rect x="548" y="250" width="6" height="42" fill="#5a4330" />
        <circle cx="551" cy="234" r="32" fill="#f0c66b" opacity="0.9" />
      </g>

      {/* O coreto: base, colunas e telhado */}
      <g>
        <polygon points="180,318 460,318 440,336 200,336" fill="#4a5750" />
        <polygon points="196,318 444,318 420,290 220,290" fill="#5a675f" />
        <g fill="#e7e0cf">
          <rect x="222" y="290" width="6" height="28" />
          <rect x="262" y="286" width="6" height="32" />
          <rect x="372" y="286" width="6" height="32" />
          <rect x="412" y="290" width="6" height="28" />
        </g>
        <polygon points="204,290 320,252 436,290" fill="#8a5a3b" />
        <polygon points="226,290 320,262 414,290" fill="#a66f4a" />
      </g>

      {/* O mural: quadro de cortiça com as perguntas e as notas com carimbo */}
      <g>
        <rect x="24" y="268" width="150" height="70" rx="2" fill="#6e4f3a" />
        <rect x="30" y="274" width="138" height="58" fill="#d9b981" />
        <g fill="#faf8f2">
          <rect x="38" y="280" width="18" height="22" transform="rotate(-3 47 291)" />
          <rect x="62" y="282" width="18" height="22" />
          <rect x="86" y="280" width="18" height="22" transform="rotate(2 95 291)" />
          <rect x="110" y="282" width="18" height="22" />
          <rect x="134" y="280" width="18" height="22" transform="rotate(-2 143 291)" />
        </g>
        <g fill="#faf8f2">
          <rect x="38" y="306" width="18" height="22" />
          <rect x="62" y="306" width="18" height="22" transform="rotate(2 71 317)" />
          <rect x="86" y="306" width="18" height="22" />
        </g>
        <g fill="none" stroke="#2f6f73" strokeWidth="2">
          <circle cx="51" cy="321" r="4" />
          <circle cx="75" cy="321" r="4" />
          <circle cx="99" cy="321" r="4" />
        </g>
        <rect x="28" y="338" width="6" height="40" fill="#6e4f3a" />
        <rect x="164" y="338" width="6" height="40" fill="#6e4f3a" />
      </g>

      {/* O poste aceso, iluminando o mural */}
      <g>
        <circle cx="200" cy="262" r="60" fill="url(#previa-luz)" />
        <rect x="198" y="266" width="4" height="100" fill="#1c241e" />
        <circle cx="200" cy="262" r="9" fill="#f0c66b" />
        <circle cx="200" cy="262" r="4" fill="#faf8f2" />
      </g>

      {/* A banca de jornal, à direita */}
      <g>
        <rect x="474" y="296" width="66" height="60" fill="#3e7676" />
        <rect x="468" y="290" width="78" height="8" fill="#e7e0cf" />
        <rect x="480" y="322" width="54" height="22" fill="#1f3a3a" />
        <g fill="#faf8f2">
          <rect x="484" y="304" width="12" height="14" />
          <rect x="500" y="304" width="12" height="14" />
          <rect x="516" y="304" width="12" height="14" />
        </g>
      </g>

      {/* Quem joga: a repórter, de fone e gravador, sem rosto de ninguém */}
      <g transform="translate(316 338)">
        <ellipse cx="0" cy="30" rx="14" ry="4" fill="#1c241e" opacity="0.5" />
        <rect x="-8" y="0" width="16" height="22" rx="7" fill="#2f6f73" />
        <rect x="-6" y="20" width="5" height="10" rx="2" fill="#3a3a44" />
        <rect x="1" y="20" width="5" height="10" rx="2" fill="#3a3a44" />
        <circle cx="0" cy="-8" r="8" fill="#c98c63" />
        <path d="M-8 -8 a8 8 0 0 1 16 0" fill="#2b1d16" />
        <rect x="-10" y="-1" width="20" height="4" rx="2" fill="#f0c66b" />
        <rect x="9" y="6" width="5" height="8" rx="1" fill="#f0c66b" />
      </g>
    </svg>
  );
}
