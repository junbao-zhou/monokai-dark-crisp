# Monokai Dark Crisp

Monokai Dark Crisp is a high-contrast Monokai dark theme for Visual Studio Code.

![image-1](./assets/image-1.png)

![image-2](./assets/image-2.png)

![image-3](./assets/image-3.png)

## Files

[themes/monokai-dark-crisp-color-theme.json](themes/monokai-dark-crisp-color-theme.json): the theme file loaded by VS Code.

[theme-source/monokai-dark-crisp-color-name-map.json](theme-source/monokai-dark-crisp-color-name-map.json): reusable color names, such as `surface.gray02`, `border.normal`, and `shell.statusBar`.

[theme-source/monokai-dark-crisp-theme-key-name-map.json](theme-source/monokai-dark-crisp-theme-key-name-map.json): maps VS Code theme keys to color name paths.

[scripts/generate-theme.py](scripts/generate-theme.py): reads the token source and mapping file, resolves token paths to color values, and updates the generated sections in [themes/monokai-dark-crisp-color-theme.json](themes/monokai-dark-crisp-color-theme.json).

[package.json](package.json): the VS Code extension manifest and npm script definitions.

Example mapping:

```json
{
  "editor.background": "surface.gray02",
  "statusBar.background": "shell.statusBar"
}
```

## Generate the Theme

Install the Python dependency once:

```powershell
python -m pip install json5
```

Run:

```powershell
npm run generate-theme
```

Run this after editing the color name map or theme key name map.

## Modify the Theme

To update a shared color value, edit [theme-source/monokai-dark-crisp-color-name-map.json](theme-source/monokai-dark-crisp-color-name-map.json).

To change which color name is used by a VS Code theme key, edit [theme-source/monokai-dark-crisp-theme-key-name-map.json](theme-source/monokai-dark-crisp-theme-key-name-map.json).

To maintain a color outside the generated mapping, edit [themes/monokai-dark-crisp-color-theme.json](themes/monokai-dark-crisp-color-theme.json) directly.
