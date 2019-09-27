class MyCylinder extends CGFobject {

	constructor(scene, height, base, top, slices, stacks) {
		super(scene);
		this.height = height;
		this.base = base;
		this.top = top;
		this.slices = slices;
		this.stacks = stacks;
		this.initBuffers();
	}

	initSide() {
		/*
			sizePerStack - z increment by division along the z axis
			radius - radius of current side division, resulting from interpolating base and top
			theta - angle in the xy plane
			sideDivVertices - number of vertices per latitude band

			the vertices go from quadrants on the xy plane: 1 -> 4 -> 3 -> 2

			u ranges linearly from 0.0 at z = 0 to 1.0 at z = height, 
			and v ranges from 0.0 at the +y axis, to 0.25 at the +x axis, 
			to 0.5 at the -y axis, to 0.75 at the \-x axis, and back to 1.0 at the +y axis
		*/
		let alphaTan = Math.abs(this.top - this.base) / this.height;
		let normalMagn = Math.sqrt(1 + Math.pow(alphaTan, 2)); /* x=sin, y=cos -> x^2 + y^2 = 1 */
		let normalz = -alphaTan/normalMagn;

		let sizePerStack = this.height / this.stacks;
		for (let sideDiv = 0; sideDiv <= this.stacks; sideDiv++) {

			let z = sideDiv * sizePerStack;
			let radius = (this.top*1.0 - this.base) / this.height * z + this.base;

			for (let radiusDiv = 0; radiusDiv <= this.slices; radiusDiv++) {

				let theta = radiusDiv * 2 * Math.PI / this.slices;

				/* Vertices coordinates */
				let x = Math.sin(theta);
				let y = Math.cos(theta);
				this.vertices.push(x * radius, y * radius, z)

				/* Normals */
				this.normals.push(x/normalMagn, y/normalMagn, normalz);

				/* Texture coordinates */
				let u = radiusDiv / this.slices;
				let v = sideDiv / this.stacks;
				this.texCoords.push(u, v);
			}	
		}

		let sideDivVertices = this.slices+1;
		for (let sideDiv = 0; sideDiv < this.stacks; sideDiv++) {
			for (let radiusDiv = 0; radiusDiv < this.slices; radiusDiv++) {
				let first = sideDiv * sideDivVertices + radiusDiv;
				let second = first + sideDivVertices;

				this.indices.push(first, second, first + 1);
				this.indices.push(second, second + 1, first + 1);
			}
		}
	}

	initBases() {

		/* Base and top outer vertices */
		for (let radiusDiv = 0; radiusDiv <= this.slices; radiusDiv++) {

			let theta = radiusDiv * 2 * Math.PI / this.slices;

			/* Vertices coordinates */
			let x = Math.sin(theta);
			let y = Math.cos(theta);
			this.vertices.push(x * this.base, y * this.base, 0);
			this.vertices.push(x * this.top, y * this.top, this.height);

			/* Normals */
			this.normals.push(0, 0, -1);
			this.normals.push(0, 0, 1);

			/* Texture coordinates */
			this.texCoords.push(-x/2 + 0.5, -y/2 + 0.5);
			this.texCoords.push(x/2 + 0.5, -y/2 + 0.5);
		}

		/* Center vertices */
		this.vertices.push(0, 0, 0);
		this.vertices.push(0, 0, this.height);

		this.normals.push(0,0,-1);
		this.normals.push(0,0,1);

		this.texCoords.push(0.5, 0.5);
		this.texCoords.push(0.5, 0.5);
		
		/* Indexes */
		let vertexCount = (this.slices+1) * (this.stacks+1);
		let centerBase = vertexCount + this.slices*2;
		let centerTop = centerBase+1;
		for (let radiusDiv = 0; radiusDiv < this.slices; radiusDiv++) {
			let indexBase = vertexCount + radiusDiv*2;			
			let indexTop = vertexCount + radiusDiv*2 + 1;

			this.indices.push(indexBase, indexBase+2, centerBase);
			this.indices.push(indexTop, centerTop, indexTop+2);
		}
	}

	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

		this.initSide();
		this.initBases();

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
	}

}