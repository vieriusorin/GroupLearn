export type ActionSuccess<T> = {
  success: true;
  data: T;
};

export type ActionFailure<T = undefined> = {
  success: false;
  error: string;
  code?: string;
  validationErrors?: Record<string, string[]>;
  data?: T;
};

export type ActionResult<T> = ActionSuccess<T> | ActionFailure<T>;

export const success = <T>(data: T): ActionSuccess<T> => ({
  success: true,
  data,
});

export const failure = (
  error: string,
  code?: string,
  validationErrors?: Record<string, string[]>,
): ActionFailure => ({
  success: false,
  error,
  code,
  validationErrors,
});

export const isSuccess = <T>(
  result: ActionResult<T>,
): result is ActionSuccess<T> => {
  return result.success === true;
};

export const isFailure = <T>(
  result: ActionResult<T>,
): result is ActionFailure<T> => {
  return result.success === false;
};
