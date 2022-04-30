const COLORS = [
  '#e08791', '#2f149a', '#fa7610', '#ff00d0', '#3b5998',
  '#63d77c', '#000000', '#dfe3ee', '#8b9dc3', '#fdf5e2',
  '#c90076', '#e4d00a', '#909be9', '#68628d', '#102e4c',
  '#a5cfb5', '#584938', '#b5a0a9', '#7bfbfd', '#fb2c1d',
  '#993399', '#996699', '#999999', '#99cc99', '#99ff99',
  '#f9a03f', '#45f920', '#bd6b73', '#e4e4e8', '#f4a322',
];
let currentColor = COLORS[0];
let selectedIndex = 0;
const canvas = document.getElementById('canv');
const pcnt = document.getElementById('pcnt');
const expBtn = document.getElementById('export');
const bias = document.getElementById('bias');
const dense = document.getElementById('dense');
const reset = document.getElementById('reset');
const ctx = canvas.getContext('2d');
const opt = document.getElementById('colors');
const state = {};
const result = {
  x: [],
  y: [],
  c: [],
};
const centerX = canvas.clientWidth / 2;
const centerY = canvas.clientHeight / 2;
const drawLine = (x1, y1, x2, y2, color) => {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.stroke();
};
const drawGrid = () => {
  const {clientWidth, clientHeight} = canvas;
  for (let i = 0; i < clientWidth / 100; ++i) {
    const lx = i * 100;
    drawLine(lx, 0, lx, clientHeight, '#f3f3f3');
  }
  for (let i = 0; i < clientHeight / 100; ++i) {
    const ly = i * 100;
    drawLine(0, ly, clientWidth, ly, '#f3f3f3');
  }
  // drawLine(centerX, 0, centerX, clientHeight, '#e0e0e0');
  // drawLine(0, centerY, clientWidth, centerY, '#e0e0e0');
};
function exportCsvUrl() {
  let str = 'x,y,color\n';
  const len = result.x.length;
  for (let i = 0; i < len; ++i) {
    const [x, y, c] = [result.x[i], result.y[i], result.c[i]];
    str += `${x},${y},${c}\n`;
  }
  const blob = new Blob([str], { type: "text/csv;charset=utf-8" });
  return URL.createObjectURL(blob);
}
function resetFunc() {
  result.x = [];
  result.y = [];
  result.c = [];
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  drawGrid();
  pcnt.innerText = '0';
  expBtn.removeAttribute('href');
}
(function(){
  resetFunc();
  reset.addEventListener('click', resetFunc);

  expBtn.addEventListener('click', (evt) => {
		evt.target.download = "data.csv";
  });

  opt.addEventListener('change', (evt) => {
    currentColor = evt.target.value;
    selectedIndex = evt.target.selectedIndex;
    evt.target.style.backgroundColor = currentColor;
  });
  opt.style.backgroundColor = COLORS[selectedIndex];

  for (const i in COLORS) {
    const o = document.createElement('option');
    o.setAttribute('value', COLORS[i]);
    o.innerText = `Color ${i}`;
    o.style.backgroundColor = COLORS[i];
    opt.appendChild(o);
  }

  const savePoint = (x, y) => {
    result.x.push(x);
    result.y.push(y);
    result.c.push(selectedIndex);
    pcnt.innerText = result.x.length;
  };

  const drawCircle = (x, y) => {
    ctx.beginPath();
    ctx.fillStyle = currentColor;
    ctx.arc(x, y, 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    savePoint(x, y);
  };

  let lastTime = new Date();

  canvas.addEventListener('mousedown', (evt) => {
    state.active = true;
    const {offsetX, offsetY} = evt;
    const rx = Math.random() * bias.value - (bias.value / 2);
    const ry = Math.random() * bias.value - (bias.value / 2);
    drawCircle(offsetX + rx, offsetY + ry);
    lastTime = new Date();
  });
  canvas.addEventListener('mouseup', (evt) => {
    state.active = false;
		expBtn.href = exportCsvUrl();
  });
  canvas.addEventListener('mousemove', (evt) => {
    if (!state.active) return;
    if (new Date() - lastTime < 30) return; // under 30ms
    const {offsetX, offsetY} = evt;
    for (let i = 0; i < dense.value; ++i) {
      const rx = Math.random() * bias.value - (bias.value / 2);
      const ry = Math.random() * bias.value - (bias.value / 2);
      drawCircle(offsetX + rx, offsetY + ry);
    }
    lastTime = new Date();
  });
})();
