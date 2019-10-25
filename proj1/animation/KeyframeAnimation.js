class KeyframeAnimation extends Animation {

    constructor(scene, keyframes) {
        super();
        this.scene = scene;
        this.keyframes = keyframes;
        this.initialTime = Date.now();
        this.currentTranslation = mat4.create();
        this.currentScaling = mat4.create();
        this.currentRotation = mat4.create();
    }

    update() {
        const currentInstant = Date.now() - this.initialTime;
        mat4.identity(this.currentTranslation);
        mat4.identity(this.currentScaling);
        mat4.identity(this.currentRotation);
        this.keyframes.forEach((keyframe, index) => {
            const nextKeyFrame = this.keyframes[index + 1];
            if (keyframe.instant < currentInstant && nextKeyFrame.instant > currentInstant) {
                const time = (nextKeyFrame.instant - currentInstant) /
                    (nextKeyFrame.instant - keyframe.instant);

                const x = (nextKeyFrame.translate[0] - keyframe.translate[0]) / time;
                const y = (nextKeyFrame.translate[1] - keyframe.translate[1]) / time;
                const z = (nextKeyFrame.translate[2] - keyframe.translate[2]) / time;
                this.currentTranslation = mat4.translate(
                    this.currentTranslation, this.currentTranslation, [x, y, z]);

            }
        });
    }

    apply() {
        this.scene.multMatrix(this.currentTranslation);
        this.scene.multMatrix(this.currentRotation);
        this.scene.multMatrix(this.currentScaling);
    }
}