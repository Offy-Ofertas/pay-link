<template>
  <div class="signature-screen">
    <SignatureAuthModal
      v-model="authModalOpen"
      :colaborador-id="colaboradorId"
      :cpf="cpfSolicitante"
      :always-approve="true"
      @authenticated="handleAuthenticated"
    />
    <v-dialog v-if="autenticado" model-value persistent width="420">
      <v-card class="signature-card" elevation="8">
        <v-card-text class="signature-card__content">
          <v-btn color="primary" size="large" @click="handleDownload">
            Assinar eletronicamente
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
  import { computed, ref } from "vue";
  import { useRoute } from "vue-router";
  import SignatureAuthModal from "@/components/Shared/SignatureAuthModal.vue";

  const route = useRoute();
  const autenticado = ref(false);
  const authModalOpen = ref(true);

  const getQueryValue = (key, fallback) => {
    const value = route.query[key];
    if (Array.isArray(value)) {
      return value[0] || fallback;
    }
    if (value === undefined || value === null || value === "") {
      return fallback;
    }
    return String(value);
  };

  const valorAntecipado = computed(() =>
    getQueryValue("valor", "__________")
  );
  const nomeSolicitante = computed(() =>
    getQueryValue("nome", "________________")
  );
  const assinaturaSolicitante = computed(() =>
    getQueryValue("assinatura", "________________")
  );
  const dataAssinatura = computed(() =>
    getQueryValue(
      "data",
      new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    )
  );
  const cpfSolicitante = computed(() => getQueryValue("cpf", ""));
  const colaboradorId = computed(() =>
    getQueryValue("colaboradorId", "")
  );

  const contractBlocks = computed(() => [
    "CONTRATO DE ANTECIPAÇÃO DE VALOR COM DESCONTO EM FOLHA",
    "Pelo presente instrumento particular, o SOLICITANTE declara estar ciente e de acordo com a antecipação do valor descrito abaixo, concedida pelo sistema, nos seguintes termos:",
    "",
    "1. DO VALOR ANTECIPADO",
    `O SOLICITANTE concorda que será antecipado o valor de R$ ${valorAntecipado.value}, valor este definido e informado automaticamente pelo sistema no momento da solicitação.`,
    "",
    "2. DO DESCONTO",
    "O SOLICITANTE autoriza, de forma expressa, irrevogável e irretratável, que o valor antecipado seja descontado integralmente de seu pagamento, folha salarial, remuneração ou qualquer crédito futuro a que tenha direito, conforme as regras internas e prazos estabelecidos.",
    "",
    "3. DA CIÊNCIA E CONCORDÂNCIA",
    "O SOLICITANTE declara que:",
    "- Teve pleno conhecimento do valor antecipado antes da confirmação;",
    "- Está ciente de que o desconto ocorrerá automaticamente;",
    "- Não poderá alegar desconhecimento ou contestar o desconto após a confirmação da solicitação.",
    "",
    "4. DA VALIDADE",
    "Este contrato possui validade jurídica a partir da confirmação eletrônica realizada pelo SOLICITANTE no sistema, tendo o mesmo efeito de um contrato físico assinado.",
    "",
    "E, por estar de pleno acordo com os termos acima, o SOLICITANTE confirma eletronicamente sua aceitação.",
    "",
    "______________",
    `Assinatura do Solicitante: ${assinaturaSolicitante.value}`,
    `Nome: ${nomeSolicitante.value}`,
    `Data: ${dataAssinatura.value}`,
  ]);

  const MAX_LINE_LENGTH = 92;

  const wrapText = (text, maxChars, firstPrefix = "", nextPrefix = "") => {
    if (!text) {
      return [""];
    }
    const words = text.split(/\s+/);
    const lines = [];
    let prefix = firstPrefix;
    let line = prefix;

    for (const word of words) {
      const candidate = line === prefix ? `${line}${word}` : `${line} ${word}`;
      if (candidate.length > maxChars && line !== prefix) {
        lines.push(line);
        prefix = nextPrefix;
        line = `${prefix}${word}`;
        continue;
      }
      if (candidate.length > maxChars) {
        lines.push(line);
        prefix = nextPrefix;
        line = `${prefix}${word}`;
        continue;
      }
      line = candidate;
    }

    if (line) {
      lines.push(line);
    }

    return lines;
  };

  const buildPdfLines = () => {
    const lines = [];
    for (const block of contractBlocks.value) {
      if (!block) {
        lines.push("");
        continue;
      }

      if (block.startsWith("- ")) {
        lines.push(...wrapText(block.slice(2), MAX_LINE_LENGTH, "- ", "  "));
        continue;
      }

      lines.push(...wrapText(block, MAX_LINE_LENGTH));
    }
    return lines;
  };

  const escapePdfText = (value) =>
    value
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .replace(/\r?\n/g, " ");

  const winAnsiMap = {
    0x20ac: 0x80,
    0x201a: 0x82,
    0x0192: 0x83,
    0x201e: 0x84,
    0x2026: 0x85,
    0x2020: 0x86,
    0x2021: 0x87,
    0x02c6: 0x88,
    0x2030: 0x89,
    0x0160: 0x8a,
    0x2039: 0x8b,
    0x0152: 0x8c,
    0x017d: 0x8e,
    0x2018: 0x91,
    0x2019: 0x92,
    0x201c: 0x93,
    0x201d: 0x94,
    0x2022: 0x95,
    0x2013: 0x96,
    0x2014: 0x97,
    0x02dc: 0x98,
    0x2122: 0x99,
    0x0161: 0x9a,
    0x203a: 0x9b,
    0x0153: 0x9c,
    0x017e: 0x9e,
    0x0178: 0x9f,
  };

  const encodeWinAnsi = (value) => {
    const bytes = [];
    for (const char of value) {
      const codePoint = char.codePointAt(0);
      if (codePoint <= 0xff) {
        bytes.push(codePoint);
      } else if (winAnsiMap[codePoint]) {
        bytes.push(winAnsiMap[codePoint]);
      } else {
        bytes.push(0x3f);
      }
    }
    return new Uint8Array(bytes);
  };

  const concatBytes = (chunks) => {
    const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const merged = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    return merged;
  };

  const generatePdfBlob = (lines) => {
    const pageHeight = 842;
    const margin = 50;
    const fontSize = 11;
    const lineHeight = 14;
    let y = pageHeight - margin;

    let stream = `BT\n/F1 ${fontSize} Tf\n`;
    for (const line of lines) {
      if (y < margin) {
        break;
      }
      stream += `1 0 0 1 ${margin} ${y} Tm\n(${escapePdfText(
        line
      )}) Tj\n`;
      y -= lineHeight;
    }
    stream += "ET";
    const streamBytes = encodeWinAnsi(stream);

    const chunks = [];
    let length = 0;
    const offsets = [0];
    const pushBytes = (bytes) => {
      chunks.push(bytes);
      length += bytes.length;
    };
    const pushString = (text) => pushBytes(encodeWinAnsi(text));

    const addObject = (id, bodyBytes) => {
      offsets.push(length);
      pushString(`${id} 0 obj\n`);
      pushBytes(bodyBytes);
      pushString("\nendobj\n");
    };

    const object1 = encodeWinAnsi("<< /Type /Catalog /Pages 2 0 R >>");
    const object2 = encodeWinAnsi("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    const object3 = encodeWinAnsi(
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>"
    );
    const object4 = concatBytes([
      encodeWinAnsi(`<< /Length ${streamBytes.length} >>\nstream\n`),
      streamBytes,
      encodeWinAnsi("\nendstream"),
    ]);
    const object5 = encodeWinAnsi(
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
    );

    pushString("%PDF-1.4\n");
    addObject(1, object1);
    addObject(2, object2);
    addObject(3, object3);
    addObject(4, object4);
    addObject(5, object5);

    const xrefStart = length;
    pushString(`xref\n0 ${offsets.length}\n`);
    pushString("0000000000 65535 f \n");
    for (const offset of offsets.slice(1)) {
      pushString(`${String(offset).padStart(10, "0")} 00000 n \n`);
    }
    pushString(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\n`);
    pushString(`startxref\n${xrefStart}\n%%EOF\n`);

    return new Blob(chunks, { type: "application/pdf" });
  };

  const handleDownload = () => {
    const lines = buildPdfLines();
    const blob = generatePdfBlob(lines);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "assinatura-doc.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleAuthenticated = () => {
    autenticado.value = true;
    authModalOpen.value = false;
  };
</script>

<style scoped>
  .signature-screen {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: radial-gradient(circle at top, #e6f0ff 0%, #ffffff 55%);
  }

  .signature-card {
    padding: 12px;
    border-radius: 18px;
  }

  .signature-card__content {
    display: flex;
    justify-content: center;
  }
</style>
