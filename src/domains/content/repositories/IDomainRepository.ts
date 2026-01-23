import type { DomainId } from "@/domains/shared/types/branded-types";
import type { Domain } from "../entities/Domain";

export interface IDomainRepository {
  findById(id: DomainId): Promise<Domain | null>;
  findAll(): Promise<Domain[]>;
  findByCreator(userId: string): Promise<Domain[]>;
  save(domain: Domain): Promise<Domain>;
  delete(id: DomainId): Promise<void>;
  existsByName(name: string): Promise<boolean>;
  exists(id: DomainId): Promise<boolean>;
  count(): Promise<number>;
}
