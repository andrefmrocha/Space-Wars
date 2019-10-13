const componentParser = {
  /**
   * @param  {XML Collection} componentsNode
   * @param  {MySceneGraph} sceneGraph
   */
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
      if (componentID == null) return 'no ID defined for componentID';

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

      const currentComponent = {};

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
      currentComponent.texture =
        textureIndex != -1
          ? componentParser.parseComponentTexture(grandChildren[textureIndex], sceneGraph.textures, sceneGraph)
          : null;

      // Children
      currentComponent.children = componentParser.parsePrimitiveChildren(
        grandChildren[childrenIndex].getElementsByTagName('primitiveref'),
        sceneGraph.primitives
      );
      currentComponent.children = currentComponent.children.concat(
        componentParser.parseComponentChildren(
          grandChildren[childrenIndex].getElementsByTagName('componentref'),
        )
      );

      if (currentComponent.texture && currentComponent.materials.length != 0 && currentComponent.children.length != 0)
        sceneGraph.components[componentID] = currentComponent;
    }
  },
  /**
   * @param  {string} textureRef
   * @param  {object} textures
   * @param  {MySceneGraph} sceneGraph
   */
  parseComponentTexture: (textureRef, textures, sceneGraph) => {
    const textureID = parserUtils.reader.getString(textureRef, 'id');
    if (textureID == 'inherit' || textureID == 'none') {
      if (
        parserUtils.reader.hasAttribute(textureRef, 'length_s') &&
        parserUtils.reader.hasAttribute(textureRef, 'length_t')
      )
        sceneGraph.onXMLMinorError('length_s and lengh_t should not be defined!');
      return {
        texture: textureID ? textureID : null
      };
    }
    const texture = textures[textureID];
    const lengthS = parserUtils.reader.hasAttribute(textureRef, 'length_s')
      ? parserUtils.reader.getFloat(textureRef, 'length_s')
      : null;
    const lengthT = parserUtils.reader.hasAttribute(textureRef, 'length_t')
      ? parserUtils.reader.getFloat(textureRef, 'length_t')
      : null;
    if (!lengthS || !lengthT) sceneGraph.onXMLMinorError('length_s and lengh_t must be defined!');
    return {
      lengthS: lengthS ? lengthS : 1,
      lengthT: lengthT ? lengthT : 1,
      texture: texture ? texture : null
    };
  },
  
  /**
   * @param  {XMLCollection Object} componentTransformation
   * @param  {Object} transformations
   * @param  {MySceneGraph} sceneGraph
   */
  parseComponentTransformations: (componentTransformation, transformations, sceneGraph) => {
    const transformationChildren = [];
    for (var j = 0; j < componentTransformation.length; j++) {
      transformationChildren.push(componentTransformation[j].nodeName);
    }
    const primitiveRefIndex = transformationChildren.indexOf('transformationref');
    if (primitiveRefIndex != -1) {
      return transformations[parserUtils.reader.getString(componentTransformation[primitiveRefIndex], 'id')];
    }
    return transformationParser.parseTransformation(componentTransformation, transformations, sceneGraph);
  },

  
  /**
   * @param  {XMLCollection Object} materialsNode
   * @param  {Object} materials
   */
  parseComponentMaterials: (materialsNode, materials) => {
    const componentMaterials = [];
    for (let i = 0; i < materialsNode.length; i++) {
      const materialID = parserUtils.reader.getString(materialsNode[i], 'id');
      componentMaterials.push(
        materialID === 'inherit' ? materialID : materials[materialID]
      );
    }
    return componentMaterials;
  },

  
  /**
   * @param  {XMLCollection Object} componentChildren
   */
  parseComponentChildren: (componentChildren) => {
    const componentsChildren = [];
    for (let i = 0; i < componentChildren.length; i++) {
      componentsChildren.push(parserUtils.reader.getString(componentChildren[i], 'id'));
    }
    return componentsChildren;
  },

  /**
   * @param  {XMLCollection Object} primitiveChildren
   * @param  {Object} primitives
   */
  parsePrimitiveChildren: (primitiveChildren, primitives) => {
    const components = [];
    for (let i = 0; i < primitiveChildren.length; i++) {
      const primitive = primitives[parserUtils.reader.getString(primitiveChildren[i], 'id')];
      components.push(primitive);
    }
    return components;
  }
};
