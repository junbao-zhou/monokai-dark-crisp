"""Python syntax color test file for Monokai Dark Crisp.

Open this file in VS Code with the Monokai Dark Crisp theme enabled.
Each nearby comment names the expected tokenColors scope from the theme file.
Some Python scopes depend on the active Python grammar extension.
"""

# Tests: comment
# TODO Tests: comment keyword.codetag.notation
# FIXME Tests: comment keyword.codetag.notation

# Tests: keyword for "from", "import", and "as".
from collections.abc import Callable as CallableAlias
import math as math_module
import re


class Protocol:
    """Tests: entity.name.class for Protocol.

    This local placeholder keeps the file executable without importing typing.
    Later type hints that use Protocol test entity.name.type or type scopes.
    """


class SupportsTotal(Protocol):
    """Tests: string.quoted.docstring and class inheritance scopes."""

    # Tests: entity.name.function for method definition.
    def total(self) -> float:
        """Tests: string.quoted.docstring."""
        return 0.0


def log_call(function: CallableAlias[..., object]) -> CallableAlias[..., object]:
    """Tests: entity.name.function, variable.parameter, and Callable type hints."""

    # Tests: entity.name.function for wrapper definition.
    def wrapper(*arguments: object, **keyword_arguments: object) -> object:
        """Tests: variable.parameter for arguments and keyword_arguments."""
        # Tests: support.function for print.
        print(f"calling {function.__name__}")

        # Tests: variable.function for function call.
        return function(*arguments, **keyword_arguments)

    return wrapper


class InventoryItem(SupportsTotal):
    """Tests: entity.name.class and entity.other.inherited-class.

    The inherited class color may depend on the Python grammar.
    """

    # Tests: variable.other.member or class member scopes.
    item_count: int = 0

    # Tests: meta.decorator variable.other.readwrite for decorator.
    @classmethod
    def from_text(cls, text: str) -> "InventoryItem":
        """Tests: cls special parameter and string return annotation."""
        # Tests: variable.parameter.function.language.special.cls.python.
        cls.item_count += 1

        # Tests: variable.function or method-call scopes for split.
        name, price_text, count_text = text.split(",")

        # Tests: support.function for float and int.
        return cls(
            name=name.strip(),
            price=float(price_text),
            count=int(count_text),
        )

    # Tests: meta.decorator variable.other.readwrite for decorator.
    @staticmethod
    def normalize_name(name: str) -> str:
        """Tests: @staticmethod, variable.parameter, and method calls."""
        # Tests: variable.function or method-call scopes for strip/title.
        return name.strip().title()

    # Tests: custom decorator and entity.name.function for __init__.
    @log_call
    def __init__(self, name: str, price: float, count: int = 1) -> None:
        """Tests: magic method definition and self special parameter."""
        # Tests: variable.parameter.function.language.special.self.python.
        self.name = self.normalize_name(name)

        # Tests: variable.other.member or member-related scopes.
        self.price = price
        self.count = count

    # Tests: entity.name.function for method definition.
    def total(self) -> float:
        """Tests: self access, numeric constant, and return keyword."""
        # Tests: variable.other.member for self.price and self.count if grammar supports it.
        return self.price * self.count

    # Tests: entity.name.function for magic method definition.
    def __repr__(self) -> str:
        """Tests: f-string and interpolation scopes."""
        # Tests: string for f-string and interpolation punctuation inside braces.
        return f"InventoryItem(name={self.name!r}, total={self.total():.2f})"


# Tests: entity.name.function for function definition.
def calculate_discount(
    item: InventoryItem,
    percentages: list[float],
    metadata: dict[str, int],
    tags: tuple[str, ...],
    callback: CallableAlias[[InventoryItem], float],
) -> float:
    """Tests: list, dict, tuple, Callable, class type hints, and parameters."""
    # Tests: support.function for sum and len.
    average_percentage = sum(percentages) / len(percentages)

    # Tests: keyword for if / elif / else and operators "and", "or", "not", "in", "is".
    if item.name in tags and metadata is not None:
        discount = item.total() * average_percentage
    elif not tags or item.count == 0:
        discount = 0.0
    else:
        discount = callback(item)

    return discount


# Tests: entity.name.function for function definition.
def parse_quantity(raw_text: str) -> int:
    """Tests: try / except / else / finally and exception class names."""
    try:
        # Tests: support.function for int.
        quantity = int(raw_text)
    except ValueError as error:
        # Tests: entity.name.type or exception class scope for ValueError.
        raise RuntimeError("invalid quantity") from error
    else:
        return quantity
    finally:
        # Tests: support.function for print.
        print("parse_quantity finished")


# Tests: entity.name.function for function definition.
def scan_names(names: list[str]) -> list[str]:
    """Tests: for / while / with, method calls, and list mutation."""
    selected_names: list[str] = []
    name_index = 0

    # Tests: keyword for while.
    while name_index < len(names):
        current_name = names[name_index]

        # Tests: variable.function or method-call scopes for lower.
        if current_name.lower().startswith("a"):
            # Tests: variable.function or method-call scopes for append.
            selected_names.append(current_name)

        name_index += 1

    # Tests: keyword for for.
    for selected_name in selected_names:
        print(selected_name)

    # Tests: keyword for with and support.function for open.
    with open(__file__, "r", encoding="utf-8") as current_file:
        current_file.readline()

    return selected_names


# Tests: entity.name.function for function definition.
def classify_status(status_code: int) -> str:
    """Tests: match and case keywords."""
    match status_code:
        case 200:
            return "ok"
        case 400 | 404:
            return "client-error"
        case _:
            return "unknown"


# Tests: entity.name.function for function definition.
def build_transformer(scale: float) -> CallableAlias[[float], float]:
    """Tests: lambda keyword and function call syntax."""
    # Tests: keyword or operator scope for lambda.
    return lambda value: value * scale


# Tests: constant.numeric for decimal, float, hex, and binary numbers.
DECIMAL_NUMBER = 42
FLOAT_NUMBER = 3.14159
HEX_NUMBER = 0x2A
BINARY_NUMBER = 0b101010

# Tests: constants or language constants. Exact scope depends on Python grammar.
MISSING_VALUE = None
IS_ENABLED = True
IS_DISABLED = False

# Tests: string for normal, raw, regex, and f-string values.
NORMAL_STRING = "plain string"
RAW_STRING = r"C:\Users\Example\theme"
REGEX_PATTERN = re.compile(r"^[A-Z][a-z]+$")
INTERPOLATED_STRING = f"{NORMAL_STRING}: {DECIMAL_NUMBER}"


# Tests: entity.name.function for function definition.
def main() -> None:
    """Tests: function calls, builtin calls, method calls, and exception handling."""
    item = InventoryItem.from_text("widget,12.5,3")

    # Tests: variable.function for calculate_discount call.
    discount = calculate_discount(
        item=item,
        percentages=[
            0.10,
            0.15,
        ],
        metadata={
            "priority": 1,
        },
        tags=(
            "Widget",
            "Archive",
        ),
        callback=lambda current_item: current_item.total() * 0.05,
    )

    # Tests: support.function for print and range.
    for number in range(2):
        print(number, item, discount)

    # Tests: variable.function for parse_quantity call.
    parsed_quantity = parse_quantity("12")

    # Tests: variable.function or method-call scopes for append and lower.
    values: list[str] = []
    values.append("Alpha")
    values.append("beta".lower())

    # Tests: variable.function for scan_names and classify_status calls.
    scan_names(values)
    classify_status(200)

    # Tests: variable.function for build_transformer call and returned callable call.
    transformer = build_transformer(2.0)
    transformed_value = transformer(parsed_quantity)

    # Tests: support.function for print.
    print(transformed_value)


# Tests: keyword for if and variable.function for main call.
if __name__ == "__main__":
    main()
