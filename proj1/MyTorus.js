class MyTorus extends CGFobject {
    
    constructor(scene, innerRadius, outerRadius, slices, loops) {
        super(scene);

        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.slices = slices;
        this.loops = loops;

        this.initBuffers();
    }

    initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
        this.texCoords = [];

        /*
            References for understanding the torus:
            http://www.it.hiof.no/~borres/j3d/math/param/p-param.html#maparam28
            https://services.math.duke.edu/education/ccp/materials/mvcalc/parasurfs/para1.html
        */        
        for (let ring = 0; ring <= this.loops; ring++) {

            /* Angle in the xy axis from quadrants 1 -> 4 -> 3 -> 2 */
            let theta = ring * 2 * Math.PI / this.loops;
            let sinTheta = Math.sin(theta);
            let cosTheta = Math.cos(theta);

            for (let seg = 0; seg <= this.slices; seg++) {

                /* Angle in the torus circunference of the current segment */
                let phi = seg * 2 * Math.PI / this.slices;
                let sinPhi = Math.sin(phi);
                let cosPhi = Math.cos(phi);
                
                /* Vertices coordinates */
                let x = (this.outerRadius + this.innerRadius * cosPhi) * cosTheta;
                let y = (this.outerRadius + this.innerRadius * cosPhi) * sinTheta;
                let z = this.innerRadius * sinPhi;
                this.vertices.push(x, y, z);

                /* Normals */
                let normalx = x - cosTheta*this.outerRadius;
                let normaly = y - sinTheta*this.outerRadius;
                let normalz = z;
                let magn = Math.sqrt(Math.pow(normalx, 2) + Math.pow(normaly,2) + Math.pow(normalz,2));
                this.normals.push(normalx/magn, normaly/magn, normalz/magn);

                /* Texture coordinates */
                let u = 1 - (seg / this.slices);
                let v = 1 - (ring / this.loops);
                this.texCoords.push(u, v);
            }
        }
        
        let verticesPerRing = this.slices+1;
        for (let ring = 0; ring < this.loops; ring++) {
            for (let seg = 0; seg < this.slices; seg++) {
                let first = ring * verticesPerRing + seg;
                let second = first + verticesPerRing;

                this.indices.push(first, second, first+1);
                this.indices.push(second, second+1, first+1);            
            }
        }


        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}