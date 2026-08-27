const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
  throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------

const vertices = new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]);

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

gl.uniform3f(colorLocation, 0.5, 0.5, 0.5);
gl.uniform2f(offsetLocation, 0.0, 0.55);
gl.uniform2f(scaleLocation, 0.1, 0.17);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

gl.uniform3f(colorLocation, 0.5, 0.5, 0.5);
gl.uniform2f(offsetLocation, 0.0, 0);
gl.uniform2f(scaleLocation, 0.33, 0.05);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

gl.uniform3f(colorLocation, 0.65, 0.65, 0.65);
gl.uniform2f(offsetLocation, -0.45, 0.05);
gl.uniform2f(scaleLocation, 0.1, 0.33);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

gl.uniform3f(colorLocation, 0.5, 0.5, 0.5);
gl.uniform2f(offsetLocation, 0, 0.78);
gl.uniform2f(scaleLocation, 0.012, 0.1);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

gl.uniform3f(colorLocation, 0.65, 0.65, 0.65);
gl.uniform2f(offsetLocation, 0.45, 0.05);
gl.uniform2f(scaleLocation, 0.1, 0.33);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

gl.uniform3f(colorLocation, 0.5, 0.5, 0.5);
gl.uniform2f(offsetLocation, -0.18, -0.45);
gl.uniform2f(scaleLocation, 0.15, 0.23);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

gl.uniform3f(colorLocation, 0.5, 0.5, 0.5);
gl.uniform2f(offsetLocation, 0.18, -0.45);
gl.uniform2f(scaleLocation, 0.15, 0.23);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

gl.uniform3f(colorLocation, 0.75, 0.75, 0.75);
gl.uniform2f(offsetLocation, 0.0, 0.6);
gl.uniform2f(scaleLocation, 0.23, 0.17);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

gl.uniform3f(colorLocation, 0.75, 0.75, 0.75);
gl.uniform2f(offsetLocation, 0.0, 0.2);
gl.uniform2f(scaleLocation, 0.35, 0.18);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

gl.uniform3f(colorLocation, 0.75, 0.75, 0.75);
gl.uniform2f(offsetLocation, 0.0, -0.2);
gl.uniform2f(scaleLocation, 0.35, 0.18);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

gl.uniform3f(colorLocation, 0.0, 1.0, 1.0);
gl.uniform2f(offsetLocation, 0.1, 0.6);
gl.uniform2f(scaleLocation, 0.045, 0.045);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

gl.uniform3f(colorLocation, 0.0, 1.0, 1.0);
gl.uniform2f(offsetLocation, -0.1, 0.6);
gl.uniform2f(scaleLocation, 0.045, 0.045);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

gl.uniform3f(colorLocation, 1.0, 0.0, 0.0);
gl.uniform2f(offsetLocation, -0.26, 0.29);
gl.uniform2f(scaleLocation, 0.03, 0.03);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

gl.uniform3f(colorLocation, 0.13, 0.55, 0.13);
gl.uniform2f(offsetLocation, -0.26, 0.19);
gl.uniform2f(scaleLocation, 0.03, 0.03);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

gl.uniform3f(colorLocation, 1.0, 0.84, 0.0);
gl.uniform2f(offsetLocation, -0.26, 0.09);
gl.uniform2f(scaleLocation, 0.03, 0.03);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

gl.uniform3f(colorLocation, 1.0, 0.0, 0.0);
gl.uniform2f(offsetLocation, 0, 0.9);
gl.uniform2f(scaleLocation, 0.03, 0.03);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
