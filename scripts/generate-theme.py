import copy
import json
import pathlib

import json5


REPOSITORY_ROOT_DIRECTORY = pathlib.Path(__file__).resolve().parent.parent
THEME_FILE_PATH = REPOSITORY_ROOT_DIRECTORY / "themes" / "monokai-dark-crisp-color-theme.jsonc"
COLOR_NAME_MAP_FILE_PATH = (
    REPOSITORY_ROOT_DIRECTORY
    / "theme-source"
    / "monokai-dark-crisp-color-name-map.jsonc"
)
THEME_KEY_NAME_MAP_FILE_PATH = (
    REPOSITORY_ROOT_DIRECTORY
    / "theme-source"
    / "monokai-dark-crisp-theme-key-name-map.jsonc"
)


def read_json5_file(
    file_path: pathlib.Path,
) -> object:
    """
    Input:
        file_path: Path to a JSON or JSONC file.
    Output:
        Parsed Python value from the file.
    """
    return json5.loads(
        file_path.read_text(
            encoding="utf-8",
        ),
    )


def format_json_text(
    parsed_value: object,
) -> str:
    """
    Input:
        parsed_value: JSON-compatible Python value.
    Output:
        Pretty JSON text with four-space indentation and a final newline.
    """
    return (
        json.dumps(
            parsed_value,
            indent=4,
            ensure_ascii=False,
        )
        + "\n"
    )


def get_color_from_color_name_map(
    color_name_map: dict[str, object],
    color_name_path: str,
) -> str:
    """
    Input:
        color_name_map: Nested map from color names to color strings.
        color_name_path: Dotted path such as "surface.gray02".
    Output:
        Color string found at the dotted path.
    """
    current_value: object = color_name_map

    for color_name_part in color_name_path.split(
        ".",
    ):
        current_value = current_value[color_name_part]

    return current_value


def get_color_from_map_entry(
    color_name_map: dict[str, object],
    map_entry_value: object,
) -> str:
    """
    Input:
        color_name_map: Nested map from color names to color strings.
        map_entry_value: Color name path string or {"token": path, "alpha": hex}.
    Output:
        Final color string, with alpha appended when requested.
    """
    if isinstance(
        map_entry_value,
        str,
    ):
        return get_color_from_color_name_map(
            color_name_map,
            map_entry_value,
        )

    base_color = get_color_from_color_name_map(
        color_name_map,
        map_entry_value["token"],
    )

    return f"{base_color}{map_entry_value['alpha']}"


def get_resolved_color_map(
    color_name_map: dict[str, object],
    theme_key_color_name_map: dict[str, object],
) -> dict[str, str]:
    """
    Input:
        color_name_map: Nested map from color names to color strings.
        theme_key_color_name_map: Map from theme keys to color names.
    Output:
        Map from theme keys to resolved color strings.
    """
    resolved_color_map: dict[str, str] = {}

    for theme_key, map_entry_value in theme_key_color_name_map.items():
        resolved_color_map[theme_key] = get_color_from_map_entry(
            color_name_map,
            map_entry_value,
        )

    return resolved_color_map


def apply_color_map(
    theme: dict[str, object],
    color_name_map: dict[str, object],
    workbench_color_name_map: dict[str, object],
) -> dict[str, object]:
    """
    Input:
        theme: Parsed VS Code theme object.
        color_name_map: Nested map from color names to color strings.
        workbench_color_name_map: Map from VS Code color keys to color names.
    Output:
        New theme object with updated workbench colors.
    """
    updated_theme = copy.deepcopy(
        theme,
    )
    updated_theme["colors"].update(
        get_resolved_color_map(
            color_name_map,
            workbench_color_name_map,
        ),
    )

    return updated_theme


def get_textmate_scope_list(
    scope_value: object,
) -> list[str]:
    """
    Input:
        scope_value: TextMate scope value from one theme rule.
    Output:
        List of individual TextMate scope strings.
    """
    if isinstance(
        scope_value,
        list,
    ):
        return scope_value

    return [
        scope.strip()
        for scope in scope_value.split(
            ",",
        )
        if scope.strip() != ""
    ]


def get_textmate_scope_value(
    scope_list: list[str],
) -> str | list[str]:
    """
    Input:
        scope_list: List of TextMate scope strings.
    Output:
        One scope string when there is one scope, otherwise the scope list.
    """
    return (
        scope_list[0]
        if len(
            scope_list,
        )
        == 1
        else scope_list
    )


def remove_textmate_scopes(
    textmate_color_rules: list[dict[str, object]],
    removed_scope_list: list[str],
) -> list[dict[str, object]]:
    """
    Input:
        textmate_color_rules: Existing TextMate color rules from tokenColors.
        removed_scope_list: Scope names that should be removed.
    Output:
        New TextMate color rules that still have at least one scope.
    """
    removed_scope_set = set(
        removed_scope_list,
    )
    kept_textmate_color_rules: list[dict[str, object]] = []

    for textmate_color_rule in textmate_color_rules:
        remaining_scope_list = [
            scope
            for scope in get_textmate_scope_list(
                textmate_color_rule["scope"],
            )
            if scope not in removed_scope_set
        ]

        if len(
            remaining_scope_list,
        ) == 0:
            continue

        kept_textmate_color_rule = copy.deepcopy(
            textmate_color_rule,
        )
        kept_textmate_color_rule["scope"] = get_textmate_scope_value(
            remaining_scope_list,
        )
        kept_textmate_color_rules.append(
            kept_textmate_color_rule,
        )

    return kept_textmate_color_rules


def get_textmate_settings(
    color_name_map: dict[str, object],
    textmate_setting_name_map: dict[str, object],
) -> dict[str, str]:
    """
    Input:
        color_name_map: Nested map from color names to color strings.
        textmate_setting_name_map: Map from TextMate setting keys to color names or literal values.
    Output:
        TextMate settings with color names resolved to color strings.
    """
    textmate_settings: dict[str, str] = {}

    for setting_key, setting_value in textmate_setting_name_map.items():
        if setting_key == "foreground":
            textmate_settings[setting_key] = get_color_from_map_entry(
                color_name_map,
                setting_value,
            )
            continue

        textmate_settings[setting_key] = setting_value

    return textmate_settings


def apply_textmate_color_map(
    textmate_color_rules: list[dict[str, object]],
    color_name_map: dict[str, object],
    textmate_color_name_map: dict[str, object],
) -> list[dict[str, object]]:
    """
    Input:
        textmate_color_rules: Existing TextMate color rules.
        color_name_map: Nested map from color names to color strings.
        textmate_color_name_map: Map from TextMate scopes to setting name maps.
    Output:
        New TextMate color rules with mapped settings applied.
    """
    updated_textmate_color_rules = copy.deepcopy(
        textmate_color_rules,
    )

    for scope, textmate_setting_name_map in textmate_color_name_map.items():
        textmate_settings = get_textmate_settings(
            color_name_map,
            textmate_setting_name_map,
        )
        found_scope = False

        for textmate_color_rule in updated_textmate_color_rules:
            if scope not in get_textmate_scope_list(
                textmate_color_rule["scope"],
            ):
                continue

            textmate_color_rule["settings"].update(
                textmate_settings,
            )
            found_scope = True

        if not found_scope:
            updated_textmate_color_rules.append(
                {
                    "scope": scope,
                    "settings": textmate_settings,
                },
            )

    return updated_textmate_color_rules


def apply_textmate_color_generation(
    theme: dict[str, object],
    color_name_map: dict[str, object],
    textmate_color_name_map: dict[str, object],
    removed_scope_list: list[str],
) -> dict[str, object]:
    """
    Input:
        theme: Parsed VS Code theme object.
        color_name_map: Nested map from color names to color strings.
        textmate_color_name_map: Map from TextMate scopes to setting name maps.
        removed_scope_list: Scope names that should be removed before mapping.
    Output:
        New theme object with generated tokenColors.
    """
    updated_theme = copy.deepcopy(
        theme,
    )
    updated_theme["tokenColors"] = apply_textmate_color_map(
        remove_textmate_scopes(
            updated_theme["tokenColors"],
            removed_scope_list,
        ),
        color_name_map,
        textmate_color_name_map,
    )

    return updated_theme


def move_textmate_rules_to_end(
    theme: dict[str, object],
) -> dict[str, object]:
    """
    Input:
        theme: Parsed VS Code theme object.
    Output:
        New theme object with tokenColors moved to the final top-level position.
    """
    updated_theme: dict[str, object] = {}

    for top_level_key, top_level_value in theme.items():
        if top_level_key != "tokenColors":
            updated_theme[top_level_key] = top_level_value

    updated_theme["tokenColors"] = theme["tokenColors"]

    return updated_theme


def get_theme_key_name_map_sections(
    theme_key_name_map: dict[str, object],
) -> tuple[
    dict[str, object],
    dict[str, object],
    dict[str, object],
    list[str],
    bool,
]:
    """
    Input:
        theme_key_name_map: Full theme key name map from the source file.
    Output:
        Workbench color map, TextMate color map, semantic color map, removed scopes, and semantic highlighting flag.
    """
    return (
        theme_key_name_map["colors"],
        theme_key_name_map["tokenColors"],
        theme_key_name_map["semanticTokenColors"],
        theme_key_name_map["removeTokenScopes"],
        theme_key_name_map["semanticHighlighting"],
    )


def generate_theme() -> None:
    """
    Input:
        Theme source files on disk.
    Output:
        Generated VS Code theme file written to disk.
    """
    theme = read_json5_file(
        THEME_FILE_PATH,
    )
    color_name_map = read_json5_file(
        COLOR_NAME_MAP_FILE_PATH,
    )
    theme_key_name_map = read_json5_file(
        THEME_KEY_NAME_MAP_FILE_PATH,
    )
    (
        workbench_color_name_map,
        textmate_color_name_map,
        semantic_color_name_map,
        removed_scope_list,
        semantic_highlighting,
    ) = get_theme_key_name_map_sections(
        theme_key_name_map,
    )

    theme = apply_color_map(
        theme,
        color_name_map,
        workbench_color_name_map,
    )
    theme = apply_textmate_color_generation(
        theme,
        color_name_map,
        textmate_color_name_map,
        removed_scope_list,
    )
    theme["semanticTokenColors"] = get_resolved_color_map(
        color_name_map,
        semantic_color_name_map,
    )
    theme["semanticHighlighting"] = semantic_highlighting
    theme = move_textmate_rules_to_end(
        theme,
    )

    formatted_theme_text = format_json_text(
        theme,
    )
    THEME_FILE_PATH.write_text(
        formatted_theme_text,
        encoding="utf-8",
        newline="\n",
    )
    print(
        f"Generated {THEME_FILE_PATH.relative_to(REPOSITORY_ROOT_DIRECTORY)}",
    )


generate_theme()
