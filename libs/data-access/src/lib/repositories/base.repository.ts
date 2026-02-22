export abstract class BaseRepository<T, CreateDto, UpdateDto> {
  abstract findById(id: string): Promise<T | null>;
  abstract findMany(options?: {
    where?: Record<string, unknown>;
    skip?: number;
    take?: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<T[]>;
  abstract count(where?: Record<string, unknown>): Promise<number>;
  abstract create(data: CreateDto): Promise<T>;
  abstract update(id: string, data: UpdateDto): Promise<T>;
  abstract delete(id: string): Promise<T>;
}
