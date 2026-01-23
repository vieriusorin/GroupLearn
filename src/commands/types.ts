/**
 * Base types for Command Query Responsibility Segregation (CQRS)
 */

export interface ICommand {
  readonly type: string;
}

export interface ICommandHandler<TCommand extends ICommand, TResult = void> {
  execute(command: TCommand): Promise<TResult>;
}

export interface IQuery {
  readonly type: string;
}

export interface IQueryHandler<TQuery extends IQuery, TResult> {
  execute(query: TQuery): Promise<TResult>;
}
