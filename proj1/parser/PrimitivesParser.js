
/**
 * @param  {XMLCollection Object} primitive
 * @param  {string} attribute
 * @param  {string} errorMessage
 * @param  {MySceneGraph} sceneGraph
 */

function getPrimitiveInformation(primitive, attribute, errorMessage, sceneGraph) {
  const attributeValue = parserUtils.reader.getFloat(primitive, attribute);

  if (!(attributeValue != null && !isNaN(attributeValue))) sceneGraph.onXMLError(errorMessage);
  else return attributeValue;
}

const primitiveParsers = {
  /**
   * @param  {XMLCollection Object} primitivesNode
   * @param  {Object} primitives
   * @param  {MySceneGraph} sceneGraph
   */
  parsePrimitives: (primitivesNode, primitives, sceneGraph) => {
    var children = primitivesNode.children;

    // Any number of primitives.
    for (let i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'primitive') {
        sceneGraph.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      // Get id of the current primitive.
      var primitiveId = parserUtils.reader.getString(children[i], 'id');
      if (!primitiveId) return 'no ID defined for texture';

      // Checks for repeated IDs.
      if (primitives[primitiveId] != null)
        return 'ID must be unique for each primitive (conflict: ID = ' + primitiveId + ')';

      const grandChildren = children[i].children;

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
      let primitive;

      // Retrieves the primitive coordinates.
      switch (primitiveType) {
        case 'rectangle':
          primitive = primitiveParsers.parseRectangle(grandChildren[0], sceneGraph.scene, primitiveId, sceneGraph);
          break;

        case 'cylinder':
          primitive = primitiveParsers.parseCylinder(grandChildren[0], sceneGraph.scene, primitiveId, sceneGraph);
          break;

        case 'sphere':
          primitive = primitiveParsers.parseSphere(grandChildren[0], sceneGraph.scene, primitiveId, sceneGraph);
          break;

        case 'torus':
          primitive = primitiveParsers.parseTorus(grandChildren[0], sceneGraph.scene, primitiveId, sceneGraph);
          break;

        case 'triangle':
          primitive = primitiveParsers.parseTriangle(grandChildren[0], sceneGraph.scene, primitiveId, sceneGraph);
          break;
        default:
          console.warn('Unkown primitive!');
      }
      if (primitive && sceneGraph.loadedOk) primitives[primitiveId] = primitive;
    }

    if (Object.keys(primitives).length == 0) return 'No valid primitives found!';
    return null;
  },

  /**
   * @param  {XMLCollection Object} component
   * @param  {MyScene} scene
   * @param  {string} primitiveId
   * @param  {MySceneGraph} sceneGraph
   */
  parseRectangle: (component, scene, primitiveId, sceneGraph) => {
    // x1
    const x1 = getPrimitiveInformation(
      component,
      'x1',
      'unable to parse x1 of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    // y1
    const y1 = getPrimitiveInformation(
      component,
      'y1',
      'unable to parse y1 of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    // x2
    const x2 = getPrimitiveInformation(
      component,
      'x2',
      'unable to parse x2 of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    // y2
    const y2 = getPrimitiveInformation(
      component,
      'y2',
      'unable to parse y2 of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    return new MyRectangle(scene, primitiveId, x1, x2, y1, y2);
  },

  /**
   * @param  {XMLCollection Object} component
   * @param  {MyScene} scene
   * @param  {string} primitiveId
   * @param  {MySceneGraph} sceneGraph
   */
  parseCylinder: (component, scene, primitiveId, sceneGraph) => {
    const base = getPrimitiveInformation(
      component,
      'base',
      'unable to parse base of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const top = getPrimitiveInformation(component, 'top');

    const height = getPrimitiveInformation(
      component,
      'height',
      'unable to parse height of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const cylinderSlices = getPrimitiveInformation(
      component,
      'slices',
      'unable to parse slices of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const cylinderStacks = getPrimitiveInformation(
      component,
      'stacks',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );
    return new MyCylinder(scene, height, base, top, cylinderSlices, cylinderStacks);
  },

  /**
   * @param  {XMLCollection Object} component
   * @param  {MyScene} scene
   * @param  {string} primitiveId
   * @param  {MySceneGraph} sceneGraph
   */
  parseSphere: (component, scene, primitiveId, sceneGraph) => {
    const sphereStacks = getPrimitiveInformation(
      component,
      'stacks',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const sphereSlices = getPrimitiveInformation(
      component,
      'slices',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const sphereRadius = getPrimitiveInformation(
      component,
      'radius',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );
    return new MySphere(scene, sphereRadius, sphereSlices, sphereStacks);
  },

  /**
   * @param  {XMLCollection Object} component
   * @param  {MyScene} scene
   * @param  {string} primitiveId
   * @param  {MySceneGraph} sceneGraph
   */
  parseTorus: (component, scene, primitiveId, sceneGraph) => {
    const torusSlices = getPrimitiveInformation(
      component,
      'slices',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const torusInner = getPrimitiveInformation(
      component,
      'inner',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const torusOuter = getPrimitiveInformation(
      component,
      'outer',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const torusLoops = getPrimitiveInformation(
      component,
      'loops',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );
    return new MyTorus(scene, torusInner, torusOuter, torusSlices, torusLoops);
  },

  /**
   * @param  {XMLCollection Object} component
   * @param  {MyScene} scene
   * @param  {string} primitiveId
   * @param  {MySceneGraph} sceneGraph
   */
  parseTriangle: (component, scene, primitiveId, sceneGraph) => {
    const triX1 = getPrimitiveInformation(
      component,
      'x1',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const triX2 = getPrimitiveInformation(
      component,
      'x2',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const triX3 = getPrimitiveInformation(
      component,
      'x3',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const triY1 = getPrimitiveInformation(
      component,
      'y1',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const triY2 = getPrimitiveInformation(
      component,
      'y2',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const triY3 = getPrimitiveInformation(
      component,
      'y3',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const triZ1 = getPrimitiveInformation(
      component,
      'z1',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const triZ2 = getPrimitiveInformation(
      component,
      'z2',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );

    const triZ3 = getPrimitiveInformation(
      component,
      'z3',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId,
      sceneGraph
    );
    return new MyTriangle(scene, triX1, triY1, triZ1, triX2, triY2, triZ2, triX3, triY3, triZ3);
  }
};
