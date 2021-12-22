<template>
  <div class="inner" ref="inner">

  </div>
</template>
<script>
  import {
    ref,
    reactive,
    onMounted,
    nextTick
  } from 'vue';
  export default {
    name: 'sinusoid',
    setup() {
      let inner = ref(null);
      const state = reactive({
        points: [],
        gl: null
      });
      const VSHADER_SOURCE = `
        precision mediump float;
        attribute vec4 a_Position;
        uniform float u_x_Offset;
        uniform mat4 u_m_Translate;
        void main(){
          gl_Position = u_m_Translate*a_Position;
          if ( fract(gl_Position.x * 100.0) < 0.5) { 
            gl_Position.y=gl_Position.x; 
          } 
          gl_Position.x=gl_Position.x + u_x_Offset;
          gl_Position.y = sin(a_Position.x*3.14*2.0);
          gl_PointSize = 10.0;
        }
      `;
      const FSHADER_SOURCE = `
        precision mediump float;
        void main(){
          gl_FragColor = vec4(1.0,0,0,1.0);
        }
      `;
      const createShader = (gl, shaderType, string) => {
        let shader = gl.createShader(gl[shaderType]);
        gl.shaderSource(shader, string);
        gl.compileShader(shader);
        return shader;
      };
      const createProgram = (gl, vertexShader, fragmentShader) => {
        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);
        return program;
      }
      const createBuffer = (gl, array, program) => {
        let data = new Float32Array(Array.from(array));
        const FSIZE = data.BYTES_PER_ELEMENT;
        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        let a_Position = gl.getAttribLocation(program, 'a_Position');
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false,0, 0);
        gl.enableVertexAttribArray(a_Position);


        let a_Color = gl.getAttribLocation(program, 'a_Color');
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 6 * FSIZE, 2 * FSIZE);
        gl.enableVertexAttribArray(a_Color);
      };
      const initScreen = () => {
        console.log(inner, inner.value);
        const {
          width,
          height
        } = inner.value.getBoundingClientRect();
        console.log(width, height);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        inner.value.appendChild(canvas);
        state.gl = canvas.getContext('webgl',{ preserveDrawingBuffer: true });
      }
      // 因为x的范围是[-1.0, 1.0];所以i/100 限定范围；
      const drawSin = (start=-100, end=100, offset=0) => {
        const gl = state.gl;
        const vertexShader = createShader(gl, 'VERTEX_SHADER', VSHADER_SOURCE);
        const fragmentShader = createShader(gl, 'FRAGMENT_SHADER', FSHADER_SOURCE);
        const program = createProgram(gl, vertexShader, fragmentShader);
        for(let i=start;i<=end;i++){
          let x = i/100;
          state.points.push(x, 0);
        }
        createBuffer(gl, state.points, program);
        let u_x_Offset = gl.getUniformLocation(program, 'u_x_Offset');
        gl.uniform1f(u_x_Offset, offset);

        const translate = new Float32Array([
          1.0,0.0,0.0,0.0,
          0.0,1.0,0.0,0.0,
          0.0,0.0,1.0,0.0,
          0,0.0,0.0,1.0,
        ]);
        let u_m_Translate = gl.getUniformLocation(program, 'u_m_Translate');
        gl.uniformMatrix4fv(u_m_Translate, false, translate)
        draw(offset);
      };
      const draw = () => {
        const gl = state.gl;
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.LINE_STRIP, 0, 200);
      }
      onMounted(() => {
        nextTick(() => {
          initScreen();
          drawSin();
        });

      });
      return {
        inner
      }
    }
  }
</script>
<style lang="scss">
  .inner {
    height: 100%;
  }
</style>