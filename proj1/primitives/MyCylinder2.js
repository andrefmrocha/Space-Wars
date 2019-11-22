class MyCylinder2 extends CGFobject {

    constructor(scene, base, top, height, slices, stacks) {
        super(scene);
        this.base = base;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;
        this.initCylinder();
    }

    initCylinder() {
        let controlVertices = [	
            // U = 0	
            [ // V = 0,1
                [this.base, 0, 0, 1 ],	
                [this.top, 0, this.height, 1 ]                
            ],
            // U = 1
            [ // V = 0,1
                [this.base, this.base/0.75, 0, 1 ],	
                [this.top, this.top/0.75, this.height, 1 ]      
            ],
            // U = 2
            [ // V = 0,1
                [-this.base, this.base/0.75, 0, 1 ],	
                [-this.top, this.top/0.75, this.height, 1 ]      
            ],
            // U = 3
            [ // V = 0,1
                [-this.base, 0, 0, 1 ],	
                [-this.top, 0, this.height, 1 ]      
            ]
        ];
        let nurbsSurface = new CGFnurbsSurface(3, 1, controlVertices);

        this.nurbsObj = new CGFnurbsObject(this.scene, this.slices, this.stacks, nurbsSurface);         
    }

    display() {
        this.nurbsObj.display();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 0, 0, 1);
        this.nurbsObj.display();
        this.scene.popMatrix();
    }
}