const transformationParser = {
  parseTransformations: (transformationsNode, transformations, sceneGraph) => {
    const children = transformationsNode.children;

    const grandChildren = [];

    // Any number of transformations.
    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'transformation') {
        sceneGraph.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      // Get id of the current transformation.
      const transformationID =  parserUtils.reader.getString(children[i], 'id');
      if (transformationID == null) return 'no ID defined for transformation';

      // Checks for repeated IDs.
      if (transformations[transformationID] != null)
        return 'ID must be unique for each transformation (conflict: ID = ' + transformationID + ')';

      grandChildren = children[i].children;
      // Specifications for the current transformation.
      transformations[transformationID] = transformationParser.parseTransformation(
        grandChildren,
        transformationID,
        sceneGraph
      );
    }

    return null;
  },
  parseTransformation: (transformationChildren, transformationID, sceneGraph) => {
    let transfMatrix = mat4.create();
    mat4.identity(transfMatrix);

    for (var j = 0; j < transformationChildren.length; j++) {
      switch (transformationChildren[j].nodeName) {
        case 'translate':
          var coordinates = parserUtils.parseCoordinates3D(
            transformationChildren[j],
            'translate transformation for ID ' + transformationID
          );
          if (!Array.isArray(coordinates)) return coordinates;

          transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
          break;
        case 'scale':
          const coords = parserUtils.parseCoordinates3D(
            transformationChildren[j],
            `scale information for ID ${transformationID}`
          );
          transfMatrix = mat4.scale(transfMatrix, transfMatrix, coords);
          break;
        case 'rotate':
          // angle
          const rotateInfo = transformationParser.parseRotation(transformationChildren[j]);
          transfMatrix = mat4.rotate(transfMatrix, transfMatrix, rotateInfo.angle, rotateInfo.axis);
          break;
      }
    }
    return transfMatrix;
  },

  parseRotation: rotate => {
    const axis = parserUtils.reader.getString(rotate, 'axis');
    const angle = parserUtils.reader.getFloat(rotate, 'angle');
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
          axisVec = [0, 0, 0];
          break;
      }
    }
    return {
      angle: this.DEGREE_TO_RAD * angle,
      axis: axisVec
    };
  }
};
