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

function enviarPontos(pontos) {
  vertices = new Float32Array(pontos);

  POINTS_COUNT = vertices.length / 2;

  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

  desenhar();
}

// --------------------------------------------------
// 10. DESENHAR
// --------------------------------------------------

function imprimirLinha(x0, y0, x1, y1) {
  enviarPontos(bresenham(x0, y0, x1, y1));
}

function alterarCor(indice) {
  if (indice < 0 || indice >= PALETA.length) return;

  corAtual = indice;

  desenhar();
}

function imprimirTriangulo(x0, y0, x1, y1, x2, y2) {
  enviarPontos([
    ...bresenham(x0, y0, x1, y1),
    ...bresenham(x1, y1, x2, y2),
    ...bresenham(x2, y2, x0, y0),
  ]);
}

const RETA = "reta";
const TRIANGULO = "triangulo";

let modo = RETA;
let cliques = [];

canvas.addEventListener("mousedown", (evento) => {
  if (evento.button !== 0) return;

  const rect = canvas.getBoundingClientRect();

  const x = Math.min(
    canvas.width - 1,
    Math.round(((evento.clientX - rect.left) * canvas.width) / rect.width),
  );
  const y = Math.min(
    canvas.height - 1,
    Math.round(
      canvas.height -
        ((evento.clientY - rect.top) * canvas.height) / rect.height,
    ),
  );

  cliques.push({ x, y });

  const total = modo === RETA ? 2 : 3;
  const [p0, p1, p2] = cliques;

  if (cliques.length === 1) {
    imprimirLinha(p0.x, p0.y, p0.x, p0.y);
  } else if (cliques.length === 2) {
    imprimirLinha(p0.x, p0.y, p1.x, p1.y);
  } else {
    imprimirTriangulo(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y);
  }

  if (cliques.length === total) cliques = [];
});

window.addEventListener("keydown", (evento) => {
  const tecla = evento.key;

  if (tecla >= "0" && tecla <= "9") {
    alterarCor(Number(tecla));
    return;
  }

  if (tecla === "r" || tecla === "R") {
    modo = RETA;
    cliques = [];
  }

  if (tecla === "t" || tecla === "T") {
    modo = TRIANGULO;
    cliques = [];
  }
});

desenhar();
