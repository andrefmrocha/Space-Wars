class MyTriangle extends CGFobject {

    constructor(scene) {
        super(scene);
        this.initBuffers();
    }

    initBuffers() {
        


        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

}