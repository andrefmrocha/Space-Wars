class MyCylinder2 extends CGFobject {

    constructor(scene, base, top, height, slices, stacks) {
        super(scene);
        this.base = base;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
    }

    initBuffers() {

        
    }
}