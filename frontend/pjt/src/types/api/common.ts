export interface GlobalApiResponse<T> {
  status: number;
  message: string;
  data: T;
}
