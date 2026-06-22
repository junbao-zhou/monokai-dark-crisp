//! Rust syntax color test file for Monokai Dark Crisp.
//!
//! Open this file in VS Code with the Monokai Dark Crisp theme enabled.
//! Use Developer: Inspect Editor Tokens and Scopes to check each labeled token.

// Tests: comment
// TODO Tests: comment keyword.codetag.notation
// FIXME Tests: comment keyword.codetag.notation

// Tests: attribute punctuation, attribute name, and string literal inside attribute.
#![allow(dead_code)]

// Tests: module keyword and entity.name.module.
mod theme_color_test {
    // Tests: use keyword, namespace path, imported names, and alias.
    use std::fmt::{self, Display, Formatter as TextFormatter};

    // Tests: const keyword, constant name, built-in type, string literal, and numeric literal.
    const DEFAULT_CURRENCY_CODE: &str = "USD";
    const DEFAULT_TAX_RATE: f64 = 0.0825;

    // Tests: trait keyword, trait name, method name, and return type.
    pub trait Reportable {
        /// Tests: doc comment and entity.name.function for trait method.
        fn report_label(&self) -> &str;
    }

    // Tests: enum keyword, enum name, and enum variants.
    #[derive(Clone, Copy, Debug, PartialEq, Eq)]
    pub enum InvoiceStatus {
        Draft,
        Paid,
        Cancelled,
    }

    // Tests: struct keyword, struct name, field names, and built-in types.
    #[derive(Debug)]
    pub struct LineItem {
        pub description: String,
        pub unit_price: f64,
        pub quantity: u32,
    }

    // Tests: impl keyword, type name, method name, self parameter, and return type.
    impl LineItem {
        /// Tests: associated function name, parameter names, and String type.
        pub fn new(
            description: String,
            unit_price: f64,
            quantity: u32,
        ) -> Self {
            Self {
                description,
                unit_price,
                quantity,
            }
        }

        /// Tests: method name, member access, cast keyword, and arithmetic operator.
        pub fn total(&self) -> f64 {
            self.unit_price * self.quantity as f64
        }
    }

    // Tests: struct name, lifetime annotation, generic lifetime use, and vector type.
    pub struct SalesInvoice<'invoice> {
        invoice_identifier: &'invoice str,
        status: InvoiceStatus,
        line_items: Vec<LineItem>,
    }

    // Tests: lifetime parameter, impl block, associated const, and methods.
    impl<'invoice> SalesInvoice<'invoice> {
        /// Tests: associated constant, constant name, and float type.
        pub const MAX_DISCOUNT_RATE: f64 = 1.0;

        /// Tests: associated function name, lifetime type, and struct literal fields.
        pub fn new(invoice_identifier: &'invoice str) -> Self {
            Self {
                invoice_identifier,
                status: InvoiceStatus::Draft,
                line_items: Vec::new(),
            }
        }

        /// Tests: method name, parameter name, vector method call, and move value.
        pub fn add_line_item(&mut self, line_item: LineItem) {
            self.line_items.push(line_item);
        }

        /// Tests: mutable self, if keyword, method call, enum variant, and return keyword.
        pub fn mark_paid(&mut self) {
            if self.line_items.is_empty() {
                self.status = InvoiceStatus::Cancelled;
                return;
            }

            self.status = InvoiceStatus::Paid;
        }

        /// Tests: iterator method calls, closure parameter, and method call.
        pub fn subtotal(&self) -> f64 {
            self.line_items
                .iter()
                .map(|line_item| line_item.total())
                .sum()
        }

        /// Tests: if expression, comparison operator, numeric literals, and arithmetic operators.
        pub fn total_after_tax(&self) -> f64 {
            let taxable_amount: f64 = self.subtotal();

            if taxable_amount > 0.0 {
                taxable_amount * (1.0 + DEFAULT_TAX_RATE)
            } else {
                0.0
            }
        }

        /// Tests: raw string literal, char literal, macro call, and member access.
        pub fn format_summary(&self) -> String {
            let raw_template = r#"invoice:${id}"#;
            let separator = '|';

            format!(
                "{} {}{}{}",
                raw_template,
                self.invoice_identifier,
                separator,
                DEFAULT_CURRENCY_CODE,
            )
        }

        /// Tests: match keyword, enum variants, string literals, and wildcard pattern.
        pub fn status_label(&self) -> &'static str {
            match self.status {
                InvoiceStatus::Draft => "draft",
                InvoiceStatus::Paid => "paid",
                InvoiceStatus::Cancelled => "cancelled",
            }
        }
    }

    // Tests: trait implementation, type name, method name, and self reference.
    impl<'invoice> Reportable for SalesInvoice<'invoice> {
        fn report_label(&self) -> &str {
            self.invoice_identifier
        }
    }

    // Tests: Display trait implementation, fmt method, formatter type, and Result type.
    impl<'invoice> Display for SalesInvoice<'invoice> {
        fn fmt(&self, text_formatter: &mut TextFormatter<'_>) -> fmt::Result {
            write!(
                text_formatter,
                "{} {}",
                self.report_label(),
                self.status_label(),
            )
        }
    }

    // Tests: generic type parameter, trait bound, function name, and parameter names.
    pub fn print_report_label<T: Reportable>(reportable_item: &T) {
        println!("{}", reportable_item.report_label());
    }

    // Tests: function name, mutable binding, associated function calls, and string conversion.
    pub fn build_invoice() -> SalesInvoice<'static> {
        let mut invoice = SalesInvoice::new("INV-1001");

        invoice.add_line_item(LineItem::new(
            String::from("Keyboard"),
            79.99,
            1,
        ));
        invoice.add_line_item(LineItem::new(
            "Cable".to_string(),
            9.50,
            3,
        ));

        invoice.mark_paid();
        invoice
    }

    // Tests: function name, closure, associated constant, and function call.
    pub fn calculate_discount(
        invoice: &SalesInvoice<'_>,
        discount_rate: f64,
    ) -> f64 {
        let normalized_rate = discount_rate.clamp(0.0, SalesInvoice::MAX_DISCOUNT_RATE);
        let discount_for_total = |total_amount: f64| -> f64 {
            total_amount * normalized_rate
        };

        discount_for_total(invoice.total_after_tax())
    }
}

// Tests: main function name, let binding, mutable variable, module path, and macro calls.
fn main() {
    let invoice = theme_color_test::build_invoice();
    let discount = theme_color_test::calculate_discount(&invoice, 0.15);

    theme_color_test::print_report_label(&invoice);

    println!(
        "{} {} discount={}",
        invoice,
        invoice.format_summary(),
        discount,
    );
}
