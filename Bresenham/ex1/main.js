const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
  throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------

const PALETA = [
  { nome: "Azul", rgb: [0.0, 0.4, 1.0] }, // 0
  { nome: "Vermelho", rgb: [1.0, 0.0, 0.0] }, // 1
  { nome: "Verde", rgb: [0.0, 0.8, 0.2] }, // 2
  { nome: "Amarelo", rgb: [1.0, 0.9, 0.0] }, // 3
  { nome: "Laranja", rgb: [1.0, 0.5, 0.0] }, // 4
  { nome: "Roxo", rgb: [0.6, 0.2, 0.9] }, // 5
  { nome: "Ciano", rgb: [0.0, 0.9, 0.9] }, // 6
  { nome: "Magenta", rgb: [1.0, 0.0, 0.7] }, // 7
  { nome: "Branco", rgb: [1.0, 1.0, 1.0] }, // 8
  { nome: "Cinza", rgb: [0.5, 0.5, 0.5] }, // 9
];

function bresenham(x0, y0, x1, y1) {
  const pontos = [];

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);

  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;

  let erro = dx - dy;
  let x = x0;
  let y = y0;

  while (true) {
    pontos.push(x, y);

    if (x === x1 && y === y1) break;

    const e2 = 2 * erro;

    if (e2 > -dy) {
      erro -= dy;
      x += sx;
    }

    if (e2 < dx) {
      erro += dx;
      y += sy;
    }
  }

  return new Float32Array(pontos);
}

let vertices = bresenham(0, 0, 0, 0);

let POINTS_FIRST = 0;
let POINTS_COUNT = vertices.length / 2;

let corAtual = 0;
// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es
 
in vec2 aPosition;
uniform vec2 uOffset;
uniform vec2 uScale;
 
void main() {
    gl_Position = vec4(aPosition * uScale + uOffset, 0.0, 1.0);
    gl_PointSize = 1.0;
}
 
`;

// --------------------------------------------------
// 4. FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es
 
precision mediump float;
 
uniform vec3 uColor;
 
out vec4 outColor;
 
void main() {
    outColor = vec4(uColor, 1.0);
}
 
`;

// --------------------------------------------------
// 5. COMPILAR SHADERS
// --------------------------------------------------

function createShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);

  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);

    gl.deleteShader(shader);

    throw new Error(error);
  }

  return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

const fragmentShader = createShader(
  gl,
  gl.FRAGMENT_SHADER,
  fragmentShaderSource,
);

// --------------------------------------------------
// 6. CRIAR PROGRAMA
// --------------------------------------------------

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  throw new Error(gl.getProgramInfoLog(program));
}

// --------------------------------------------------
// 7. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

const positionLocation = gl.getAttribLocation(program, "aPosition");

const offsetLocation = gl.getUniformLocation(program, "uOffset");

const scaleLocation = gl.getUniformLocation(program, "uScale");

const colorLocation = gl.getUniformLocation(program, "uColor");

// --------------------------------------------------
// 8. CONFIGURAR ATRIBUTOS
// --------------------------------------------------

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

gl.enableVertexAttribArray(positionLocation);

gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// --------------------------------------------------
// 9. LIMPAR TELA
// --------------------------------------------------

function desenhar() {
  gl.clearColor(0.1, 0.1, 0.1, 1.0);

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  gl.uniform2f(scaleLocation, 2 / canvas.width, 2 / canvas.height);
  gl.uniform2f(offsetLocation, 1 / canvas.width - 1, 1 / canvas.height - 1);
  gl.uniform3f(colorLocation, ...PALETA[corAtual].rgb);
  gl.drawArrays(gl.POINTS, POINTS_FIRST, POINTS_COUNT);
}

// --------------------------------------------------
// 10. DESENHAR
// --------------------------------------------------

function imprimirLinha(x0, y0, x1, y1) {
  vertices = bresenham(x0, y0, x1, y1);

  POINTS_COUNT = vertices.length / 2;

  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

  desenhar();
}

function alterarCor(indice) {
  if (indice < 0 || indice >= PALETA.length) return;

  corAtual = indice;

  desenhar();
}

let xInicial = 0;
let yInicial = 0;
let aguardandoPontoFinal = false;

canvas.addEventListener("mousedown", (evento) => {
  if (evento.button !== 0) return;

  const rect = canvas.getBoundingClientRect();

  const x = Math.round(
    ((evento.clientX - rect.left) * canvas.width) / rect.width,
  );
  const y = Math.round(
    canvas.height - ((evento.clientY - rect.top) * canvas.height) / rect.height,
  );

  if (!aguardandoPontoFinal) {
    xInicial = x;
    yInicial = y;
    imprimirLinha(x, y, x, y);
    aguardandoPontoFinal = true;
  } else {
    imprimirLinha(xInicial, yInicial, x, y);
    aguardandoPontoFinal = false;
  }
});

window.addEventListener("keydown", (evento) => {
  if (evento.key >= "0" && evento.key <= "9") {
    alterarCor(Number(evento.key));
  }
});

desenhar();
