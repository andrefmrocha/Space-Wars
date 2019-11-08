#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoords;

uniform sampler2D uSampler;

void main() {
	vec4 color = texture2D(uSampler, vec2(vTexCoords.x, 1.0 - vTexCoords.y));

    // distance to (0.5, 0.5)
    float radialDist = sqrt(pow(vTexCoords.x - 0.5, 2) + pow(vTexCoords.y - 0.5, 2));

    // check slope
    if (abs(vTexCoords.y/vTexCoords.x) > 1) {
        
    }

    gl_FragColor = color;
}