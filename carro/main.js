const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
  throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------
const SEG = 40;

const quad = [-1, -1, 1, -1, 1, 1, -1, 1];

const circle = [0, 0];
for (let i = 0; i <= SEG; i++) {
  const a = (i * 2 * Math.PI) / SEG;
  circle.push(Math.cos(a), Math.sin(a));
}

const vertices = new Float32Array([...quad, ...circle]);

const QUAD_FIRST = 0;
const QUAD_COUNT = 4;
const CIRCLE_FIRST = 4;
const CIRCLE_COUNT = SEG + 2;
// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;
uniform vec2 uOffset;
uniform vec2 uScale;

void main() {
    gl_Position = vec4(aPosition * uScale + uOffset, 0.0, 1.0);
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

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);

// --------------------------------------------------
// 10. DESENHAR
// --------------------------------------------------

gl.useProgram(program);

gl.uniform2f(scaleLocation, 0.2, 0.1);
gl.uniform2f(offsetLocation, 0, 0.3);
gl.uniform3f(colorLocation, 1.0, 0.0, 0.0);
gl.drawArrays(gl.TRIANGLE_FAN, QUAD_FIRST, QUAD_COUNT);

gl.uniform2f(scaleLocation, 0.1, 0.1);
gl.uniform2f(offsetLocation, 0.2, 0.3);
gl.uniform3f(colorLocation, 1.0, 0, 0);
gl.drawArrays(gl.TRIANGLE_FAN, CIRCLE_FIRST, CIRCLE_COUNT);

gl.uniform2f(scaleLocation, 0.1, 0.1);
gl.uniform2f(offsetLocation, -0.2, 0.3);
gl.uniform3f(colorLocation, 1.0, 0, 0);
gl.drawArrays(gl.TRIANGLE_FAN, CIRCLE_FIRST, CIRCLE_COUNT);

gl.uniform2f(scaleLocation, 0.41, 0.09);
gl.uniform2f(offsetLocation, 0, 0.2);
gl.uniform3f(colorLocation, 1.0, 0.0, 0.0);
gl.drawArrays(gl.TRIANGLE_FAN, QUAD_FIRST, QUAD_COUNT);

gl.uniform2f(scaleLocation, 0.09, 0.09);
gl.uniform2f(offsetLocation, -0.4, 0.2);
gl.uniform3f(colorLocation, 1.0, 0, 0);
gl.drawArrays(gl.TRIANGLE_FAN, CIRCLE_FIRST, CIRCLE_COUNT);

gl.uniform2f(scaleLocation, 0.09, 0.09);
gl.uniform2f(offsetLocation, 0.42, 0.2);
gl.uniform3f(colorLocation, 1.0, 0, 0);
gl.drawArrays(gl.TRIANGLE_FAN, CIRCLE_FIRST, CIRCLE_COUNT);

gl.uniform2f(scaleLocation, 0.08, 0.08);
gl.uniform2f(offsetLocation, 0.26, 0.1);
gl.uniform3f(colorLocation, 0, 0, 0);
gl.drawArrays(gl.TRIANGLE_FAN, CIRCLE_FIRST, CIRCLE_COUNT);

gl.uniform2f(scaleLocation, 0.08, 0.08);
gl.uniform2f(offsetLocation, -0.26, 0.1);
gl.uniform3f(colorLocation, 0, 0, 0);
gl.drawArrays(gl.TRIANGLE_FAN, CIRCLE_FIRST, CIRCLE_COUNT);

gl.uniform2f(scaleLocation, 0.04, 0.04);
gl.uniform2f(offsetLocation, -0.26, 0.1);
gl.uniform3f(colorLocation, 0.9, 0.9, 0.9);
gl.drawArrays(gl.TRIANGLE_FAN, CIRCLE_FIRST, CIRCLE_COUNT);

gl.uniform2f(scaleLocation, 0.04, 0.04);
gl.uniform2f(offsetLocation, 0.26, 0.1);
gl.uniform3f(colorLocation, 0.9, 0.9, 0.9);
gl.drawArrays(gl.TRIANGLE_FAN, CIRCLE_FIRST, CIRCLE_COUNT);

gl.uniform2f(scaleLocation, 0.09, 0.045);
gl.uniform2f(offsetLocation, 0.1, 0.33);
gl.uniform3f(colorLocation, 0.8, 0.8, 0.8);
gl.drawArrays(gl.TRIANGLE_FAN, QUAD_FIRST, QUAD_COUNT);

gl.uniform2f(scaleLocation, 0.09, 0.045);
gl.uniform2f(offsetLocation, -0.1, 0.33);
gl.uniform3f(colorLocation, 0.8, 0.8, 0.8);
gl.drawArrays(gl.TRIANGLE_FAN, QUAD_FIRST, QUAD_COUNT);

gl.uniform2f(scaleLocation, 0.045, 0.045);
gl.uniform2f(offsetLocation, 0.2, 0.33);
gl.uniform3f(colorLocation, 0.8, 0.8, 0.8);
gl.drawArrays(gl.TRIANGLE_FAN, CIRCLE_FIRST, CIRCLE_COUNT);

gl.uniform2f(scaleLocation, 0.045, 0.045);
gl.uniform2f(offsetLocation, -0.2, 0.33);
gl.uniform3f(colorLocation, 0.8, 0.8, 0.8);
gl.drawArrays(gl.TRIANGLE_FAN, CIRCLE_FIRST, CIRCLE_COUNT);

gl.uniform2f(scaleLocation, 0.045, 0.045);
gl.uniform2f(offsetLocation, -0.43, 0.24);
gl.uniform3f(colorLocation, 1.0, 0.84, 0.0);
gl.drawArrays(gl.TRIANGLE_FAN, CIRCLE_FIRST, CIRCLE_COUNT);

gl.uniform2f(scaleLocation, 0.045, 0.045);
gl.uniform2f(offsetLocation, 0.45, 0.24);
gl.uniform3f(colorLocation, 1.0, 0.84, 0.0);
gl.drawArrays(gl.TRIANGLE_FAN, CIRCLE_FIRST, CIRCLE_COUNT);
