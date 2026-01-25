import { supabaseRhRequest } from "@/services/rhSupabaseClient";

function normalizarCpf(cpf) {
  return String(cpf || "").replace(/\D/g, "");
}

export async function buscarColaboradorRh({ cpf }) {
  const cpfLimpo = normalizarCpf(cpf);
  if (!cpfLimpo) return null;

  const lista = await supabaseRhRequest("colaboradores");
  const encontrados = Array.isArray(lista) ? lista : [];

  return (
    encontrados.find((item) => {
      const cpfItem = normalizarCpf(item.cpf);
      return cpfItem === cpfLimpo;
    }) || null
  );
}
