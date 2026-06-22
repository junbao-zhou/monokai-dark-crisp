<?php

/**
 * PHP syntax color test file for Monokai Dark Crisp.
 *
 * Open this file in VS Code with the Monokai Dark Crisp theme enabled.
 * Use Developer: Inspect Editor Tokens and Scopes to check each labeled token.
 */

declare(strict_types=1);

// Tests: variable.language.namespace.php for "namespace" and namespace name tokens.
namespace ThemeColorTest\Domain;

// Tests: support.other.namespace.use-as.php for imported namespace names and aliases.
use DateTimeImmutable as ImmutableDateTime;
use RuntimeException as RuntimeError;
use ThemeColorTest\Support\MoneyFormatter as FormatterAlias;

// Tests: constant.language and constant.numeric.
const DEFAULT_CURRENCY_CODE = 'USD';
const DEFAULT_TAX_RATE = 0.0825;

// Tests: entity.name.class for class names.
interface Reportable
{
    /**
     * Tests: entity.name.function for interface method names.
     *
     * @return string Report label text.
     */
    public function getReportLabel(): string;
}

// Tests: entity.name.class for parent class.
abstract class BaseInvoice implements Reportable
{
    /**
     * Tests: variable.other.member or property semantic tokens.
     */
    protected string $invoiceIdentifier;

    /**
     * Tests: function parameters, property assignment, strings, and numbers.
     *
     * @param string $invoiceIdentifier Invoice identifier text.
     */
    public function __construct(string $invoiceIdentifier)
    {
        $this->invoiceIdentifier = $invoiceIdentifier;
    }

    /**
     * Tests: entity.name.function for method name and property access.
     *
     * @return string Invoice identifier text.
     */
    public function getReportLabel(): string
    {
        return $this->invoiceIdentifier;
    }
}

// Tests: punctuation.separator.inheritance.php for "\" in qualified names.
// Tests: entity.other.inherited-class or class semantic tokens for inherited types.
final class SalesInvoice extends \ThemeColorTest\Domain\BaseInvoice
{
    /**
     * Tests: class constants and constant access.
     */
    public const STATUS_PAID = 'paid';

    /**
     * Tests: property names and type names.
     */
    private ImmutableDateTime $createdAt;

    /**
     * Tests: property names, type names, and default numeric values.
     */
    private float $subtotalAmount = 0.0;

    /**
     * Tests: parameters, class names, and method calls.
     *
     * @param string $invoiceIdentifier Invoice identifier text.
     * @param ImmutableDateTime $createdAt Created date value.
     */
    public function __construct(
        string $invoiceIdentifier,
        ImmutableDateTime $createdAt,
    ) {
        parent::__construct($invoiceIdentifier);
        $this->createdAt = $createdAt;
    }

    /**
     * Tests: method declaration, parameter color, and number color.
     *
     * @param float $amount Value added to subtotal.
     * @return void
     */
    public function addLineItem(float $amount): void
    {
        $this->subtotalAmount += $amount;
    }

    /**
     * Tests: keyword, property access, constants, and arithmetic operators.
     *
     * @return float Invoice total after tax.
     */
    public function calculateTotal(): float
    {
        if ($this->subtotalAmount <= 0) {
            throw new RuntimeError('Subtotal must be positive.');
        }

        return $this->subtotalAmount * (1 + DEFAULT_TAX_RATE);
    }

    /**
     * Tests: support.function or function.defaultLibrary for built-in calls.
     *
     * @return array<string, string|float> Summary data.
     */
    public function buildSummary(): array
    {
        return [
            'identifier' => $this->getReportLabel(),
            'created_at' => $this->createdAt->format('Y-m-d'),
            'currency' => DEFAULT_CURRENCY_CODE,
            'status' => self::STATUS_PAID,
            'total' => round($this->calculateTotal(), 2),
        ];
    }
}

/**
 * Tests: function declaration, parameter token, and return type token.
 *
 * @param SalesInvoice $invoice Invoice object to format.
 * @param FormatterAlias $formatter Formatter service.
 * @return string Formatted invoice text.
 */
function format_invoice_summary(
    SalesInvoice $invoice,
    FormatterAlias $formatter,
): string {
    $summary = $invoice->buildSummary();

    return $formatter->format(
        $summary['identifier'],
        $summary['total'],
        $summary['currency'],
    );
}

/**
 * Tests: keywords, numbers, strings, arrays, method calls, and static calls.
 *
 * @return void
 */
function run_php_color_test(): void
{
    $invoice = new SalesInvoice(
        'INV-1001',
        new ImmutableDateTime('2026-06-23 09:30:00'),
    );

    foreach (
        [
            25.50,
            14.75,
            9.99,
        ] as $lineItemAmount
    ) {
        $invoice->addLineItem($lineItemAmount);
    }

    if ($invoice instanceof Reportable) {
        echo $invoice->getReportLabel();
    }
}

run_php_color_test();
