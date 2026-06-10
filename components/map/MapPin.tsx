import { CATEGORIES, type Category } from "@/types";

/**
 * 카카오맵 CustomOverlay에 들어가는 핀 DOM 엘리먼트 생성.
 * show/hide는 display가 아닌 opacity + scale 트랜지션으로 처리한다 (스펙).
 */
export function createPinElement(
  cat: Category,
  onClick: () => void,
): HTMLElement {
  const el = document.createElement("button");
  el.type = "button";
  el.setAttribute("aria-label", CATEGORIES[cat].label);
  el.style.cssText = [
    "width:30px",
    "height:30px",
    "border-radius:50% 50% 50% 4px",
    `background:${CATEGORIES[cat].color}`,
    "border:2px solid #FFFFFF",
    "box-shadow:0 2px 6px rgba(0,0,0,0.25)",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "font-size:14px",
    "cursor:pointer",
    "transform:rotate(-45deg) scale(1)",
    "transition:opacity 0.2s, transform 0.2s",
    "opacity:1",
  ].join(";");

  const emoji = document.createElement("span");
  emoji.textContent = CATEGORIES[cat].emoji;
  emoji.style.transform = "rotate(45deg)";
  el.appendChild(emoji);

  el.addEventListener("click", onClick);
  return el;
}

export function setPinVisible(el: HTMLElement, visible: boolean) {
  el.style.opacity = visible ? "1" : "0";
  el.style.transform = visible
    ? "rotate(-45deg) scale(1)"
    : "rotate(-45deg) scale(0.5)";
  el.style.pointerEvents = visible ? "auto" : "none";
}

/** 내 위치 표시용 파란 점 */
export function createMyLocationElement(): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText = [
    "width:14px",
    "height:14px",
    "border-radius:50%",
    "background:#3B82F6",
    "border:3px solid #FFFFFF",
    "box-shadow:0 0 0 4px rgba(59,130,246,0.25)",
  ].join(";");
  return el;
}
