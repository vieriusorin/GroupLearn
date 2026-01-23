import type { ICommand } from "../types";

export interface RegisterCommand extends ICommand {
  readonly type: "Register";
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly callbackUrl?: string;
}

export const registerCommand = (
  name: string,
  email: string,
  password: string,
  callbackUrl?: string,
): RegisterCommand => ({
  type: "Register",
  name,
  email,
  password,
  callbackUrl,
});
