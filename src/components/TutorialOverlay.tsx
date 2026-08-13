import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface TutorialStep {
  /** Sélecteur CSS de l'élément à surligner, ou `null` pour une étape purement explicative. */
  targetSelector: string | null;
  title: string;
  text: string;
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  step: number;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
}

const HALO_PADDING = 8;
const BUBBLE_MARGIN = 16;
const BUBBLE_WIDTH = 320;

export default function TutorialOverlay({ steps, step, onNext, onPrev, onFinish }: TutorialOverlayProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const current = steps[step];
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [bubblePos, setBubblePos] = useState({
    top: window.innerHeight / 2 - 90,
    left: window.innerWidth / 2 - BUBBLE_WIDTH / 2,
  });

  useEffect(() => {
    // requestAnimationFrame : laisse le temps à l'écran ciblé (changé au même moment) de se
    // monter avant de mesurer l'élément à surligner.
    let raf: ReturnType<typeof requestAnimationFrame>;
    let scrollRaf: ReturnType<typeof requestAnimationFrame> | null = null;
    const measure = () => {
      const el = current.targetSelector ? document.querySelector(current.targetSelector) : null;
      setRect(el?.getBoundingClientRect() ?? null);
    };
    // Amène la cible dans le champ de vision si elle est scrollée hors écran (colonne du board,
    // liste de projets…) ; le scroll déclenché ré-appelle `measure` via le listener ci-dessous.
    const scrollTargetIntoView = () => {
      if (!current.targetSelector) return;
      document.querySelector(current.targetSelector)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    };
    // rAF-throttlé : un scroll (fenêtre ou tout conteneur interne défilant, ex. la liste de
    // projets ou les colonnes du board) peut se déclencher très fréquemment.
    const onScrollOrResize = () => {
      if (scrollRaf !== null) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        measure();
      });
    };
    raf = requestAnimationFrame(() => {
      scrollTargetIntoView();
      measure();
    });
    window.addEventListener('resize', onScrollOrResize);
    // capture: true pour aussi intercepter le scroll de n'importe quel conteneur interne
    // (les événements scroll ne remontent pas via bubbling).
    window.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      cancelAnimationFrame(raf);
      if (scrollRaf !== null) cancelAnimationFrame(scrollRaf);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [current.targetSelector]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFinish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onFinish]);

  // Repositionne la bulle en fonction de sa hauteur réellement rendue (variable selon la
  // longueur du texte de chaque étape) : sous la cible si ça rentre, sinon au-dessus, toujours
  // clampée dans le viewport pour que les boutons Suivant/Précédent restent cliquables.
  useLayoutEffect(() => {
    const el = bubbleRef.current;
    if (!el) return;
    const height = el.offsetHeight;
    const width = el.offsetWidth;

    const left = rect
      ? Math.max(BUBBLE_MARGIN, Math.min(rect.left, window.innerWidth - width - BUBBLE_MARGIN))
      : window.innerWidth / 2 - width / 2;

    let top: number;
    if (!rect) {
      top = window.innerHeight / 2 - height / 2;
    } else {
      const spaceBelow = window.innerHeight - rect.bottom - BUBBLE_MARGIN;
      const spaceAbove = rect.top - BUBBLE_MARGIN;
      top = spaceBelow >= height || spaceBelow >= spaceAbove ? rect.bottom + BUBBLE_MARGIN : rect.top - BUBBLE_MARGIN - height;
    }
    top = Math.max(BUBBLE_MARGIN, Math.min(top, window.innerHeight - height - BUBBLE_MARGIN));

    setBubblePos({ top, left });
  }, [rect, current.title, current.text, step]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000 }} onClick={onFinish}>
      <div
        style={{
          position: 'fixed',
          top: rect ? rect.top - HALO_PADDING : 0,
          left: rect ? rect.left - HALO_PADDING : 0,
          width: rect ? rect.width + HALO_PADDING * 2 : 0,
          height: rect ? rect.height + HALO_PADDING * 2 : 0,
          border: rect ? '2px solid var(--color-accent)' : 'none',
          boxShadow: '0 0 0 9999px rgba(0,0,0,.6)',
          pointerEvents: 'none',
        }}
      />

      <div
        ref={bubbleRef}
        className="dialog elev-lg"
        style={{
          position: 'fixed',
          top: bubblePos.top,
          left: bubblePos.left,
          width: BUBBLE_WIDTH,
          maxHeight: `calc(100vh - ${BUBBLE_MARGIN * 2}px)`,
          overflowY: 'auto',
          padding: 16,
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          {steps.map((_, i) => (
            <span
              key={i}
              style={{
                width: 6,
                height: 6,
                background: i === step ? 'var(--color-accent)' : 'var(--color-neutral-300)',
              }}
            />
          ))}
          <span className="text-muted" style={{ fontSize: 12, marginLeft: 4 }}>
            Étape {step + 1}/{steps.length}
          </span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{current.title}</div>
        <p style={{ fontSize: 14, lineHeight: 1.5, margin: '0 0 16px' }}>{current.text}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={onFinish}>
            Passer
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button type="button" className="btn btn-secondary" onClick={onPrev}>
                Précédent
              </button>
            )}
            {step < steps.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={onNext}>
                Suivant
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={onFinish}>
                Terminer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
