class KeyframeAnimation extends Animation {

    constructor(scene, keyframes, isLoop) {
        super();
        this.isLoop = isLoop;
        this.scene = scene;
        this.keyframes = keyframes;
        this.keyframes.forEach((keyframe, index) => {
            const lastKeyframe = index > 0 ? this.keyframes[index - 1] : {
                scale: [1, 1, 1],
                instant: 0
            };
            const n = ((keyframe.instant - lastKeyframe.instant)/1000) * 30;
            this.keyframes[index].n = n;
            this.keyframes[index].r = keyframe.scale.map((coord, index) =>{
                return Math.pow((coord/lastKeyframe.scale[index]), 1/n);
            });
        });
        this.currentAnimation = mat4.create();
    }

    update(currentInstant) {
        this.clearMatrix();
        if (this.animationFinished(currentInstant))
            this.executeLastFrame();
        else
            this.executeAnimation((currentInstant - this.initialTime));
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
                
                const scale = keyframe.scale.map((coord, index)=>{
                    const r = nextKeyFrame.r[index];
                    const nextCoord = nextKeyFrame.scale[index];
                    const k = time * nextKeyFrame.n;
                    return ((coord - nextCoord) + r < 1 ? 0 : 1) * Math.pow(r, k);
                });

                const translationX = (nextKeyFrame.translate[0] - keyframe.translate[0]) * time;
                const translationY = (nextKeyFrame.translate[1] - keyframe.translate[1]) * time;
                const translationZ = (nextKeyFrame.translate[2] - keyframe.translate[2]) * time;

                const angleX = (nextKeyFrame.rotation.angleX - keyframe.rotation.angleX) * time;
                const angleY = (nextKeyFrame.rotation.angleY - keyframe.rotation.angleY) * time;
                const angleZ = (nextKeyFrame.rotation.angleZ - keyframe.rotation.angleZ) * time;

                this.translate([translationX, translationY, translationZ]);
                this.rotate({ angleX, angleY, angleZ });
                this.scale(scale);
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

                const scale = keyframe.scale.map((_, index) => {
                    const r = keyframe.r[index];
                    const k = time * keyframe.n;
                    return 1 * Math.pow(r, k);
                });
                
                this.translate([translationX, translationY, translationZ]);
                this.rotate({ angleX, angleY, angleZ });
                this.scale(scale);
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
        const instant = currentInstant - this.initialTime;
        if (this.keyframes[this.keyframes.length - 1].instant <= instant && this.isLoop){
            this.initialTime = currentInstant;
            return false;
        }
            
        return this.keyframes[this.keyframes.length - 1].instant < instant;
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