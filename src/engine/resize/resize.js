export function resize(w, h, minW, minH, letterbox) {
  const aspectRatio = minW / minH;
  let canvasWidth = w;
  let canvasHeight = h;

  if (letterbox) {
    if (minW < minH) {
      canvasHeight = window.innerHeight;
      canvasWidth = Math.min(
        window.innerWidth,
        minW,
        canvasHeight * aspectRatio,
      );
    } else {
      canvasWidth = window.innerWidth;
      canvasHeight = Math.min(
        window.innerHeight,
        minH,
        canvasWidth / aspectRatio,
      );
    }
  }

  const scaleX = canvasWidth < minW ? minW / canvasWidth : 1;
  const scaleY = canvasHeight < minH ? minH / canvasHeight : 1;
  const scale = scaleX > scaleY ? scaleX : scaleY;
  const width = Math.floor(canvasWidth * scale);
  const height = Math.floor(canvasHeight * scale);

  return { width, height };
}
