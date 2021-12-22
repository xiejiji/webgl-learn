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
    name: 'draw-circle',
    setup() {
      let inner = ref(null);
      const state = reactive({
        points: [0.0, 0.0, 1.0, 1.0, 0.0, 1.0],
        gl: null
      });
      const VSHADER_SOURCE = `
        precision mediump float;
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        varying vec4 v_Color;
        void main(){
          gl_Position = a_Position;
          v_Color = a_Color;
        }
      `;
      const FSHADER_SOURCE = `
        precision mediump float;
        varying vec4 v_Color;
        void main(){
          gl_FragColor = v_Color;
        }
      `;
      const createShader = (gl,shaderType, string) => {
        let shader = gl.createShader(gl[shaderType]);
        gl.shaderSource(shader, string);
        gl.compileShader(shader);
        return shader;
      };
      const createProgram = (gl,vertexShader, fragmentShader) => {
        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);
        return program;
      }
      const createBuffer = (gl,array,  program)=>{
        let data = new Float32Array(Array.from(array));
        const FSIZE = data.BYTES_PER_ELEMENT;
        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        let a_Position = gl.getAttribLocation(program, 'a_Position');
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 6*FSIZE, 0);
        gl.enableVertexAttribArray(a_Position);


        let a_Color = gl.getAttribLocation(program, 'a_Color');
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 6*FSIZE, 2*FSIZE);
        gl.enableVertexAttribArray(a_Color);
      };
      const initScreen =()=>{
        console.log(inner, inner.value);
        const {width, height} = inner.value.getBoundingClientRect();
        console.log(width, height);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        inner.value.appendChild(canvas);
        state.gl = canvas.getContext('webgl');
      }
      const drawCircle = (radius = 0.2, number = 20) => {
        const radian = Math.PI*2/number;
        const vertexShader = createShader(state.gl, 'VERTEX_SHADER', VSHADER_SOURCE);
        const fragmentShader = createShader(state.gl,'FRAGMENT_SHADER', FSHADER_SOURCE);
        const program = createProgram(state.gl,vertexShader, fragmentShader);
        for (let i = 0; i <=number; i++) {
          let x = radius * Math.cos(radian*i);
          let y = radius * Math.sin(radian*i);
          state.points.push(x, y, 1.0, 1.0, 0, 1.0);
          console.log(x, y)
        }
        console.log(Array.from(state.points));
        createBuffer(state.gl,state.points, program);
        draw();
      };
      const draw = ()=>{
        const gl = state.gl;
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, state.points.length/6);
      }
      onMounted(()=>{
         nextTick(()=>{
          initScreen();
          drawCircle();
         });
        
      });
      return {
        drawCircle,
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