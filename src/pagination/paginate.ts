/**
 * Generic helpers for Xero's fixed 100-item-per-page list endpoints
 * (Invoices, Contacts, Bank Transactions, Manual Journals, Purchase
 * Orders, Payments, and more).
 */

/** Xero's fixed page size for paginated Accounting endpoints. */
export const PAGE_SIZE = 100;

export type FetchPageFn<T> = (page: number, signal?: AbortSignal) => Promise<T[]>;

/**
 * Lazily async-iterates every item across every page, fetching
 * additional pages on demand. Stops as soon as a page returns fewer
 * than {@link PAGE_SIZE} items — Xero's signal for "last page".
 *
 * @example
 * ```ts
 * for await (const invoice of paginate((page) => client.accounting.listInvoices(token, tenantId, { page }))) {
 *   console.log(invoice.invoiceNumber);
 * }
 * ```
 */
export async function* paginate<T>(
  fetchPage: FetchPageFn<T>,
  signal?: AbortSignal,
): AsyncGenerator<T, void, void> {
  let page = 1;
  for (;;) {
    signal?.throwIfAborted();
    const items = await fetchPage(page, signal);
    for (const item of items) {
      yield item;
    }
    if (items.length < PAGE_SIZE) return;
    page++;
  }
}

/** Eagerly drains every page from `fetchPage` and returns the concatenated result. */
export async function collectAll<T>(fetchPage: FetchPageFn<T>, signal?: AbortSignal): Promise<T[]> {
  const all: T[] = [];
  for await (const item of paginate(fetchPage, signal)) {
    all.push(item);
  }
  return all;
}

/** Walks every item across every page, calling `fn` for each, stopping early if `fn` returns `false`. */
export async function forEachPage<T>(
  fetchPage: FetchPageFn<T>,
  fn: (item: T) => void | false | Promise<void | false>,
  signal?: AbortSignal,
): Promise<void> {
  for await (const item of paginate(fetchPage, signal)) {
    const result = await fn(item);
    if (result === false) return;
  }
}
