class MyTriangle extends CGFobject {

    constructor(scene, x1, x2, x3, y1, y2, y3, z1, z2, z3) {
        super(scene);

        this.x1 = x1;
        this.x2 = x2;
        this.x3 = x3;
        this.y1 = y1;
        this.y2 = y2;
        this.y3 = y3;
        this.z1 = z1;
        this.z2 = z2;
        this.z3 = z3;

        this.initBuffers();
    }

    initBuffers() {
        
        /* Vertices */
        this.vertices = [
            this.x1, this.y1, this.z1,
            this.x2, this.y2, this.z2,
            this.x3, this.y3, this.z3
        ];

        /* Indices */
        this.indices = [0, 1, 2];
        
        /* Normals */
        let v12 = [ this.x2 - this.x1, this.y2 - this.y1, this.z2 - this.z1];
        let v13 = [ this.x3 - this.x1, this.y3 - this.y1, this.z3 - this.z1];

        let cross_p = [ 
            v12[1] * v13[2] - v12[2] * v13[1], 
            -(v12[0] * v13[2] - v12[2] * v13[0]),
            v12[0] * v13[1] - v12[1] * v13[0],
        ];
        let magnitude = Math.sqrt(Math.pow(cross_p[0], 2) + Math.pow(cross_p[1], 2) + Math.pow(cross_p[2], 2));

        let normalx = cross_p[0] / magnitude;
        let normaly = cross_p[1] / magnitude;
        let normalz = cross_p[2] / magnitude;
        this.normals = [
            normalx, normaly, normalz, 
            normalx, normaly, normalz,
            normalx, normaly, normalz
        ];

        /* Texture coordinates */
        let b = Math.sqrt(Math.pow(this.x1 - this.x3, 2) + Math.pow(this.y1 - this.y3, 2) + Math.pow(this.z1 - this.z3, 2));
        let c = Math.sqrt(Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2 - this.y1, 2) + Math.pow(this.z2 - this.z1, 2));
        let a = Math.sqrt(Math.pow(this.x3- this.x2, 2) + Math.pow(this.y3 - this.y2, 2) + Math.pow(this.z3 - this.z2, 2));

        let alpha = (Math.pow(a,2) + Math.pow(b,2) + Math.pow(c,2)) / (2 * b * c);
        let beta = (Math.pow(a,2) - Math.pow(b,2) + Math.pow(c,2)) / (2 * a * c);
        let gama = (Math.pow(a,2) + Math.pow(b,2) - Math.pow(c,2)) / (2 * a * b);

        let u = 1;
        let v = 1;

        this.texCoords = [
            0, v,
            c, v,
            c - a * Math.cos(beta), v - a * Math.sin(beta)
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

}