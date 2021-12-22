program 也是状态机
用哪个program 就得 执行 gl.useProgram(想要使用的program);

buffer 也是状态机
用哪个buffer时， gl.bindBuffer(, 要使用的buffer);

只有顶点着色器才能访问buffer

mat 以列为主序