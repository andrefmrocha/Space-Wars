/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
  /**
   * @constructor
   * @param {MyInterface} myinterface
   */
  constructor(myinterface) {
    super();

    this.interface = myinterface;
  }

  /**
   * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
   * @param {CGFApplication} application
   */
  init(application) {
    super.init(application);

    this.sceneInited = false;

    this.currentView;
    this.initCameras();

    this.enableTextures(true);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.axis = new CGFaxis(this);
    this.setUpdatePeriod(1000/30); // 30 fps
    this.viewsList = [];
    this.viewsIDs = {};
  }

  addViews(defaultCamera) {
    this.currentView = defaultCamera ? this.viewsIDs[defaultCamera] : Object.keys(this.viewsList)[0];
    this.interface.gui
      .add(this, 'currentView', this.viewsIDs)
      .name('Views')
      .onChange(this.onSelectedView.bind(this));
  }

  onSelectedView() {
    this.camera = this.viewsList[this.currentView];
    this.interface.setActiveCamera(this.camera);
  }

  /**
   * Initializes the scene cameras.
   */
  initCameras() {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
  }
  /**
   * Initializes the scene lights with the values read from the XML file.
   */
  initLights() {
    // Reads the lights from the scene graph.
    this.lightsState={};
    Object.keys(this.graph.lights).forEach((key, index) => {
      if (index < 8) { // Only eight lights allowed by WebGL.
        const light = this.graph.lights[key];

        const attenuation = light[6];
        this.lights[index].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
        this.lights[index].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
        this.lights[index].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
        this.lights[index].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);
        console.log(light);
        if (attenuation.constant) this.lights[index].setConstantAttenuation(attenuation.constant);
        if (attenuation.linear) this.lights[index].setLinearAttenuation(attenuation.linear);
        if (attenuation.quadratic) this.lights[index].setQuadraticAttenuation(attenuation.quadratic);

        if (light[1] == 'spot') {
          this.lights[index].setSpotCutOff(light[7]);
          this.lights[index].setSpotExponent(light[8]);
          this.lights[index].setSpotDirection(light[9][0], light[9][1], light[9][2]);
        }

        this.lights[index].setVisible(true);
        if (light[0]) this.lights[index].enable();
        else this.lights[index].disable();

        this.lights[index].update();
        this.lightsState[key] = {
          isEnabled: light[0],
          lightIndex: index
        };
      }

    });

    this.addLightsToInterface();
  }

  addLightsToInterface(){
    Object.keys(this.lightsState).forEach(key => {
      this.interface.gui.add(this.lightsState[key], 'isEnabled').name(key);
    });
  }

  updateLights(){
    Object.keys(this.lightsState).forEach(key => {
      const currentLightState = this.lightsState[key];
      const currentLight = this.lights[currentLightState.lightIndex];
      if(currentLightState.isEnabled)
        currentLight.enable();
      else
        currentLight.disable();  
      currentLight.update();  
    })
  }

  setDefaultAppearance() {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
  }
  /** Handler called when the graph is finally loaded.
   * As loading is asynchronous, this may be called already after the application has started the run loop
   */
  onGraphLoaded() {
    this.axis = new CGFaxis(this, this.graph.referenceLength);

    this.gl.clearColor(
      this.graph.background[0],
      this.graph.background[1],
      this.graph.background[2],
      this.graph.background[3]
    );

    this.setGlobalAmbientLight(
      this.graph.ambient[0],
      this.graph.ambient[1],
      this.graph.ambient[2],
      this.graph.ambient[3]
    );

    this.initLights();

    this.sceneInited = true;
  }

  update(t) {
    this.checkKeys();
  }

  checkKeys() {
    if (this.gui.isKeyPressed('KeyM')) {
      this.graph.updateMaterial();
    }
  }

  /**
   * Displays the scene.
   */
  display() {
    // ---- BEGIN Background, camera and axis setup

    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();
    
    this.pushMatrix();
    this.axis.display();
    
    if (this.sceneInited) {
      // Draw axis
      this.updateLights(); 
      this.setDefaultAppearance();

      // Displays the scene (MySceneGraph function).
      this.graph.displayScene();
    }

    this.popMatrix();
    // ---- END Background, camera and axis setup
  }
}
