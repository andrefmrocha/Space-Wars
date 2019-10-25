class MyPatch extends CGFobject {

    constructor(scene, nPointsU, nPointsV, nPartsU, nPartsV) {
        super(scene);
        this.nPointsU = nPointsU;
        this.nPointsV = nPointsV;
        this.nPartsU = nPartsU;
        this.nPartsV = nPartsV;
        this.initBuffers();
    }

    initBuffers() {

        
    }
}