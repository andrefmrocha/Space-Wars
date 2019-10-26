class KeyframeAnimation extends Animation {

    constructor(scene, keyframes) {
        super();
        this.scene = scene;
        this.keyframes = keyframes;
        this.currentAnimation = mat4.create();
    }

    update() {
        this.clearMatrix();
        const currentInstant = Date.now() - this.initialTime;
        if (this.animationFinished(currentInstant))
            this.executeLastFrame();
        else
            this.executeAnimation(currentInstant);
    }

    executeAnimation(currentInstant) {
        for (let i = 0; i < this.keyframes.length; i++) {
            const keyframe = this.keyframes[i];
            const nextKeyFrame = this.keyframes[i + 1];
            if (nextKeyFrame && keyframe.instant < currentInstant && nextKeyFrame.instant > currentInstant) {
                this.translate(keyframe.translate);
                this.rotate(keyframe.rotation);
                this.scale(keyframe.scale);

                const time = 1 - ((nextKeyFrame.instant - currentInstant) /
                    (nextKeyFrame.instant - keyframe.instant));
                const translationX = (nextKeyFrame.translate[0] - keyframe.translate[0]) * time;
                const translationY = (nextKeyFrame.translate[1] - keyframe.translate[1]) * time;
                const translationZ = (nextKeyFrame.translate[2] - keyframe.translate[2]) * time;

                const angleX = (nextKeyFrame.rotation.angleX - keyframe.rotation.angleX) * time;
                const angleY = (nextKeyFrame.rotation.angleY - keyframe.rotation.angleY) * time;
                const angleZ = (nextKeyFrame.rotation.angleZ - keyframe.rotation.angleZ) * time;

                const scalingX = 1 + (nextKeyFrame.scale[0] - keyframe.scale[0]) * time;
                const scalingY = 1 + (nextKeyFrame.scale[1] - keyframe.scale[1]) * time;
                const scalingZ = 1 + (nextKeyFrame.scale[2] - keyframe.scale[2]) * time;

                this.translate([translationX, translationY, translationZ]);
                this.rotate({ angleX, angleY, angleZ });
                this.scale([scalingX, scalingY, scalingZ]);
                break;
            } else if (keyframe.instant > currentInstant && i == 0) {
                const time = 1 - ((keyframe.instant - currentInstant) /
                    (keyframe.instant - 0));
                const translationX = (keyframe.translate[0] - 0) * time;
                const translationY = (keyframe.translate[1] - 0) * time;
                const translationZ = (keyframe.translate[2] - 0) * time;

                const angleX = (keyframe.rotation.angleX - 0) * time;
                const angleY = (keyframe.rotation.angleY - 0) * time;
                const angleZ = (keyframe.rotation.angleZ - 0) * time;


                const scalingX = 1 + (keyframe.scale[0] - 1) * time;
                const scalingY = 1 + (keyframe.scale[1] - 1) * time;
                const scalingZ = 1 + (keyframe.scale[2] - 1) * time;
                this.translate([translationX, translationY, translationZ]);
                this.rotate({ angleX, angleY, angleZ });
                this.scale([scalingX, scalingY, scalingZ]);
                break;
            } else {
                this.translate(keyframe.translate);
                this.rotate(keyframe.rotation);
                this.scale(keyframe.scale);
            }

        }
    }

    translate(coords) {
        this.currentAnimation = mat4.translate(
            this.currentAnimation, this.currentAnimation, coords);
    }
    rotate(rotation) {
        this.currentAnimation = mat4.rotate(
            this.currentAnimation,
            this.currentAnimation,
            rotation.angleX,
            [1, 0, 0]);

        this.currentAnimation = mat4.rotate(
            this.currentAnimation,
            this.currentAnimation,
            rotation.angleY,
            [0, 1, 0]);

        this.currentAnimation = mat4.rotate(
            this.currentAnimation,
            this.currentAnimation,
            rotation.angleZ,
            [0, 0, 1]);

    }

    scale(coords) {
        this.currentAnimation = mat4.scale(this.currentAnimation, this.currentAnimation, coords);
    }

    animationFinished(currentInstant) {
        return this.keyframes[this.keyframes.length - 1].instant < currentInstant;
    }

    clearMatrix() {
        mat4.identity(this.currentAnimation);
    }

    executeLastFrame() {
        this.translate(this.keyframes[this.keyframes.length - 1].translate);
        this.keyframes.forEach((keyframe, index) => {
            if (index == 0) {
                this.rotate(keyframe.rotation);
            } else {
                const lastKeyframe = this.keyframes[index - 1];
                const angleX = (keyframe.rotation.angleX - lastKeyframe.rotation.angleX);
                const angleY = (keyframe.rotation.angleY - lastKeyframe.rotation.angleY);
                const angleZ = (keyframe.rotation.angleZ - lastKeyframe.rotation.angleZ);
                this.rotate({ angleX, angleY, angleZ })
            }
        });
        this.scale(this.keyframes[this.keyframes.length - 1].scale);
    }

    apply() {
        this.scene.multMatrix(this.currentAnimation);
    }
}