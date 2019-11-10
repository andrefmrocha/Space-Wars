#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoords;

uniform sampler2D uSampler;

void main() {
	vec4 color = texture2D(uSampler, vec2(vTexCoords.x, 1.0 - vTexCoords.y));

    // vector from (0.5, 0.5) to point
    vec2 cVec = vec2(vTexCoords.x-0.5, vTexCoords.y-0.5);
    float radialDist = length(cVec);
    vec2 normalizedVec = normalize(cVec);


    // vector to be used calculating dot product
    vec2 dotProductVec;

    // intersects at up or down edge
    if (abs(normalizedVec.y/normalizedVec.x) > 1.0) {
        // force vector to point downwards
        if (normalizedVec.y < 0.) normalizedVec.y = -normalizedVec.y;
        dotProductVec = vec2(0.0, 1.0);
    }
    // intersects at left or right edge
    else {
        // force vector to point rightwards
        if (normalizedVec.x < 0.) normalizedVec.x = -normalizedVec.x;
        dotProductVec = vec2(1.0, 0.0);
    }
    // distance from center to intersection at uv square
    float vecCos = dot(dotProductVec, normalizedVec);
    float edgeIntersectionDist = 0.5 / vecCos;

    // ratio from dist(point to center) and dist(center to edge intersection)
    float radialWeight = radialDist / edgeIntersectionDist;
    vec4 radialGradientColor = mix(color, vec4(0., 0., 0., 1.), radialWeight);

    gl_FragColor = radialGradientColor;
}