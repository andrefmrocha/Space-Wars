const reader = new CGFXMLreader();

function getPrimitiveInformation (primitive, attribute, errorMessage) {
    const attributeValue = reader.getFloat(primitive, attribute);

    if (!(attributeValue != null && !isNaN(attributeValue))) this.onXMLError(errorMessage);
    else return attributeValue;
}
const primitiveParsers = {
  parseRectangle: (component, scene, primitiveId) => {
    // x1
    const x1 = getPrimitiveInformation(
      component,
      'x1',
      'unable to parse x1 of the primitive coordinates for ID = ' + primitiveId
    );

    // y1
    const y1 = getPrimitiveInformation(
      component,
      'y1',
      'unable to parse y1 of the primitive coordinates for ID = ' + primitiveId
    );

    // x2
    const x2 = getPrimitiveInformation(
      component,
      'x2',
      'unable to parse x2 of the primitive coordinates for ID = ' + primitiveId
    );

    // y2
    const y2 = getPrimitiveInformation(
      component,
      'y2',
      'unable to parse y2 of the primitive coordinates for ID = ' + primitiveId
    );

    return new MyRectangle(scene, primitiveId, x1, x2, y1, y2);
  },

  parseCylinder: (component, scene, primitiveId) => {
    const base = getPrimitiveInformation(
      component,
      'base',
      'unable to parse base of the primitive coordinates for ID = ' + primitiveId
    );

    const top = getPrimitiveInformation(component, 'top');

    const height = getPrimitiveInformation(
      component,
      'height',
      'unable to parse height of the primitive coordinates for ID = ' + primitiveId
    );

    const cylinderSlices = getPrimitiveInformation(
      component,
      'slices',
      'unable to parse slices of the primitive coordinates for ID = ' + primitiveId
    );

    const cylinderStacks = getPrimitiveInformation(
      component,
      'stacks',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId
    );
    return new MyCylinder(scene, height, base, top, cylinderSlices, cylinderStacks);
  },
  parseSphere: (component, scene, primitiveId) => {
    const sphereStacks = getPrimitiveInformation(
      component,
      'stacks',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId
    );

    const sphereSlices = getPrimitiveInformation(
      component,
      'slices',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId
    );

    const sphereRadius = getPrimitiveInformation(
      component,
      'radius',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId
    );
    return new MySphere(scene, sphereRadius, sphereSlices, sphereStacks);
  },

  parseTorus: (component, scene, primitiveId) => {
    const torusSlices = getPrimitiveInformation(
      component,
      'slices',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId
    );

    const torusInner = getPrimitiveInformation(
      component,
      'inner',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId
    );

    const torusOuter = getPrimitiveInformation(
      component,
      'outer',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId
    );

    const torusLoops = getPrimitiveInformation(
      component,
      'loops',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId
    );
    return new MyTorus(scene, torusInner, torusOuter, torusSlices, torusLoops);
  },

  parseTriangle: (component, scene, primitiveId) => {
    const triX1 = getPrimitiveInformation(
      component,
      'x1',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId
    );

    const triX2 = getPrimitiveInformation(
      component,
      'x2',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId
    );

    const triX3 = getPrimitiveInformation(
      component,
      'x3',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId
    );

    const triY1 = getPrimitiveInformation(
      component,
      'y1',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId
    );

    const triY2 = getPrimitiveInformation(
      component,
      'y2',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId
    );

    const triY3 = getPrimitiveInformation(
      component,
      'y3',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId
    );

    const triZ1 = getPrimitiveInformation(
      component,
      'z1',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId
    );

    const triZ2 = getPrimitiveInformation(
      component,
      'z2',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId
    );

    const triZ3 = getPrimitiveInformation(
      component,
      'z3',
      'unable to parse stacks of the primitive coordinates for ID = ' + primitiveId
    );
    return new MyTriangle(scene, triX1, triY1, triZ1, triX2, triY2, triZ2, triX3, triY3, triZ3);
  }
};
