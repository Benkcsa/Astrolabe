// Svelte action: make a <textarea> grow downwards to fit its content.
export function autogrow(node: HTMLTextAreaElement) {
  const resize = () => {
    node.style.height = 'auto';
    node.style.height = node.scrollHeight + 'px';
  };

  // Measure once styles/layout are applied. A single rAF can fire before the
  // element has its final width (e.g. inside a freshly created grid row), which
  // makes an empty textarea report a too-tall scrollHeight. Two frames settle it.
  requestAnimationFrame(() => {
    resize();
    requestAnimationFrame(resize);
  });

  node.addEventListener('input', resize);

  // Recompute if the element's width changes (pane resize, layout settling).
  let ro: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined') {
    let lastWidth = node.clientWidth;
    ro = new ResizeObserver(() => {
      if (node.clientWidth !== lastWidth) {
        lastWidth = node.clientWidth;
        resize();
      }
    });
    ro.observe(node);
  }

  return {
    update: resize,
    destroy() {
      node.removeEventListener('input', resize);
      ro?.disconnect();
    }
  };
}
