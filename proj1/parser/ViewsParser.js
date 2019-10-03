const viewsParser = {
  parsePerspectiveViews: (perspectiveNodes, sceneGraph) => {
    for (let i = 0; i < perspectiveNodes.length; i++) {
      const id = sceneGraph.reader.getString(perspectiveNodes[i], 'id');
      const near = sceneGraph.reader.getFloat(perspectiveNodes[i], 'near');
      const far = sceneGraph.reader.getFloat(perspectiveNodes[i], 'far');
      const angle = sceneGraph.reader.getFloat(perspectiveNodes[i], 'angle');
      const perspectiveChildren = perspectiveNodes[i].children;
      const errorMessage = `Error parsing of from object of perspective of ${id}`;
      let from, to;
      for (let j = 0; j < perspectiveChildren.length; j++) {
        if (perspectiveChildren[j].nodeName == 'from') {
          from = sceneGraph.parseCoordinates3D(
            perspectiveChildren[j],
            errorMessage
          );
        } else if (perspectiveChildren[j].nodeName == 'to') {
          to = sceneGraph.parseCoordinates3D(
            perspectiveChildren[j],
            errorMessage
          );
        }
      }
      if(from === errorMessage || to === errorMessage)
          sceneGraph.onXMLError(errorMessage);
      else
          sceneGraph.perspectives[id] = new CGFcamera(angle, near, far, from, to);
      
    }
  },
  parseOrthoViews: (orthoNodes, sceneGraph) => {
    for (let i = 0; i < orthoNodes.length; i++) {
      const id = sceneGraph.reader.getString(orthoNodes[i], 'id');
      const near = sceneGraph.reader.getFloat(orthoNodes[i], 'near');
      const far = sceneGraph.reader.getFloat(orthoNodes[i], 'far');
      const left = sceneGraph.reader.getFloat(orthoNodes[i], 'left');
      const right = sceneGraph.reader.getFloat(orthoNodes[i], 'right');
      const top = sceneGraph.reader.getFloat(orthoNodes[i], 'top');
      const bottom = sceneGraph.reader.getFloat(orthoNodes[i], 'bottom');
      const orthoChildren = orthoNodes[i].children;
      const errorMessage = `Error parsing of from object of perspective of ${id}`;
      let from, to, up;
      for (let j = 0; j < orthoChildren.length; j++) {
        if (orthoChildren[j].nodeName == 'from') {
          from = sceneGraph.parseCoordinates3D(
            orthoChildren[j],
            errorMessage
          );
        } else if (orthoChildren[j].nodeName == 'to') {
          to = sceneGraph.parseCoordinates3D(orthoChildren[j], errorMessage);
        } else if (orthoChildren[j].nodeName == 'up') {
          up = sceneGraph.parseCoordinates3D(orthoChildren[j], errorMessage);
        }
      }
      up = up ? up : [0, 1, 0];
      if(from === errorMessage || to === errorMessage || up === errorMessage)
          sceneGraph.onXMLError(errorMessage);
      else
        sceneGraph.perspectives[id] = new CGFCameraOrtho(left, right, bottom, top, near, far, from, to, up);
    }
  }
};
