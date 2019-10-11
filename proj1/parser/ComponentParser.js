const componentParser = {
  parseComponents: (componentsNode, sceneGraph) => {
    const children = componentsNode.children;

    sceneGraph.components = {};

    // Any number of components.
    for (let i = 0; i < children.length; i++) {
      if (children[i].nodeName != 'component') {
        sceneGraph.onXMLMinorError('unknown tag <' + children[i].nodeName + '>');
        continue;
      }

      // Get id of the current component.
      const componentID = parserUtils.reader.getString(children[i], 'id');
      if (!componentID) return 'no ID defined for componentID';

      // Checks for repeated IDs.
      if (sceneGraph.components[componentID] != null)
        return 'ID must be unique for each component (conflict: ID = ' + componentID + ')';

      const grandChildren = children[i].children;

      const nodeNames = [];
      for (let j = 0; j < grandChildren.length; j++) {
        nodeNames.push(grandChildren[j].nodeName);
      }

      const transformationIndex = nodeNames.indexOf('transformation');
      const materialsIndex = nodeNames.indexOf('materials');
      const textureIndex = nodeNames.indexOf('texture');
      const childrenIndex = nodeNames.indexOf('children');

      if (transformationIndex == -1) onXMLError('Missing transformation tag on component');
      if (materialsIndex == -1) onXMLError('Missing materials tag on component');
      if (textureIndex == -1) onXMLError('Missing texture tag on component');
      if (childrenIndex == -1) onXMLError('Missing children tag on component');

      const currentComponent = {};
      sceneGraph.onXMLMinorError('To do: Parse components.');

      // Transformations
      currentComponent.transformation = componentParser.parseComponentTransformations(
        grandChildren[transformationIndex].children,
        sceneGraph.transformations,
        sceneGraph
      );

      // Materials
      currentComponent.materials = componentParser.parseComponentMaterials(
        grandChildren[materialsIndex].getElementsByTagName('material'),
        sceneGraph.materials
      );

      // Texture
      currentComponent.texture = componentParser.parseComponentTexture(
        grandChildren[textureIndex],
        sceneGraph.textures
      );

      // Children
      currentComponent.children = componentParser.parsePrimitiveChildren(
        grandChildren[childrenIndex].getElementsByTagName('primitiveref'),
        sceneGraph.primitives
      );
      currentComponent.children = currentComponent.children.concat(
        componentParser.parseComponentChildren(
          grandChildren[childrenIndex].getElementsByTagName('componentref'),
          sceneGraph.components
        )
      );

      if (
        currentComponent.texture &&
        currentComponent.materials &&
        currentComponent.materials.length != 0 &&
        currentComponent.children &&
        currentComponent.children.length != 0
      )
        sceneGraph.components[componentID] = currentComponent;
      else {
        sceneGraph.onXMLError("Component parser");
      }
    }
  },
  parseComponentTexture: (textureRef, textures) => {
    const lengthS = parserUtils.reader.getFloat(textureRef, 'length_s');
    const lengthT = parserUtils.reader.getFloat(textureRef, 'length_t');
    const textureID = parserUtils.reader.getString(textureRef, 'id');
    if (!textureID) return null;

    const texture = textureID == 'inherit' || textureID == 'none' ? textureID : textures[textureID];
    return {
      lengthS: lengthS ? lengthS : 1,
      lengthT: lengthT ? lengthT : 1,
      texture: texture ? texture : null
    };
  },
  parseComponentTransformations: (componentTransformation, transformations, sceneGraph) => {
    const transformationChildren = [];
    for (var j = 0; j < componentTransformation.length; j++) {
      transformationChildren.push(componentTransformation[j].nodeName);
    }
    const primitiveRefIndex = transformationChildren.indexOf('transformationref');
    if (primitiveRefIndex != -1) {
      const transformationID = parserUtils.reader.getString(componentTransformation[primitiveRefIndex], 'id');
      if (!transformationID) return null;

      return transformations[transformationID];
    }
    return transformationParser.parseTransformation(componentTransformation, transformations, sceneGraph);
  },

  parseComponentMaterials: (materialsNode, materials) => {
    const componentMaterials = [];
    for (let i = 0; i < materialsNode.length; i++) {
      const materialID = parserUtils.reader.getString(materialsNode[i], 'id');
      if (!materialID) return null;

      componentMaterials.push(materialID === 'inherit' ? materialID : materials[materialID]);
    }
    return componentMaterials;
  },
  parseComponentChildren: (componentChildren, components) => {
    const componentsChildren = [];
    for (let i = 0; i < componentChildren.length; i++) {
      const childID = parserUtils.reader.getString(componentChildren[i], 'id');
      if (!childID) return null;

      componentsChildren.push(childID);
    }
    return componentsChildren;
  },

  parsePrimitiveChildren: (primitiveChildren, primitives) => {
    const components = [];
    for (let i = 0; i < primitiveChildren.length; i++) {
      const childID = parserUtils.reader.getString(primitiveChildren[i], 'id');
      if (!childID) return null;

      components.push(primitives[childID]);
    }
    return components;
  }
};
