const materialsParser = {
  parseMaterials: (materialsNode, materials, sceneGraph) => {
    const children = materialsNode.children;

    // Any number of materials.
    for (let i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'material') {
        sceneGraph.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      // Get id of the current material.
      const materialID = parserUtils.reader.getString(children[i], 'id');
      if (materialID == null) return 'no ID defined for material';

      // Checks for repeated IDs.
      if (materials[materialID] != null) return 'ID must be unique for each light (conflict: ID = ' + materialID + ')';
      const material = materialsParser.parseMaterial(children[i], sceneGraph);
      if (material) materials[materialID] = material;
    }

    if (Object.keys(materials).length == 0) return 'No valid materials found!';

    sceneGraph.log('Parsed materials');
    return null;
  },

  parseMaterial: (materialNode, sceneGraph) => {
    const children = materialNode.children;
    const nodeNames = [];
    for (var j = 0; j < children.length; j++) {
      nodeNames.push(children[j].nodeName);
    }
    const emissionIndex = nodeNames.indexOf('emission');
    const ambientIndex = nodeNames.indexOf('ambient');
    const diffuseIndex = nodeNames.indexOf('diffuse');
    const specularIndex = nodeNames.indexOf('specular');
    const appearance = new CGFappearance(sceneGraph.scene);
    appearance.setTextureWrap('REPEAT', 'REPEAT');
    if (emissionIndex != -1 && ambientIndex != -1 && diffuseIndex != -1 && specularIndex != -1) {
      const emission = materialsParser.parseMaterialColors(children[emissionIndex]);
      appearance.setEmission(emission.red, emission.green, emission.blue, emission.alpha);
      const ambient = materialsParser.parseMaterialColors(children[ambientIndex]);
      appearance.setAmbient(ambient.red, ambient.green, ambient.blue, ambient.alpha);
      const diffuse = materialsParser.parseMaterialColors(children[diffuseIndex]);
      appearance.setDiffuse(diffuse.red, diffuse.green, diffuse.blue, diffuse.alpha);
      const specular = materialsParser.parseMaterialColors(children[specularIndex]);
      appearance.setSpecular(specular.red, specular.green, specular.blue, specular.alpha);
    } else {
      return null;
    }
    return appearance;
  },

  parseMaterialColors: (component) => {
    const colors = {};
    colors.red = parserUtils.reader.getFloat(component, 'r');
    colors.green = parserUtils.reader.getFloat(component, 'g');
    colors.blue = parserUtils.reader.getFloat(component, 'b');
    colors.alpha = parserUtils.reader.getFloat(component, 'a');
    return colors;
  }
};
