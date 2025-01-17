export default function fullCanvasTick(id, opts={}) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");

  let width = canvas.clientWidth;
  let height = canvas.clientHeight;

  opts.setup && opts.setup(canvas, ctx)

  const observer = new ResizeObserver((entries) => {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
  });
  observer.observe(canvas)

  function render(time) {
    canvas.width = width;
    canvas.height = height;

    opts.tick && opts.tick(canvas, ctx, time)

    requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
}
