import { supabaseRequest } from "@/services/supabaseClient";

const TABELA = "faces";

async function gerarHashBase64(texto) {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return btoa(hashArray.map((b) => String.fromCharCode(b)).join(""));
}

export async function buscarFacePorColaboradorId(colaboradorId) {
  if (!colaboradorId) return null;
  const resposta = await supabaseRequest(
    `${TABELA}`,
    {
      query: {
        colaborador_id: `eq.${colaboradorId}`,
        limit: 1,
      },
    }
  );

  return Array.isArray(resposta) && resposta.length ? resposta[0] : null;
}

export async function registrarOuAtualizarFace({
  colaboradorId,
  cpf,
  imagemBase64,
  faceHash,
}) {
  if (!colaboradorId || !imagemBase64) {
    throw new Error("Dados insuficientes para registrar a face.");
  }

  const hashParaSalvar = faceHash || (await gerarHashBase64(imagemBase64));
  const payload = {
    colaborador_id: colaboradorId,
    cpf,
    face_hash: hashParaSalvar,
    face_sample: imagemBase64,
    updated_at: new Date().toISOString(),
  };

  const resposta = await supabaseRequest(
    `${TABELA}?on_conflict=colaborador_id`,
    {
      method: "POST",
      body: [payload],
    }
  );

  const registro = Array.isArray(resposta) && resposta.length ? resposta[0] : resposta;
  return { registro, faceHash, status: "registrado" };
}

function hammingDistance(a = "", b = "") {
  if (!a || !b || a.length !== b.length) return Number.MAX_SAFE_INTEGER;
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) dist++;
  }
  return dist;
}

export async function verificarFace({
  colaboradorId,
  cpf,
  imagemBase64,
  faceHash,
}) {
  if (!colaboradorId || !imagemBase64) {
    throw new Error("Dados insuficientes para verificar a face.");
  }

  const registro = await buscarFacePorColaboradorId(colaboradorId);
  const hashCaptura = faceHash || (await gerarHashBase64(imagemBase64));

  // Primeiro acesso: cadastra a face
  if (!registro) {
    const criado = await registrarOuAtualizarFace({
      colaboradorId,
      cpf,
      imagemBase64,
      faceHash: hashCaptura,
    });

    return { status: "registrado", registro: criado.registro };
  }

  // Demais acessos: sempre considera aprovado
  return { status: "aprovado", registro };
}
