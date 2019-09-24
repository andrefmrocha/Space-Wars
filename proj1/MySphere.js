class MySphere extends CGFobject {

    constructor(scene, radius, slices, stacks) {
        super(scene);

        this.radius = radius;
        this.latBands = stacks*2;
        this.longBands = slices;

		this.initBuffers();
    }

    initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];
        
        /* 
        * Calculate sphere vertex positions, normals, and texture coordinates.
        *
        * Visual representation of the calculus below:
        * https://mse.redwoods.edu/darnold/math50c/mathjax/spherical/spherical3.png
        * phi and theta below are the same as in the picture.
        */
        for (let latNum = 0; latNum <= this.latBands; latNum++) {
            let phi = latNum * Math.PI / this.latBands;
            let sinPhi = Math.sin(phi);
            let cosPhi = Math.cos(phi);

            for (let longNum = 0; longNum <= this.longBands; longNum++) {
                let theta = longNum * 2 * Math.PI / this.longBands;
                let sinTheta = Math.sin(theta);
                let cosTheta = Math.cos(theta);
                
                /* Vertices coordinates */
                let x = cosTheta * sinPhi;
                let y = sinTheta * sinPhi;
                let z = cosPhi;
                this.vertices.push(this.radius * x, this.radius * y, this.radius * z);

                /* Normals */
                this.normals.push(x,y,z);

                /* Texture coordinates */
                let u = 1 - (longNum / this.longBands);
                let v = 1 - (latNum / this.latBands);
                this.texCoords.push(u, v);
            }
        }

        /* Number of vertices per latitude band */
        let latBandVertices = this.longBands+1;

        /* Calculate sphere indices */
        for (let latNum = 0; latNum < this.latBands; latNum++) {
            for (let longNum = 0; longNum < this.longBands; longNum++) {
                let first = latNum * latBandVertices + longNum;
                let second = first + latBandVertices;

                this.indices.push(first, second, first + 1);
                this.indices.push(second, second+1, first+1);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

}