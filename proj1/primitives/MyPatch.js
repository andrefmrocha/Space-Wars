class MyPatch extends CGFobject {

    constructor(scene, nPointsU, nPointsV, nPartsU, nPartsV, controlVertices) {
        super(scene);
        this.degree1 = nPointsU-1;
        this.degree2 = nPointsV-1;
        this.nPartsU = nPartsU;
        this.nPartsV = nPartsV;
        this.controlVertices = controlVertices;

        this.initPatch();
    }

    initPatch() {
        let nurbsSurface = new CGFnurbsSurface(this.degree1, this.degree2, this.controlVertices);

        this.nurbsObj = new CGFnurbsObject(this.scene, this.nPartsU, this.nPartsV, nurbsSurface);        
    }

    display() {
        this.nurbsObj.display();
    }
}