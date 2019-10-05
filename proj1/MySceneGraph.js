'use strict';
var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
  /**
   * @constructor
   */

  constructor(filename, scene) {
    this.DEGREE_TO_RAD = Math.PI / 180;
    this.loadedOk = null;

    // Establish bidirectional references between scene and graph.
    this.scene = scene;
    scene.graph = this;

    this.nodes = [];

    this.idRoot = null; // The id of the root element.
    this.materialSwitch = 0;

    this.axisCoords = [];
    this.axisCoords['x'] = [1, 0, 0];
    this.axisCoords['y'] = [0, 1, 0];
    this.axisCoords['z'] = [0, 0, 1];

    // File reading
    this.reader = new CGFXMLreader();

    /*
     * Read the contents of the xml file, and refer to this class for loading and error handlers.
     * After the file is read, the reader calls onXMLReady on this object.
     * If any error occurs, the reader calls onXMLError on this object, with an error message
     */
    this.reader.open('scenes/' + filename, this);
  }

  /*
   * Callback to be executed after successful reading
   */
  onXMLReady() {
    this.log('XML Loading finished.');
    var rootElement = this.reader.xmlDoc.documentElement;

    // Here should go the calls for different functions to parse the various blocks
    var error = this.parseXMLFile(rootElement);

    if (error != null) {
      this.onXMLError(error);
      return;
    }

    this.loadedOk = true;

    /* As the graph loaded ok, signal the scene so that any additional
     initialization depending on the graph can take place
    */
    this.scene.onGraphLoaded();
  }

  /**
   * Parses the XML file, processing each block.
   * @param {XML root element} rootElement
   */
  parseXMLFile(rootElement) {
    if (rootElement.nodeName != 'lxs') return 'root tag <lxs> missing';

    var nodes = rootElement.children;

    // Reads the names of the nodes to an auxiliary buffer.
    var nodeNames = [];

    for (var i = 0; i < nodes.length; i++) {
      nodeNames.push(nodes[i].nodeName);
    }

    var error;

    // Processes each node, verifying errors.

    // <scene>
    var index;
    if ((index = nodeNames.indexOf('scene')) == -1) return 'tag <scene> missing';
    else {
      if (index != SCENE_INDEX) this.onXMLMinorError('tag <scene> out of order ' + index);

      //Parse scene block
      if ((error = this.parseScene(nodes[index])) != null) return error;
    }

    // <views>
    if ((index = nodeNames.indexOf('views')) == -1) return 'tag <views> missing';
    else {
      if (index != VIEWS_INDEX) this.onXMLMinorError('tag <views> out of order');

      //Parse views block
      if ((error = this.parseView(nodes[index])) != null) return error;
    }

    // <ambient>
    if ((index = nodeNames.indexOf('globals')) == -1) return 'tag <globals> missing';
    else {
      if (index != AMBIENT_INDEX) this.onXMLMinorError('tag <globals> out of order');

      //Parse ambient block
      if ((error = this.parseGlobals(nodes[index])) != null) return error;
    }

    // <lights>
    if ((index = nodeNames.indexOf('lights')) == -1) return 'tag <lights> missing';
    else {
      if (index != LIGHTS_INDEX) this.onXMLMinorError('tag <lights> out of order');

      //Parse lights block
      if ((error = this.parseLights(nodes[index])) != null) return error;
    }
    // <textures>
    if ((index = nodeNames.indexOf('textures')) == -1) return 'tag <textures> missing';
    else {
      if (index != TEXTURES_INDEX) this.onXMLMinorError('tag <textures> out of order');

      //Parse textures block
      if ((error = this.parseTextures(nodes[index])) != null) return error;
    }

    // <materials>
    if ((index = nodeNames.indexOf('materials')) == -1) return 'tag <materials> missing';
    else {
      if (index != MATERIALS_INDEX) this.onXMLMinorError('tag <materials> out of order');

      //Parse materials block
      if ((error = this.parseMaterials(nodes[index])) != null) return error;
    }

    // <transformations>
    if ((index = nodeNames.indexOf('transformations')) == -1) return 'tag <transformations> missing';
    else {
      if (index != TRANSFORMATIONS_INDEX) this.onXMLMinorError('tag <transformations> out of order');

      //Parse transformations block
      if ((error = this.parseTransformations(nodes[index])) != null) return error;
    }

    // <primitives>
    if ((index = nodeNames.indexOf('primitives')) == -1) return 'tag <primitives> missing';
    else {
      if (index != PRIMITIVES_INDEX) this.onXMLMinorError('tag <primitives> out of order');

      //Parse primitives block
      if ((error = this.parsePrimitives(nodes[index])) != null) return error;
    }

    // <components>
    if ((index = nodeNames.indexOf('components')) == -1) return 'tag <components> missing';
    else {
      if (index != COMPONENTS_INDEX) this.onXMLMinorError('tag <components> out of order');

      //Parse components block
      if ((error = this.parseComponents(nodes[index])) != null) return error;
    }
    this.log('all parsed');
  }

  /**
   * Parses the <scene> block.
   * @param {scene block element} sceneNode
   */
  parseScene(sceneNode) {
    // Get root of the scene.
    var root = this.reader.getString(sceneNode, 'root');
    if (root == null) return 'no root defined for scene';

    this.idRoot = root;

    // Get axis length
    var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
    if (axis_length == null) this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

    this.referenceLength = axis_length || 1;

    this.log('Parsed scene');

    return null;
  }

  /**
   * Parses the <views> block.
   * @param {view block element} viewsNode
   */
  parseView(viewsNode) {
    this.onXMLMinorError('To do: Parse views and create cameras.');
    this.perspectives = {};
    viewsParser.parsePerspectiveViews(viewsNode.getElementsByTagName('perspective'), this);
    viewsParser.parseOrthoViews(viewsNode.getElementsByTagName('ortho'), this);

    if (Object.keys(this.perspectives).length == 0) {
      return 'No perspectives found!';
    }

    Object.keys(this.perspectives).forEach((key, index) => {
      this.scene.viewsIDs[key] = index;
      this.scene.viewsList.push(this.perspectives[key]);
    });

    const defaultCamera = this.reader.getString(viewsNode, 'default');

    this.scene.addViews(defaultCamera);
    this.scene.onSelectedView();
    return null;
  }

  /**
   * Parses the <ambient> node.
   * @param {ambient block element} ambientsNode
   */
  parseGlobals(ambientsNode) {
    var children = ambientsNode.children;

    this.ambient = [];
    this.background = [];

    var nodeNames = [];

    for (var i = 0; i < children.length; i++) nodeNames.push(children[i].nodeName);

    var ambientIndex = nodeNames.indexOf('ambient');
    var backgroundIndex = nodeNames.indexOf('background');

    var color = this.parseColor(children[ambientIndex], 'ambient');
    if (!Array.isArray(color)) return color;
    else this.ambient = color;

    color = this.parseColor(children[backgroundIndex], 'background');
    if (!Array.isArray(color)) return color;
    else this.background = color;

    this.log('Parsed ambient');

    return null;
  }

  /**
   * Parses the <light> node.
   * @param {lights block element} lightsNode
   */
  parseLights(lightsNode) {
    var children = lightsNode.children;

    this.lights = [];
    var numLights = 0;

    var grandChildren = [];
    var nodeNames = [];

    // Any number of lights.
    for (var i = 0; i < children.length; i++) {
      // Storing light information
      var global = [];
      var attributeNames = [];
      var attributeTypes = [];

      //Check type of light
      if (children[i].nodeName != 'omni' && children[i].nodeName != 'spot') {
        this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      } else {
        attributeNames.push(...['location', 'ambient', 'diffuse', 'specular']);
        attributeTypes.push(...['position', 'color', 'color', 'color']);
      }

      // Get id of the current light.
      var lightId = this.reader.getString(children[i], 'id');
      if (lightId == null) return 'no ID defined for light';

      // Checks for repeated IDs.
      if (this.lights[lightId] != null) return 'ID must be unique for each light (conflict: ID = ' + lightId + ')';

      // Light enable/disable
      var enableLight = true;
      var aux = this.reader.getBoolean(children[i], 'enabled');
      if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
        this.onXMLMinorError(
          "unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'"
        );

      enableLight = aux || 1;

      //Add enabled boolean and type name to light info
      global.push(enableLight);
      global.push(children[i].nodeName);

      grandChildren = children[i].children;
      // Specifications for the current light.

      nodeNames = [];
      for (var j = 0; j < grandChildren.length; j++) {
        nodeNames.push(grandChildren[j].nodeName);
      }

      for (var j = 0; j < attributeNames.length; j++) {
        var attributeIndex = nodeNames.indexOf(attributeNames[j]);

        if (attributeIndex != -1) {
          if (attributeTypes[j] == 'position')
            var aux = this.parseCoordinates4D(grandChildren[attributeIndex], 'light position for ID' + lightId);
          else
            var aux = this.parseColor(
              grandChildren[attributeIndex],
              attributeNames[j] + ' illumination for ID' + lightId
            );

          if (!Array.isArray(aux)) return aux;

          global.push(aux);
        } else return 'light ' + attributeNames[i] + ' undefined for ID = ' + lightId;
      }

      // Gets the additional attributes of the spot light
      if (children[i].nodeName == 'spot') {
        var angle = this.reader.getFloat(children[i], 'angle');
        if (!(angle != null && !isNaN(angle))) return 'unable to parse angle of the light for ID = ' + lightId;

        var exponent = this.reader.getFloat(children[i], 'exponent');
        if (!(exponent != null && !isNaN(exponent))) return 'unable to parse exponent of the light for ID = ' + lightId;

        var targetIndex = nodeNames.indexOf('target');

        // Retrieves the light target.
        var targetLight = [];
        if (targetIndex != -1) {
          var aux = this.parseCoordinates3D(grandChildren[targetIndex], 'target light for ID ' + lightId);
          if (!Array.isArray(aux)) return aux;

          targetLight = aux;
        } else return 'light target undefined for ID = ' + lightId;

        global.push(...[angle, exponent, targetLight]);
      }

      this.lights[lightId] = global;
      numLights++;
    }

    if (numLights == 0) return 'at least one light must be defined';
    else if (numLights > 8) this.onXMLMinorError('too many lights defined; WebGL imposes a limit of 8 lights');

    this.log('Parsed lights');
    return null;
  }

  /**
   * Parses the <textures> block.
   * @param {textures block element} texturesNode
   */
  parseTextures(texturesNode) {
    //For each texture in textures block, check ID and file URL
    this.textures = [];
    const childrenNodes = texturesNode.getElementsByTagName('texture');
    for (let i = 0; i < childrenNodes.length; i++) {
      const id = this.reader.getString(childrenNodes[i], 'id');
      const file = this.reader.getString(childrenNodes[i], 'file');
      if (id && file) {
        this.textures[id] = new CGFtexture(this.scene, file);
      }
    }
    if (Object.keys(this.textures).length == 0) return 'No valid textures found!';

    return null;
  }

  /**
   * Parses the <materials> node.
   * @param {materials block element} materialsNode
   */
  parseMaterials(materialsNode) {
    var children = materialsNode.children;

    this.materials = [];

    // Any number of materials.
    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'material') {
        this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      // Get id of the current material.
      var materialID = this.reader.getString(children[i], 'id');
      if (materialID == null) return 'no ID defined for material';

      // Checks for repeated IDs.
      if (this.materials[materialID] != null)
        return 'ID must be unique for each light (conflict: ID = ' + materialID + ')';
      const material = this.parseMaterial(children[i]);
      if (material) this.materials[materialID] = material;
    }

    if (Object.keys(this.materials).length == 0) return 'No valid materials found!';

    this.log('Parsed materials');
    return null;
  }

  parseMaterial(material) {
    const children = material.children;
    const nodeNames = [];
    for (var j = 0; j < children.length; j++) {
      nodeNames.push(children[j].nodeName);
    }
    const emissionIndex = nodeNames.indexOf('emission');
    const ambientIndex = nodeNames.indexOf('ambient');
    const diffuseIndex = nodeNames.indexOf('diffuse');
    const specularIndex = nodeNames.indexOf('specular');
    const appearance = new CGFappearance(this.scene);
    appearance.setTextureWrap('REPEAT', 'REPEAT');
    if (emissionIndex != -1 && ambientIndex != -1 && diffuseIndex != -1 && specularIndex != -1) {
      const emission = this.parseMaterialColors(children[emissionIndex]);
      appearance.setEmission(emission.red, emission.green, emission.blue, emission.alpha);
      const ambient = this.parseMaterialColors(children[ambientIndex]);
      appearance.setAmbient(ambient.red, ambient.green, ambient.blue, ambient.alpha);
      const diffuse = this.parseMaterialColors(children[diffuseIndex]);
      appearance.setDiffuse(diffuse.red, diffuse.green, diffuse.blue, diffuse.alpha);
      const specular = this.parseMaterialColors(children[specularIndex]);
      appearance.setSpecular(specular.red, specular.green, specular.blue, specular.alpha);
    } else {
      return null;
    }
    return appearance;
  }

  parseMaterialColors(component) {
    const colors = {};
    colors.red = this.reader.getFloat(component, 'r');
    colors.green = this.reader.getFloat(component, 'g');
    colors.blue = this.reader.getFloat(component, 'b');
    colors.alpha = this.reader.getFloat(component, 'a');
    return colors;
  }

  /**
   * Parses the <transformations> block.
   * @param {transformations block element} transformationsNode
   */
  parseTransformations(transformationsNode) {
    var children = transformationsNode.children;

    this.transformations = [];

    var grandChildren = [];

    // Any number of transformations.
    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'transformation') {
        this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      // Get id of the current transformation.
      var transformationID = this.reader.getString(children[i], 'id');
      if (transformationID == null) return 'no ID defined for transformation';

      // Checks for repeated IDs.
      if (this.transformations[transformationID] != null)
        return 'ID must be unique for each transformation (conflict: ID = ' + transformationID + ')';

      grandChildren = children[i].children;
      // Specifications for the current transformation.
      this.transformations[transformationID] = this.parseTransformation(grandChildren, transformationID);
    }

    this.log('Parsed transformations');
    return null;
  }

  parseTransformation(transformationChildren, transformationID) {
    let transfMatrix = mat4.create();
    mat4.identity(transfMatrix);

    for (var j = 0; j < transformationChildren.length; j++) {
      switch (transformationChildren[j].nodeName) {
        case 'translate':
          var coordinates = this.parseCoordinates3D(
            transformationChildren[j],
            'translate transformation for ID ' + transformationID
          );
          if (!Array.isArray(coordinates)) return coordinates;

          transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
          break;
        case 'scale':
          const coords = this.parseCoordinates3D(
            transformationChildren[j],
            `scale information for ID ${transformationID}`
          );
          transfMatrix = mat4.scale(transfMatrix, transfMatrix, coords);
          break;
        case 'rotate':
          // angle
          const rotateInfo = this.parseRotation(transformationChildren[j]);
          transfMatrix = mat4.rotate(transfMatrix, transfMatrix, rotateInfo.angle, rotateInfo.axis);
          break;
      }
    }
    return transfMatrix;
  }

  parseRotation(rotate) {
    const axis = this.reader.getString(rotate, 'axis');
    const angle = this.reader.getFloat(rotate, 'angle');
    let axisVec;
    if (angle && axis) {
      switch (axis) {
        case 'x':
          axisVec = [1, 0, 0];
          break;
        case 'y':
          axisVec = [0, 1, 0];
          break;
        case 'z':
          axisVec = [0, 0, 1];
          break;
        default:
          axisVec = [0, 0, 1];
          break;
      }
    }
    return {
      angle: this.DEGREE_TO_RAD * angle,
      axis: axisVec
    };
  }


  /**
   * Parses the <primitives> block.
   * @param {primitives block element} primitivesNode
   */
  parsePrimitives(primitivesNode) {
    var children = primitivesNode.children;

    this.primitives = [];

    var grandChildren = [];

    // Any number of primitives.
    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'primitive') {
        this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      // Get id of the current primitive.
      var primitiveId = this.reader.getString(children[i], 'id');
      if (primitiveId == null) return 'no ID defined for texture';

      // Checks for repeated IDs.
      if (this.primitives[primitiveId] != null)
        return 'ID must be unique for each primitive (conflict: ID = ' + primitiveId + ')';

      grandChildren = children[i].children;

      // Validate the primitive type
      if (
        grandChildren.length != 1 ||
        (grandChildren[0].nodeName != 'rectangle' &&
          grandChildren[0].nodeName != 'triangle' &&
          grandChildren[0].nodeName != 'cylinder' &&
          grandChildren[0].nodeName != 'sphere' &&
          grandChildren[0].nodeName != 'torus')
      ) {
        return 'There must be exactly 1 primitive type (outerrectangle, triangle, cylinder, sphere or torus)';
      }

      // Specifications for the current primitive.
      const primitiveType = grandChildren[0].nodeName;

      // Retrieves the primitive coordinates.
      switch (primitiveType) {
        case 'rectangle':
          this.primitives[primitiveId] = primitiveParsers.parseRectangle(grandChildren[0], this.scene, primitiveId);
          break;

        case 'cylinder':
          this.primitives[primitiveId] = primitiveParsers.parseCylinder(grandChildren[0], this.scene, primitiveId);
          break;

        case 'sphere':
          this.primitives[primitiveId] = primitiveParsers.parseSphere(grandChildren[0], this.scene, primitiveId);
          break;

        case 'torus':
          this.primitives[primitiveId] = primitiveParsers.parseTorus(grandChildren[0], this.scene, primitiveId);
          break;

        case 'triangle':
          this.primitives[primitiveId] = primitiveParsers.parseTriangle(grandChildren[0], this.scene, primitiveId);
          break;
        default:
          console.warn('Unkown primitive!');
      }
    }
    this.log('Parsed primitives');
    return null;
  }

  /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
  parseComponents(componentsNode) {
    var children = componentsNode.children;

    this.components = {};

    var grandChildren = [];
    var grandgrandChildren = [];
    var nodeNames = [];

    // Any number of components.
    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'component') {
        this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      // Get id of the current component.
      var componentID = this.reader.getString(children[i], 'id');
      if (componentID == null) return 'no ID defined for componentID';

      // Checks for repeated IDs.
      if (this.components[componentID] != null)
        return 'ID must be unique for each component (conflict: ID = ' + componentID + ')';

      grandChildren = children[i].children;

      nodeNames = [];
      for (var j = 0; j < grandChildren.length; j++) {
        nodeNames.push(grandChildren[j].nodeName);
      }

      var transformationIndex = nodeNames.indexOf('transformation');
      var materialsIndex = nodeNames.indexOf('materials');
      var textureIndex = nodeNames.indexOf('texture');
      var childrenIndex = nodeNames.indexOf('children');

      const currentComponent = {};
      this.onXMLMinorError('To do: Parse components.');

      // Transformations
      currentComponent.transformation = this.parseComponentTransformations(grandChildren[transformationIndex].children);

      // Materials
      currentComponent.materials = this.parseComponentMaterials(
        grandChildren[materialsIndex].getElementsByTagName('material')
      );

      // Texture
      currentComponent.texture = textureIndex != -1 ? this.parseComponentTexture(grandChildren[textureIndex]) : null;

      // Children
      currentComponent.children = this.parsePrimitiveChildren(
        grandChildren[childrenIndex].getElementsByTagName('primitiveref')
      );
      currentComponent.children = currentComponent.children.concat(
        this.parseComponentChildren(grandChildren[childrenIndex].getElementsByTagName('componentref'))
      );

      this.components[componentID] = currentComponent;
    }
  }

  parseComponentTexture(textureRef) {
    const lengthS = this.reader.getFloat(textureRef, 'length_s');
    const lengthT = this.reader.getFloat(textureRef, 'length_t');
    const textureID = this.reader.getString(textureRef, 'id');
    const texture = textureID == 'inherit' || textureID == 'none' ? textureID : this.textures[textureID];
    return {
      lengthS: lengthS ? lengthS : 1,
      lengthT: lengthT ? lengthT : 1,
      texture: texture ? texture : null
    };
  }

  parseComponentTransformations(componentTransformation) {
    const transformationChildren = [];
    for (var j = 0; j < componentTransformation.length; j++) {
      transformationChildren.push(componentTransformation[j].nodeName);
    }
    const primitiveRefIndex = transformationChildren.indexOf('transformationref');
    if (primitiveRefIndex != -1) {
      return this.transformations[this.reader.getString(componentTransformation[primitiveRefIndex], 'id')];
    }
    return this.parseTransformation(componentTransformation, 'ComponentID');
  }

  parseComponentMaterials(materials) {
    const componentMaterials = [];
    for (let i = 0; i < materials.length; i++) {
      const materialID = this.reader.getString(materials[i], 'id');
      if (materialID == 'inherit') {
        componentMaterials.push('inherit');
      } else if (this.materials[materialID] != null) {
        componentMaterials.push(this.materials[materialID]);
      }
    }
    return componentMaterials;
  }

  parseComponentChildren(componentChildren) {
    const components = [];
    for (let i = 0; i < componentChildren.length; i++) {
      components.push(this.components[this.reader.getString(componentChildren[i], 'id')]);
    }
    return components;
  }

  parsePrimitiveChildren(primitiveChildren) {
    const components = [];
    for (let i = 0; i < primitiveChildren.length; i++) {
      const primitive = this.primitives[this.reader.getString(primitiveChildren[i], 'id')];
      components.push(primitive);
    }
    return components;
  }

  /**
   * Parse the coordinates from a node with ID = id
   * @param {block element} node
   * @param {message to be displayed in case of error} messageError
   */
  parseCoordinates3D(node, messageError) {
    var position = [];

    // x
    var x = this.reader.getFloat(node, 'x');
    if (!(x != null && !isNaN(x))) return 'unable to parse x-coordinate of the ' + messageError;

    // y
    var y = this.reader.getFloat(node, 'y');
    if (!(y != null && !isNaN(y))) return 'unable to parse y-coordinate of the ' + messageError;

    // z
    var z = this.reader.getFloat(node, 'z');
    if (!(z != null && !isNaN(z))) return 'unable to parse z-coordinate of the ' + messageError;

    position.push(...[x, y, z]);

    return position;
  }

  /**
   * Parse the coordinates from a node with ID = id
   * @param {block element} node
   * @param {message to be displayed in case of error} messageError
   */
  parseCoordinates4D(node, messageError) {
    var position = [];

    //Get x, y, z
    position = this.parseCoordinates3D(node, messageError);

    if (!Array.isArray(position)) return position;

    // w
    var w = this.reader.getFloat(node, 'w');
    if (!(w != null && !isNaN(w))) return 'unable to parse w-coordinate of the ' + messageError;

    position.push(w);

    return position;
  }

  /**
   * Parse the color components from a node
   * @param {block element} node
   * @param {message to be displayed in case of error} messageError
   */
  parseColor(node, messageError) {
    var color = [];

    // R
    var r = this.reader.getFloat(node, 'r');
    if (!(r != null && !isNaN(r) && r >= 0 && r <= 1)) return 'unable to parse R component of the ' + messageError;

    // G
    var g = this.reader.getFloat(node, 'g');
    if (!(g != null && !isNaN(g) && g >= 0 && g <= 1)) return 'unable to parse G component of the ' + messageError;

    // B
    var b = this.reader.getFloat(node, 'b');
    if (!(b != null && !isNaN(b) && b >= 0 && b <= 1)) return 'unable to parse B component of the ' + messageError;

    // A
    var a = this.reader.getFloat(node, 'a');
    if (!(a != null && !isNaN(a) && a >= 0 && a <= 1)) return 'unable to parse A component of the ' + messageError;

    color.push(...[r, g, b, a]);

    return color;
  }

  /*
   * Callback to be executed on any read error, showing an error on the console.
   * @param {string} message
   */
  onXMLError(message) {
    console.error('XML Loading Error: ' + message);
    this.loadedOk = false;
  }

  /**
   * Callback to be executed on any minor error, showing a warning on the console.
   * @param {string} message
   */
  onXMLMinorError(message) {
    console.warn('Warning: ' + message);
  }

  /**
   * Callback to be executed on any message.
   * @param {string} message
   */
  log(message) {
    console.log('   ' + message);
  }

  updateMaterial() {
    this.materialSwitch += 1;
  }

  /**
   * Displays the scene, processing each node, starting in the root node.
   */
  displayScene() {
    this.displayComponent(this.components[this.idRoot], null, null, 1, 1);
  }

  /**
   * Displays a component and all its children recursively
   */
  displayComponent(component, pMaterial, pTexture, pLengthS, pLengthT) {
    // if primitive
    if (component instanceof CGFobject) {
      // materials and texture
      if (pMaterial) {
        let matCopy = Object.assign(Object.create(Object.getPrototypeOf(pMaterial)), pMaterial);
        if (pTexture) matCopy.setTexture(pTexture);
        if (component.updateTexCoords) component.updateTexCoords(pLengthS, pLengthT);
        matCopy.apply();
      }

      // display primitive
      component.display();
    } else {
      this.scene.pushMatrix();

      // multiply transformations
      this.scene.multMatrix(component.transformation);

      let cMaterial = component.materials[this.materialSwitch % component.materials.length];
      if (cMaterial == 'inherit') cMaterial = pMaterial;

      let cTextureObj = component.texture;
      let cTexture = cTextureObj.texture;
      let cLengthS = cTextureObj.lengthS;
      let cLengthT = cTextureObj.lengthT;

      if (cTexture == 'none') {
        cTexture = null;
      } else if (cTexture == 'inherit') {
        cTexture = pTexture;
        cLengthS = pLengthS;
        cLengthT = pLengthT;
      }

      component.children.forEach(child => {
        this.displayComponent(child, cMaterial, cTexture, cLengthS, cLengthT);
      });

      this.scene.popMatrix();
    }
  }
}
