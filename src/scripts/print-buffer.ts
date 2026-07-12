import {
	ShaderMount,
	ditheringFragmentShader,
	DitheringShapes,
	DitheringTypes,
	ShaderFitOptions,
	getShaderColorFromString,
	type DitheringUniforms,
} from '@paper-design/shaders';

declare global {
	interface Document {
		__printBufferPageLoadBound?: boolean;
	}
}

let activeShader: ShaderMount | undefined;
let elapsedFrame = 0;

function mountPrintBufferShader() {
	// Capture the outgoing animation clock before dispose so the next mount
	// can resume from the same pose instead of snapping back to frame 0.
	// Astro's client router swaps most of the page on navigation, so the
	// container we find below may be a brand new element even if an old
	// shader instance is still holding a WebGL context open.
	if (activeShader) {
		elapsedFrame = activeShader.getCurrentFrame();
		activeShader.dispose();
		activeShader = undefined;
	}

	const container = document.querySelector<HTMLDivElement>('#print-buffer');
	if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		return;
	}

	// Paper dithering shader — https://shaders.paper.design/dithering
	// Type: 4x4 / Shape: Sphere / Speed: 14% / Dither size: 2
	// Foreground: #E4E2D7 (paper) over a Fill of #000000 (desk).
	// `fit: cover` sizes the sphere against max(resolution.x, resolution.y)
	// — i.e. the largest viewport edge — recomputed every frame from the
	// live canvas resolution, so it stays responsive without any manual
	// vmin/vmax math on the JS side. At this fit, `scale: 1` makes the
	// sphere's diameter equal the largest edge, so `scale: 2` keeps it at
	// 2x the largest edge at any viewport size or aspect ratio.
	const uniforms: DitheringUniforms = {
		u_colorBack: getShaderColorFromString('#000000'),
		u_colorFront: getShaderColorFromString('#e4e2d7'),
		u_shape: DitheringShapes.sphere,
		u_type: DitheringTypes['4x4'],
		u_pxSize: 2,
		u_fit: ShaderFitOptions.cover,
		u_scale: 2,
		u_rotation: 0,
		u_offsetX: 0,
		u_offsetY: 0,
		u_originX: 0.5,
		u_originY: 0.5,
		u_worldWidth: 0,
		u_worldHeight: 0,
	};

	try {
		activeShader = new ShaderMount(
			container,
			ditheringFragmentShader,
			uniforms,
			undefined,
			0.14,
			elapsedFrame,
		);
	} catch (error) {
		console.warn('Paper dithering shader failed to mount:', error);
	}
}

mountPrintBufferShader();

// `astro:page-load` fires after the initial load AND after every
// client-side navigation, so this keeps the shader alive (and correctly
// sized) even though the router doesn't re-run this module on every swap.
// Guard against binding the listener twice if this module does happen to
// re-execute on some navigations.
if (!document.__printBufferPageLoadBound) {
	document.__printBufferPageLoadBound = true;
	document.addEventListener('astro:page-load', mountPrintBufferShader);
}
