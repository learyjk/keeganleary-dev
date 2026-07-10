const canvas = document.querySelector<HTMLCanvasElement>('#print-buffer');

if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
	const gl = canvas.getContext('webgl', {
		alpha: false,
		antialias: false,
		powerPreference: 'low-power',
	});

	if (gl) {
		const vertexSource = `
			attribute vec2 position;

			void main() {
				gl_Position = vec4(position, 0.0, 1.0);
			}
		`;

		const fragmentSource = `
			precision mediump float;

			uniform vec2 resolution;
			uniform vec2 pointer;
			uniform float time;

			float hash(vec2 p) {
				p = fract(p * vec2(123.34, 456.21));
				p += dot(p, p + 45.32);
				return fract(p.x * p.y);
			}

			float noise(vec2 p) {
				vec2 i = floor(p);
				vec2 f = fract(p);
				f = f * f * (3.0 - 2.0 * f);

				return mix(
					mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
					mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x),
					f.y
				);
			}

			void main() {
				vec2 uv = gl_FragCoord.xy / resolution;
				vec2 mouse = pointer / resolution;
				float aspect = resolution.x / resolution.y;

				vec2 cell = floor(gl_FragCoord.xy / 4.0);
				float grain = hash(cell + floor(time * 8.0));
				float bands = noise(vec2(uv.y * 70.0, floor(time * 1.8)));
				float scan = smoothstep(0.94, 1.0, sin((uv.y + time * 0.025) * 520.0) * 0.5 + 0.5);

				vec2 delta = vec2((uv.x - mouse.x) * aspect, uv.y - mouse.y);
				float distanceFromPointer = length(delta);
				float ripple = sin(distanceFromPointer * 90.0 - time * 5.0);
				ripple *= smoothstep(0.34, 0.0, distanceFromPointer);

				float signal = step(0.975, grain) * bands;
				signal += scan * 0.018;
				signal += max(ripple, 0.0) * 0.035;

				float base = 0.035 + signal;
				gl_FragColor = vec4(vec3(base), 1.0);
			}
		`;

		const compile = (type: number, source: string) => {
			const shader = gl.createShader(type);
			if (!shader) return null;

			gl.shaderSource(shader, source);
			gl.compileShader(shader);

			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				console.warn('Print buffer shader failed to compile:', gl.getShaderInfoLog(shader));
				gl.deleteShader(shader);
				return null;
			}

			return shader;
		};

		const vertexShader = compile(gl.VERTEX_SHADER, vertexSource);
		const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSource);
		const program = gl.createProgram();

		if (vertexShader && fragmentShader && program) {
			gl.attachShader(program, vertexShader);
			gl.attachShader(program, fragmentShader);
			gl.linkProgram(program);

			if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
				const buffer = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
				gl.bufferData(
					gl.ARRAY_BUFFER,
					new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
					gl.STATIC_DRAW,
				);

				const position = gl.getAttribLocation(program, 'position');
				const resolution = gl.getUniformLocation(program, 'resolution');
				const pointer = gl.getUniformLocation(program, 'pointer');
				const time = gl.getUniformLocation(program, 'time');
				const pointerPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

				const resize = () => {
					const pixelRatio = Math.min(window.devicePixelRatio, 2);
					canvas.width = Math.round(window.innerWidth * pixelRatio);
					canvas.height = Math.round(window.innerHeight * pixelRatio);
					gl.viewport(0, 0, canvas.width, canvas.height);
				};

				window.addEventListener('resize', resize, { passive: true });
				window.addEventListener(
					'pointermove',
					(event) => {
						pointerPosition.x += (event.clientX - pointerPosition.x) * 0.16;
						pointerPosition.y += (window.innerHeight - event.clientY - pointerPosition.y) * 0.16;
					},
					{ passive: true },
				);

				resize();
				gl.useProgram(program);
				gl.enableVertexAttribArray(position);
				gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

				const startedAt = performance.now();
				const render = (now: number) => {
					gl.uniform2f(resolution, canvas.width, canvas.height);
					gl.uniform2f(
						pointer,
						pointerPosition.x * (canvas.width / window.innerWidth),
						pointerPosition.y * (canvas.height / window.innerHeight),
					);
					gl.uniform1f(time, (now - startedAt) / 1000);
					gl.drawArrays(gl.TRIANGLES, 0, 6);
					requestAnimationFrame(render);
				};

				requestAnimationFrame(render);
			} else {
				console.warn('Print buffer shader failed to link:', gl.getProgramInfoLog(program));
			}
		}
	}
}
