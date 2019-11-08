class MySecurityCamera extends CGFobject {

    constructor(scene) {
        super(scene);

        this.rectangle = new MyRectangle(scene, -1, 1, -0.5, 0.5);

        this.initShader();
    }

    initShader() {
        //this.cameraShader = new CGFshader(this.scene.gl, "shaders/camera.vert", "shaders/camera.frag");
        //this.cameraShader.setUniformsValues({});
    }

    display(rtt) {
        this.scene.pushMatrix();
        rtt.bind();
        this.rectangle.display();
        this.scene.popMatrix();
    }

}