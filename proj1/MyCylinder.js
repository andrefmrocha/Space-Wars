class MyCylinder extends CGFobject {

	constructor(scene, slices) {
		super(scene);
		this.slices = slices;
		this.initBuffers();
	}

	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

		let ang = 0;
		let ang_inc = 2*Math.PI/this.slices;
		let n_verts = (this.slices+1)*4;

		for (var i = 0; i <= this.slices; i++) {

			var sa=Math.sin(ang);
            var ca=Math.cos(ang);

			/* VERTICES */
            this.vertices.push(ca, 0, -sa);
            this.vertices.push(ca, 1, -sa);
            this.vertices.push(ca, 0, -sa);
            this.vertices.push(ca, 1, -sa);

            /* TEXTURE COORDS */
            this.texCoords.push(i*1.0/this.slices, 1);
			this.texCoords.push(i*1.0/this.slices, 0);
			this.texCoords.push(Math.cos(ang)/2 + 0.5, Math.sin(ang)/2 + 0.5);
			this.texCoords.push(Math.cos(ang)/2 + 0.5, Math.sin(ang)/2 + 0.5);

            /* INDICES */
            this.indices.push(i*4, ((i+1)*4) % n_verts, (i*4+1) % n_verts);
            this.indices.push(((i+1)*4) % n_verts, ((i+1)*4+1) % n_verts, (i*4+1) % n_verts);
            this.indices.push(((i+1)*4+2) % n_verts, (i*4+2) % n_verts, n_verts);
            this.indices.push((i*4+3) % n_verts, ((i+1)*4+3) % n_verts, n_verts+1);

            /* NORMALS */
            this.normals.push(ca, 0,-sa);
			this.normals.push(ca, 0,-sa);
			this.normals.push(0,-1,0);
			this.normals.push(0,1,0);

            ang += ang_inc;
		}

		this.vertices.push(0,0,0);
		this.vertices.push(0,1,0);

		this.texCoords.push(0.5,0.5);
		this.texCoords.push(0.5,0.5);
		
		this.normals.push(0,-1,0);
		this.normals.push(0,1,0);

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
	}

}