import { listRelatorios, saveRelatorio } from "@/services/db";

export async function listarRelatorios() {
  return listRelatorios();
}

export async function criarRelatorio(payload) {
  return saveRelatorio(payload);
}
