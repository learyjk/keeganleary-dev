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
				float aspect = resolution.x / resolution.y;
				vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

				float gridX = 1.0 - smoothstep(0.0, 0.018, abs(fract(gl_FragCoord.x / 96.0) - 0.5));
				float gridY = 1.0 - smoothstep(0.0, 0.018, abs(fract(gl_FragCoord.y / 96.0) - 0.5));
				float grid = max(gridX, gridY);

				float field = noise(p * 1.7 + vec2(time * 0.018, -time * 0.012));
				float contour = 1.0 - smoothstep(0.025, 0.075, abs(fract(field * 5.0) - 0.5));

				vec2 driftA = vec2(sin(time * 0.07) * 0.34, cos(time * 0.05) * 0.26);
				vec2 driftB = vec2(cos(time * 0.045) * 0.42, sin(time * 0.065) * 0.30);
				float glowA = exp(-length(p - driftA) * 3.7);
				float glowB = exp(-length(p - driftB) * 4.8);

				float dither = (hash(floor(gl_FragCoord.xy / 3.0)) - 0.5) * 0.004;
				vec3 base = vec3(0.018, 0.019, 0.018);
				vec3 signal = vec3(0.026, 0.028, 0.027) * grid;
				signal += vec3(0.020, 0.022, 0.021) * contour;
				signal += vec3(0.026, 0.030, 0.029) * glowA;
				signal += vec3(0.014, 0.016, 0.015) * glowB;

				gl_FragColor = vec4(base + signal + dither, 1.0);
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
				const time = gl.getUniformLocation(program, 'time');

				const resize = () => {
					const pixelRatio = Math.min(window.devicePixelRatio, 1.25);
					canvas.width = Math.round(window.innerWidth * pixelRatio);
					canvas.height = Math.round(window.innerHeight * pixelRatio);
					gl.viewport(0, 0, canvas.width, canvas.height);
				};

				window.addEventListener('resize', resize, { passive: true });

				resize();
				gl.useProgram(program);
				gl.enableVertexAttribArray(position);
				gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

				const startedAt = performance.now();
				let lastFrame = 0;
				const render = (now: number) => {
					if (now - lastFrame < 1000 / 45) {
						requestAnimationFrame(render);
						return;
					}

					lastFrame = now;
					gl.uniform2f(resolution, canvas.width, canvas.height);
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
