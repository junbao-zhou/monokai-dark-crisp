const fileSystem = require("node:fs");
const pathUtilities = require("node:path");

const repositoryRootDirectory = pathUtilities.resolve(__dirname, "..");
const themeFilePath = pathUtilities.join(
  repositoryRootDirectory,
  "themes",
  "monokai-dark-crisp-color-theme.json",
);
const tokenFilePath = pathUtilities.join(
  repositoryRootDirectory,
  "theme-source",
  "monokai-dark-crisp-tokens.json",
);
const backgroundMapFilePath = pathUtilities.join(
  repositoryRootDirectory,
  "theme-source",
  "monokai-dark-crisp-background-map.json",
);

/**
 * Read a UTF-8 text file and return its full text.
 *
 * @param {string} filePath
 * @returns {string}
 */
function readTextFile(filePath) {
  return fileSystem.readFileSync(filePath, "utf8");
}

/**
 * Read a strict JSON file and return the parsed object.
 *
 * @param {string} filePath
 * @returns {Record<string, unknown>}
 */
function readJsonFile(filePath) {
  return JSON.parse(readTextFile(filePath));
}

/**
 * Remove JSONC comments while keeping string content unchanged.
 *
 * @param {string} jsoncText
 * @returns {string}
 */
function stripJsonComments(jsoncText) {
  let strippedText = "";
  let isInsideString = false;
  let isEscaped = false;

  for (let characterIndex = 0; characterIndex < jsoncText.length; characterIndex += 1) {
    const currentCharacter = jsoncText[characterIndex];
    const nextCharacter = jsoncText[characterIndex + 1];

    if (isInsideString) {
      strippedText += currentCharacter;
      if (isEscaped) {
        isEscaped = false;
      } else if (currentCharacter === "\\") {
        isEscaped = true;
      } else if (currentCharacter === "\"") {
        isInsideString = false;
      }
      continue;
    }

    if (currentCharacter === "\"") {
      isInsideString = true;
      strippedText += currentCharacter;
      continue;
    }

    if (currentCharacter === "/" && nextCharacter === "/") {
      while (
        characterIndex < jsoncText.length
        && jsoncText[characterIndex] !== "\n"
      ) {
        characterIndex += 1;
      }
      strippedText += "\n";
      continue;
    }

    if (currentCharacter === "/" && nextCharacter === "*") {
      characterIndex += 2;
      while (
        characterIndex < jsoncText.length
        && !(jsoncText[characterIndex] === "*" && jsoncText[characterIndex + 1] === "/")
      ) {
        characterIndex += 1;
      }
      characterIndex += 1;
      continue;
    }

    strippedText += currentCharacter;
  }

  return strippedText;
}

/**
 * Remove trailing commas before object and array endings.
 *
 * @param {string} jsonText
 * @returns {string}
 */
function removeTrailingCommas(jsonText) {
  let cleanedText = "";
  let isInsideString = false;
  let isEscaped = false;

  for (let characterIndex = 0; characterIndex < jsonText.length; characterIndex += 1) {
    const currentCharacter = jsonText[characterIndex];

    if (isInsideString) {
      cleanedText += currentCharacter;
      if (isEscaped) {
        isEscaped = false;
      } else if (currentCharacter === "\\") {
        isEscaped = true;
      } else if (currentCharacter === "\"") {
        isInsideString = false;
      }
      continue;
    }

    if (currentCharacter === "\"") {
      isInsideString = true;
      cleanedText += currentCharacter;
      continue;
    }

    if (currentCharacter === ",") {
      let nextNonWhitespaceIndex = characterIndex + 1;
      while (
        nextNonWhitespaceIndex < jsonText.length
        && /\s/.test(jsonText[nextNonWhitespaceIndex])
      ) {
        nextNonWhitespaceIndex += 1;
      }

      if (
        jsonText[nextNonWhitespaceIndex] === "}"
        || jsonText[nextNonWhitespaceIndex] === "]"
      ) {
        continue;
      }
    }

    cleanedText += currentCharacter;
  }

  return cleanedText;
}

/**
 * Parse JSONC text into a JavaScript object.
 *
 * @param {string} jsoncText
 * @returns {Record<string, unknown>}
 */
function parseJsoncText(jsoncText) {
  const jsonText = removeTrailingCommas(stripJsonComments(jsoncText));

  return JSON.parse(jsonText);
}

/**
 * Format JSON or JSONC text with the default JSON stringifier.
 *
 * @param {string} jsoncText
 * @returns {string}
 */
function formatJsonText(jsoncText) {
  return `${JSON.stringify(parseJsoncText(jsoncText), null, 4)}\n`;
}

/**
 * Return the token color for a dotted token path.
 *
 * @param {Record<string, unknown>} tokens
 * @param {string} tokenPath
 * @returns {string}
 */
function getTokenColor(tokens, tokenPath) {
  const tokenParts = tokenPath.split(".");
  let currentTokenValue = tokens;

  for (const tokenPart of tokenParts) {
    if (
      typeof currentTokenValue !== "object"
      || currentTokenValue === null
      || !Object.prototype.hasOwnProperty.call(currentTokenValue, tokenPart)
    ) {
      throw new Error(`Missing token: ${tokenPath}`);
    }
    currentTokenValue = currentTokenValue[tokenPart];
  }

  if (typeof currentTokenValue !== "string") {
    throw new Error(`Token is not a color string: ${tokenPath}`);
  }

  return currentTokenValue;
}

/**
 * Escape a string so it can be placed inside a regular expression.
 *
 * @param {string} text
 * @returns {string}
 */
function escapeRegularExpression(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Find the top-level array range for a property in JSONC text.
 *
 * @param {string} jsoncText
 * @param {string} propertyName
 * @returns {{ startIndex: number, endIndex: number }}
 */
function findArrayRange(jsoncText, propertyName) {
  const propertyMatchExpression = new RegExp(`"${escapeRegularExpression(propertyName)}"\\s*:\\s*\\[`);
  const propertyMatch = propertyMatchExpression.exec(jsoncText);

  if (propertyMatch === null) {
    throw new Error(`Missing array property: ${propertyName}`);
  }

  const arrayStartIndex = propertyMatch.index + propertyMatch[0].lastIndexOf("[");
  const arrayEndIndex = findMatchingBracketIndex(jsoncText, arrayStartIndex);

  return {
    startIndex: arrayStartIndex,
    endIndex: arrayEndIndex,
  };
}

/**
 * Find the top-level object range for a property in JSONC text.
 *
 * @param {string} jsoncText
 * @param {string} propertyName
 * @returns {{ startIndex: number, endIndex: number }}
 */
function findObjectRange(jsoncText, propertyName) {
  const propertyMatchExpression = new RegExp(`"${escapeRegularExpression(propertyName)}"\\s*:\\s*\\{`);
  const propertyMatch = propertyMatchExpression.exec(jsoncText);

  if (propertyMatch === null) {
    throw new Error(`Missing object property: ${propertyName}`);
  }

  const objectStartIndex = propertyMatch.index + propertyMatch[0].lastIndexOf("{");
  const objectEndIndex = findMatchingBraceIndex(jsoncText, objectStartIndex);

  return {
    startIndex: objectStartIndex,
    endIndex: objectEndIndex,
  };
}

/**
 * Find the matching closing bracket for an opening bracket.
 *
 * @param {string} text
 * @param {number} openingBracketIndex
 * @returns {number}
 */
function findMatchingBracketIndex(text, openingBracketIndex) {
  let bracketDepth = 0;
  let isInsideString = false;
  let isEscaped = false;

  for (let characterIndex = openingBracketIndex; characterIndex < text.length; characterIndex += 1) {
    const currentCharacter = text[characterIndex];
    const nextCharacter = text[characterIndex + 1];

    if (isInsideString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (currentCharacter === "\\") {
        isEscaped = true;
      } else if (currentCharacter === "\"") {
        isInsideString = false;
      }
      continue;
    }

    if (currentCharacter === "\"") {
      isInsideString = true;
      continue;
    }

    if (currentCharacter === "/" && nextCharacter === "/") {
      while (
        characterIndex < text.length
        && text[characterIndex] !== "\n"
      ) {
        characterIndex += 1;
      }
      continue;
    }

    if (currentCharacter === "/" && nextCharacter === "*") {
      characterIndex += 2;
      while (
        characterIndex < text.length
        && !(text[characterIndex] === "*" && text[characterIndex + 1] === "/")
      ) {
        characterIndex += 1;
      }
      characterIndex += 1;
      continue;
    }

    if (currentCharacter === "[") {
      bracketDepth += 1;
    } else if (currentCharacter === "]") {
      bracketDepth -= 1;
      if (bracketDepth === 0) {
        return characterIndex;
      }
    }
  }

  throw new Error("Could not find matching closing bracket.");
}

/**
 * Find the matching closing brace for an opening brace.
 *
 * @param {string} text
 * @param {number} openingBraceIndex
 * @returns {number}
 */
function findMatchingBraceIndex(text, openingBraceIndex) {
  let braceDepth = 0;
  let isInsideString = false;
  let isEscaped = false;

  for (let characterIndex = openingBraceIndex; characterIndex < text.length; characterIndex += 1) {
    const currentCharacter = text[characterIndex];
    const nextCharacter = text[characterIndex + 1];

    if (isInsideString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (currentCharacter === "\\") {
        isEscaped = true;
      } else if (currentCharacter === "\"") {
        isInsideString = false;
      }
      continue;
    }

    if (currentCharacter === "\"") {
      isInsideString = true;
      continue;
    }

    if (currentCharacter === "/" && nextCharacter === "/") {
      while (
        characterIndex < text.length
        && text[characterIndex] !== "\n"
      ) {
        characterIndex += 1;
      }
      continue;
    }

    if (currentCharacter === "/" && nextCharacter === "*") {
      characterIndex += 2;
      while (
        characterIndex < text.length
        && !(text[characterIndex] === "*" && text[characterIndex + 1] === "/")
      ) {
        characterIndex += 1;
      }
      characterIndex += 1;
      continue;
    }

    if (currentCharacter === "{") {
      braceDepth += 1;
    } else if (currentCharacter === "}") {
      braceDepth -= 1;
      if (braceDepth === 0) {
        return characterIndex;
      }
    }
  }

  throw new Error("Could not find matching closing brace.");
}

/**
 * Replace one color value inside the colors object text range.
 *
 * @param {string} themeText
 * @param {string} colorKey
 * @param {string} colorValue
 * @returns {string}
 */
function replaceColorValue(themeText, colorKey, colorValue) {
  const colorsObjectRange = findObjectRange(themeText, "colors");
  const beforeColorsText = themeText.slice(0, colorsObjectRange.startIndex);
  const colorsObjectText = themeText.slice(
    colorsObjectRange.startIndex,
    colorsObjectRange.endIndex + 1,
  );
  const afterColorsText = themeText.slice(colorsObjectRange.endIndex + 1);
  const colorMatchExpression = new RegExp(
    `("${escapeRegularExpression(colorKey)}"\\s*:\\s*)"(?:[^"\\\\]|\\\\.)*"`,
  );

  if (!colorMatchExpression.test(colorsObjectText)) {
    throw new Error(`Could not update color key: ${colorKey}`);
  }

  const updatedColorsObjectText = colorsObjectText.replace(
    colorMatchExpression,
    `$1"${colorValue}"`,
  );

  return `${beforeColorsText}${updatedColorsObjectText}${afterColorsText}`;
}

/**
 * Add one color value inside the colors object text range.
 *
 * @param {string} themeText
 * @param {string} colorKey
 * @param {string} colorValue
 * @returns {string}
 */
function addColorValue(themeText, colorKey, colorValue) {
  const colorsObjectRange = findObjectRange(themeText, "colors");
  const beforeColorsText = themeText.slice(0, colorsObjectRange.startIndex);
  const colorsObjectText = themeText.slice(
    colorsObjectRange.startIndex,
    colorsObjectRange.endIndex + 1,
  );
  const afterColorsText = themeText.slice(colorsObjectRange.endIndex + 1);
  const colorMatchExpression = new RegExp(
    `"${escapeRegularExpression(colorKey)}"\\s*:`,
  );

  if (colorMatchExpression.test(colorsObjectText)) {
    return replaceColorValue(themeText, colorKey, colorValue);
  }

  const objectBodyText = colorsObjectText.slice(0, -1);
  const trailingWhitespaceMatch = objectBodyText.match(/\s*$/);
  const trailingWhitespace = trailingWhitespaceMatch === null
    ? ""
    : trailingWhitespaceMatch[0];
  const objectBodyWithoutTrailingWhitespace = objectBodyText.slice(
    0,
    objectBodyText.length - trailingWhitespace.length,
  );
  const needsComma = objectBodyWithoutTrailingWhitespace.trim() !== "{";
  const insertedColorText = [
    objectBodyWithoutTrailingWhitespace,
    needsComma ? "," : "",
    `\n\t\t"${colorKey}": "${colorValue}"`,
    trailingWhitespace,
    "}",
  ].join("");

  return `${beforeColorsText}${insertedColorText}${afterColorsText}`;
}

/**
 * Append an alpha channel to a six-digit token color.
 *
 * @param {string} tokenColor
 * @param {string} alphaValue
 * @returns {string}
 */
function appendColorAlpha(tokenColor, alphaValue) {
  if (!/^#[0-9a-fA-F]{6}$/.test(tokenColor)) {
    throw new Error(`Token color must use #RRGGBB before alpha is applied: ${tokenColor}`);
  }

  if (!/^[0-9a-fA-F]{2}$/.test(alphaValue)) {
    throw new Error(`Alpha value must use two hex characters: ${alphaValue}`);
  }

  return `${tokenColor}${alphaValue}`;
}

/**
 * Return the final color value for a map entry.
 *
 * @param {Record<string, unknown>} tokens
 * @param {unknown} mapValue
 * @param {string} mapName
 * @param {string} colorKey
 * @returns {string}
 */
function getMappedColor(tokens, mapValue, mapName, colorKey) {
  if (typeof mapValue === "string") {
    return getTokenColor(tokens, mapValue);
  }

  if (
    typeof mapValue === "object"
    && mapValue !== null
    && typeof mapValue.token === "string"
    && typeof mapValue.alpha === "string"
  ) {
    return appendColorAlpha(
      getTokenColor(tokens, mapValue.token),
      mapValue.alpha,
    );
  }

  throw new Error(`${mapName} value must be a token path or token/alpha object: ${colorKey}`);
}

/**
 * Apply a color map to generated theme text.
 *
 * @param {string} themeText
 * @param {Record<string, unknown>} baseTheme
 * @param {Record<string, unknown>} tokens
 * @param {Record<string, unknown>} colorMap
 * @param {boolean} allowMissingColorKeys
 * @param {string} mapName
 * @returns {string}
 */
function applyColorMap(
  themeText,
  baseTheme,
  tokens,
  colorMap,
  allowMissingColorKeys,
  mapName,
) {
  let generatedThemeText = themeText;

  for (const [colorKey, mapValue] of Object.entries(colorMap)) {
    const colorKeyExists = Object.prototype.hasOwnProperty.call(baseTheme.colors, colorKey);

    if (!allowMissingColorKeys && !colorKeyExists) {
      throw new Error(`Mapped color key does not exist in base theme: ${colorKey}`);
    }

    if (colorKeyExists && typeof baseTheme.colors[colorKey] !== "string") {
      throw new Error(`Mapped color key is not a string: ${colorKey}`);
    }

    const tokenColor = getMappedColor(
      tokens,
      mapValue,
      mapName,
      colorKey,
    );
    generatedThemeText = colorKeyExists
      ? replaceColorValue(
        generatedThemeText,
        colorKey,
        tokenColor,
      )
      : addColorValue(
        generatedThemeText,
        colorKey,
        tokenColor,
      );
  }

  return generatedThemeText;
}

/**
 * Return scopes as a list of exact TextMate scope entries.
 *
 * @param {unknown} scopeValue
 * @returns {string[]}
 */
function getScopeList(scopeValue) {
  if (Array.isArray(scopeValue)) {
    return scopeValue.map((scope) => {
      if (typeof scope !== "string") {
        throw new Error("Token scope array values must be strings.");
      }
      return scope;
    });
  }

  if (typeof scopeValue === "string") {
    return scopeValue
      .split(",")
      .map((scope) => scope.trim())
      .filter((scope) => scope !== "");
  }

  throw new Error("Token rule scope must be a string or string array.");
}

/**
 * Store a scope list back onto a token rule.
 *
 * @param {Record<string, unknown>} tokenRule
 * @param {string[]} scopes
 * @returns {void}
 */
function setScopeList(tokenRule, scopes) {
  if (scopes.length === 0) {
    throw new Error("Token rule must keep at least one scope.");
  }

  tokenRule.scope = scopes.length === 1
    ? scopes[0]
    : scopes;
}

/**
 * Remove token scopes from token rules and drop empty rules.
 *
 * @param {Record<string, unknown>[]} tokenColors
 * @param {string[]} removedScopes
 * @returns {Record<string, unknown>[]}
 */
function removeTokenScopes(tokenColors, removedScopes) {
  const removedScopeSet = new Set(removedScopes);
  const keptTokenColors = [];

  for (const tokenRule of tokenColors) {
    const remainingScopes = getScopeList(tokenRule.scope)
      .filter((scope) => !removedScopeSet.has(scope));

    if (remainingScopes.length === 0) {
      continue;
    }

    setScopeList(tokenRule, remainingScopes);
    keptTokenColors.push(tokenRule);
  }

  return keptTokenColors;
}

/**
 * Return token settings with token paths resolved to color values.
 *
 * @param {Record<string, unknown>} tokens
 * @param {unknown} mapValue
 * @param {string} scope
 * @returns {Record<string, string>}
 */
function getMappedTokenSettings(tokens, mapValue, scope) {
  if (typeof mapValue !== "object" || mapValue === null || Array.isArray(mapValue)) {
    throw new Error(`Token color map value must be an object: ${scope}`);
  }

  const mappedSettings = {};

  for (const [settingKey, settingValue] of Object.entries(mapValue)) {
    if (settingKey === "foreground") {
      mappedSettings[settingKey] = getMappedColor(
        tokens,
        settingValue,
        "Token color map",
        scope,
      );
      continue;
    }

    if (typeof settingValue !== "string") {
      throw new Error(`Token setting must be a string: ${scope}.${settingKey}`);
    }
    mappedSettings[settingKey] = settingValue;
  }

  return mappedSettings;
}

/**
 * Apply generated settings to matching token scopes.
 *
 * @param {Record<string, unknown>[]} tokenColors
 * @param {Record<string, unknown>} tokens
 * @param {Record<string, unknown>} tokenColorMap
 * @returns {Record<string, unknown>[]}
 */
function applyTokenColorMap(tokenColors, tokens, tokenColorMap) {
  for (const [scope, mapValue] of Object.entries(tokenColorMap)) {
    const mappedSettings = getMappedTokenSettings(tokens, mapValue, scope);
    let foundScope = false;

    for (const tokenRule of tokenColors) {
      if (!getScopeList(tokenRule.scope).includes(scope)) {
        continue;
      }

      if (typeof tokenRule.settings !== "object" || tokenRule.settings === null) {
        throw new Error(`Token rule is missing settings: ${scope}`);
      }

      Object.assign(tokenRule.settings, mappedSettings);
      foundScope = true;
    }

    if (!foundScope) {
      tokenColors.push({
        scope,
        settings: mappedSettings,
      });
    }
  }

  return tokenColors;
}

/**
 * Format token rules for writing back into the theme file.
 *
 * @param {Record<string, unknown>[]} tokenColors
 * @returns {string}
 */
function formatTokenColors(tokenColors) {
  return JSON.stringify(tokenColors, null, "\t")
    .split("\n")
    .map((line) => `\t${line}`)
    .join("\n");
}

/**
 * Generate token colors in theme text.
 *
 * @param {string} themeText
 * @param {Record<string, unknown>} baseTheme
 * @param {Record<string, unknown>} tokens
 * @param {Record<string, unknown>} tokenColorMap
 * @param {string[]} removedScopes
 * @returns {string}
 */
function applyTokenColorGeneration(
  themeText,
  baseTheme,
  tokens,
  tokenColorMap,
  removedScopes,
) {
  if (!Array.isArray(baseTheme.tokenColors)) {
    throw new Error("Base theme is missing tokenColors array.");
  }

  const tokenColorsArrayRange = findArrayRange(themeText, "tokenColors");
  const beforeTokenColorsText = themeText.slice(0, tokenColorsArrayRange.startIndex);
  const afterTokenColorsText = themeText.slice(tokenColorsArrayRange.endIndex + 1);
  const tokenColors = applyTokenColorMap(
    removeTokenScopes(
      baseTheme.tokenColors,
      removedScopes,
    ),
    tokens,
    tokenColorMap,
  );

  return [
    beforeTokenColorsText,
    formatTokenColors(tokenColors),
    afterTokenColorsText,
  ].join("");
}

/**
 * Return generated semantic token colors with token paths resolved.
 *
 * @param {Record<string, unknown>} tokens
 * @param {Record<string, unknown>} semanticTokenColorMap
 * @returns {Record<string, string>}
 */
function getMappedSemanticTokenColors(tokens, semanticTokenColorMap) {
  const semanticTokenColors = {};

  for (const [semanticTokenKey, mapValue] of Object.entries(semanticTokenColorMap)) {
    if (typeof mapValue !== "string") {
      throw new Error(`Semantic token color map value must be a token path: ${semanticTokenKey}`);
    }

    semanticTokenColors[semanticTokenKey] = getTokenColor(tokens, mapValue);
  }

  return semanticTokenColors;
}

/**
 * Format one top-level object property for writing into the theme file.
 *
 * @param {string} propertyName
 * @param {Record<string, unknown>} propertyValue
 * @returns {string}
 */
function formatTopLevelObjectProperty(propertyName, propertyValue) {
  const formattedValueLines = JSON.stringify(propertyValue, null, "\t").split("\n");

  return [
    `\t"${propertyName}": ${formattedValueLines[0]}`,
    ...formattedValueLines.slice(1).map((line) => `\t${line}`),
  ].join("\n");
}

/**
 * Add or replace top-level semantic token colors.
 *
 * @param {string} themeText
 * @param {Record<string, unknown>} tokens
 * @param {Record<string, unknown>} semanticTokenColorMap
 * @returns {string}
 */
function applySemanticTokenColorGeneration(
  themeText,
  tokens,
  semanticTokenColorMap,
) {
  const semanticTokenColors = getMappedSemanticTokenColors(
    tokens,
    semanticTokenColorMap,
  );
  const semanticPropertyText = formatTopLevelObjectProperty(
    "semanticTokenColors",
    semanticTokenColors,
  );

  if (/"semanticTokenColors"\s*:/.test(themeText)) {
    const semanticObjectRange = findObjectRange(themeText, "semanticTokenColors");
    const formattedObjectText = JSON.stringify(semanticTokenColors, null, "\t")
      .split("\n")
      .map((line) => `\t${line}`)
      .join("\n");

    return [
      themeText.slice(0, semanticObjectRange.startIndex),
      formattedObjectText,
      themeText.slice(semanticObjectRange.endIndex + 1),
    ].join("");
  }

  const tokenColorsPropertyMatch = /\n\s*"tokenColors"\s*:/.exec(themeText);

  if (tokenColorsPropertyMatch === null) {
    throw new Error("Could not find tokenColors property for semanticTokenColors insertion.");
  }

  const insertionIndex = tokenColorsPropertyMatch.index + 1;

  return [
    themeText.slice(0, insertionIndex),
    semanticPropertyText,
    ",\n",
    themeText.slice(insertionIndex),
  ].join("");
}

/**
 * Add or replace a top-level boolean property.
 *
 * @param {string} themeText
 * @param {string} propertyName
 * @param {boolean} propertyValue
 * @returns {string}
 */
function applyTopLevelBooleanGeneration(themeText, propertyName, propertyValue) {
  const propertyMatchExpression = new RegExp(
    `("${escapeRegularExpression(propertyName)}"\\s*:\\s*)(true|false)`,
  );

  if (propertyMatchExpression.test(themeText)) {
    return themeText.replace(
      propertyMatchExpression,
      `$1${propertyValue}`,
    );
  }

  const tokenColorsPropertyMatch = /\n\s*"tokenColors"\s*:/.exec(themeText);

  if (tokenColorsPropertyMatch === null) {
    throw new Error(`Could not find tokenColors property for ${propertyName} insertion.`);
  }

  const insertionIndex = tokenColorsPropertyMatch.index + 1;

  return [
    themeText.slice(0, insertionIndex),
    `\t"${propertyName}": ${propertyValue},\n`,
    themeText.slice(insertionIndex),
  ].join("");
}

/**
 * Collect every object key path so generated output can be checked.
 *
 * @param {unknown} value
 * @param {string} pathPrefix
 * @returns {string[]}
 */
function collectObjectKeyPaths(value, pathPrefix) {
  const keyPaths = [];

  if (Array.isArray(value)) {
    for (let itemIndex = 0; itemIndex < value.length; itemIndex += 1) {
      const itemPathPrefix = `${pathPrefix}[${itemIndex}]`;
      keyPaths.push(...collectObjectKeyPaths(value[itemIndex], itemPathPrefix));
    }
    return keyPaths;
  }

  if (typeof value !== "object" || value === null) {
    return keyPaths;
  }

  for (const objectKey of Object.keys(value)) {
    const objectKeyPath = pathPrefix ? `${pathPrefix}.${objectKey}` : objectKey;
    keyPaths.push(objectKeyPath);
    keyPaths.push(...collectObjectKeyPaths(value[objectKey], objectKeyPath));
  }

  return keyPaths;
}

/**
 * Confirm every key path from the base theme still exists in the generated theme.
 *
 * @param {Record<string, unknown>} baseTheme
 * @param {Record<string, unknown>} generatedTheme
 * @returns {void}
 */
function assertExistingKeysPreserved(baseTheme, generatedTheme) {
  const baseKeyPaths = collectObjectKeyPaths(baseTheme, "");
  const generatedKeyPathSet = new Set(collectObjectKeyPaths(generatedTheme, ""));

  for (const baseKeyPath of baseKeyPaths) {
    if (!generatedKeyPathSet.has(baseKeyPath)) {
      throw new Error(`Generated theme is missing key path: ${baseKeyPath}`);
    }
  }
}

/**
 * Generate the theme file from tokens and the explicit color map.
 *
 * @returns {void}
 */
function generateTheme() {
  const baseThemeText = readTextFile(themeFilePath);
  const baseTheme = parseJsoncText(baseThemeText);
  const tokens = readJsonFile(tokenFilePath);
  const themeMap = readJsonFile(backgroundMapFilePath);
  let generatedThemeText = baseThemeText;

  if (typeof baseTheme.colors !== "object" || baseTheme.colors === null) {
    throw new Error("Base theme is missing colors object.");
  }

  if (
    typeof themeMap.colors !== "object"
    || themeMap.colors === null
    || Array.isArray(themeMap.colors)
  ) {
    throw new Error("Theme map is missing colors object.");
  }

  if (
    typeof themeMap.tokenColors !== "object"
    || themeMap.tokenColors === null
    || Array.isArray(themeMap.tokenColors)
  ) {
    throw new Error("Theme map is missing tokenColors object.");
  }

  if (
    typeof themeMap.semanticTokenColors !== "object"
    || themeMap.semanticTokenColors === null
    || Array.isArray(themeMap.semanticTokenColors)
  ) {
    throw new Error("Theme map is missing semanticTokenColors object.");
  }

  if (typeof themeMap.semanticHighlighting !== "boolean") {
    throw new Error("Theme map semanticHighlighting must be a boolean.");
  }

  if (
    !Array.isArray(themeMap.removeTokenScopes)
    || !themeMap.removeTokenScopes.every((scope) => typeof scope === "string")
  ) {
    throw new Error("Theme map removeTokenScopes must be a string array.");
  }

  generatedThemeText = applyColorMap(
    generatedThemeText,
    baseTheme,
    tokens,
    themeMap.colors,
    true,
    "Color map",
  );

  const generatedColorTheme = parseJsoncText(generatedThemeText);
  assertExistingKeysPreserved(baseTheme, generatedColorTheme);

  generatedThemeText = applyTokenColorGeneration(
    generatedThemeText,
    generatedColorTheme,
    tokens,
    themeMap.tokenColors,
    themeMap.removeTokenScopes,
  );

  generatedThemeText = applySemanticTokenColorGeneration(
    generatedThemeText,
    tokens,
    themeMap.semanticTokenColors,
  );

  generatedThemeText = applyTopLevelBooleanGeneration(
    generatedThemeText,
    "semanticHighlighting",
    themeMap.semanticHighlighting,
  );

  const formattedThemeText = formatJsonText(generatedThemeText);
  parseJsoncText(formattedThemeText);
  fileSystem.writeFileSync(themeFilePath, formattedThemeText);
  console.log(`Generated ${pathUtilities.relative(repositoryRootDirectory, themeFilePath)}`);
}

generateTheme();
