export interface BodyResponse<Entity> {
  data?: Entity | Entity[]
  message?: string
}
