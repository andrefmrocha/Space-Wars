class MySecurityCamera extends CGFobject {

    constructor(scene) {
        super(scene);

        this.rectangle = new MyRectangle(scene, 0.5, 1, -1, -0.5);

        this.initShader();
    }

    initShader() {
        this.cameraShader = new CGFshader(this.scene.gl, "shaders/camera.vert", "shaders/camera.frag");
    }

    update(t) {
        if(!this.initialTime) this.initialTime = t;
        let timeSeconds = (t - this.initialTime)/1000;
        this.cameraShader.setUniformsValues({time: timeSeconds/4});
    }

    display(rtt) {
        this.scene.pushMatrix();
        this.scene.setActiveShader(this.cameraShader);
        rtt.bind();
        this.rectangle.display();
        
        this.scene.setActiveShader(this.scene.defaultShader);
        this.scene.popMatrix();
    }

}