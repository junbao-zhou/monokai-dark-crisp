/*
 * C++ syntax color test file for Monokai Dark Crisp.
 *
 * Open this file in VS Code with the Monokai Dark Crisp theme enabled.
 * Use Developer: Inspect Editor Tokens and Scopes to check each labeled token.
 */

// Tests: comment
// TODO Tests: comment keyword.codetag.notation
// FIXME Tests: comment keyword.codetag.notation

// Tests: keyword.control.directive and string.quoted.other.lt-gt.include.
#include <algorithm>
#include <iostream>
#include <memory>
#include <string>
#include <utility>
#include <vector>

// Tests: preprocessor directive, macro name, numeric constant, and string literal.
#define THEME_COLOR_TEST_VERSION 1
#define DEFAULT_CURRENCY_CODE "USD"

// Tests: namespace keyword and entity.name.namespace.
namespace theme_color_test {

// Tests: storage.type, entity.name.type.enum, and enum member constants.
enum class InvoiceStatus {
    Draft,
    Paid,
    Cancelled,
};

// Tests: template keyword, type parameter, and function name.
template <typename ValueType>
ValueType clamp_value(
    ValueType value,
    ValueType minimum_value,
    ValueType maximum_value
) {
    // Tests: support.function or variable.function for std::max and std::min.
    return std::max(minimum_value, std::min(value, maximum_value));
}

// Tests: entity.name.type.struct and member variable names.
struct LineItem {
    // Tests: built-in type, namespace qualifier, and member names.
    std::string description;
    double unit_price;
    int quantity;

    // Tests: entity.name.function for method name and constant.language for const.
    double total() const {
        // Tests: member access, arithmetic operator, and return keyword.
        return unit_price * quantity;
    }
};

// Tests: entity.name.type.class and inherited interface-like class.
class Reportable {
public:
    // Tests: storage.modifier.virtual, entity.name.function, and string type.
    virtual std::string report_label() const = 0;

    // Tests: destructor name and virtual keyword.
    virtual ~Reportable() = default;
};

// Tests: entity.name.type.class, inherited class, access specifiers, and constructor name.
class SalesInvoice final : public Reportable {
public:
    // Tests: class constant, storage.modifier.static, storage.modifier.constexpr, and number.
    static constexpr double default_tax_rate = 0.0825;

    // Tests: constructor name, parameter names, and member initializer list.
    explicit SalesInvoice(std::string invoice_identifier)
        : invoice_identifier_(std::move(invoice_identifier)),
          status_(InvoiceStatus::Draft) {}

    // Tests: method name, parameter names, user-defined type, and vector method call.
    void add_line_item(LineItem line_item) {
        line_items_.push_back(std::move(line_item));
    }

    // Tests: override keyword, string return type, and member access.
    std::string report_label() const override {
        return invoice_identifier_;
    }

    // Tests: function name, control flow keywords, enum constants, and comparison operator.
    void mark_paid() {
        if (line_items_.empty()) {
            status_ = InvoiceStatus::Cancelled;
            return;
        }

        status_ = InvoiceStatus::Paid;
    }

    // Tests: method name, local variables, range-for loop, and member function call.
    double subtotal() const {
        double subtotal_amount = 0.0;

        for (const LineItem& line_item : line_items_) {
            subtotal_amount += line_item.total();
        }

        return subtotal_amount;
    }

    // Tests: function name, arithmetic operators, numeric constants, and ternary operator.
    double total_after_tax() const {
        const double taxable_amount = subtotal();
        return taxable_amount > 0.0
            ? taxable_amount * (1.0 + default_tax_rate)
            : 0.0;
    }

    // Tests: string literals, raw string literal, character literal, and escape sequences.
    std::string format_summary() const {
        const char separator = '|';
        const std::string raw_template = R"(invoice:${id})";

        return raw_template
            + " "
            + invoice_identifier_
            + separator
            + DEFAULT_CURRENCY_CODE;
    }

private:
    // Tests: private member variables and trailing underscore naming.
    std::string invoice_identifier_;
    InvoiceStatus status_;
    std::vector<LineItem> line_items_;
};

// Tests: function name, parameter names, lambda expression, and auto keyword.
double calculate_discount(
    const SalesInvoice& invoice,
    double discount_rate
) {
    const auto normalized_rate = clamp_value(discount_rate, 0.0, 1.0);

    // Tests: lambda capture, parameter type, return type, and multiplication operator.
    const auto discount_for_total = [normalized_rate](double total_amount) -> double {
        return total_amount * normalized_rate;
    };

    return discount_for_total(invoice.total_after_tax());
}

// Tests: function name, smart pointer type, new object creation, and template angle brackets.
std::unique_ptr<SalesInvoice> build_invoice() {
    auto invoice = std::make_unique<SalesInvoice>("INV-1001");

    // Tests: initializer list, string literals, float literals, integer literals, and member calls.
    invoice->add_line_item({
        "Keyboard",
        79.99,
        1,
    });
    invoice->add_line_item({
        "Cable",
        9.50,
        3,
    });

    invoice->mark_paid();
    return invoice;
}

}  // namespace theme_color_test

// Tests: global function name, main function, namespace qualifier, and using declaration.
int main() {
    using theme_color_test::SalesInvoice;

    // Tests: variable declaration, pointer access operator, and function call.
    const std::unique_ptr<SalesInvoice> invoice = theme_color_test::build_invoice();
    const double discount = theme_color_test::calculate_discount(*invoice, 0.15);

    // Tests: support.type or support.function for std::cout and stream operators.
    std::cout
        << invoice->report_label()
        << " "
        << invoice->format_summary()
        << " discount="
        << discount
        << '\n';

    return 0;
}
