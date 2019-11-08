#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main() {
	vec4 color = texture2D(uSampler, vec2(vTextureCoord.x, 1.0 - vTextureCoord.y));
    gl_FragColor = color;
}