import { getDb } from "./db";

export type TransactionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: Error;
    };

export async function withTransaction<T>(
  fn: (db: any) => Promise<T> | T,
): Promise<TransactionResult<T>> {
  const db = getDb();

  try {
    const result = await db.transaction(async (tx) => {
      return fn(tx);
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export function createTransactionWrapper<TArgs extends unknown[], TResult>(
  fn: (db: any, ...args: TArgs) => Promise<TResult> | TResult,
): (...args: TArgs) => Promise<TransactionResult<TResult>> {
  return async (...args: TArgs) => {
    return withTransaction(async (db) => fn(db, ...args));
  };
}

export async function withBatchTransaction<T>(
  operations: Array<(db: any) => Promise<T> | T>,
): Promise<TransactionResult<T[]>> {
  return withTransaction(async (db) => {
    const results: T[] = [];
    for (const operation of operations) {
      const result = await operation(db);
      results.push(result);
    }
    return results;
  });
}
