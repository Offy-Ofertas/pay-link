<template>
  <v-dialog v-model="aberta" persistent max-width="720">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-2">
          <v-icon color="primary">mdi-face-recognition</v-icon>
          <span class="font-weight-medium">Reconhecimento facial</span>
        </div>
        <v-chip :color="chip.color" :variant="chip.variant" size="small" class="text-none">
          {{ chip.label }}
        </v-chip>
      </v-card-title>

      <v-card-text>
        <p class="text-body-2 mb-4">
          Posicione seu rosto no enquadramento e clique para capturar. Na primeira vez, sua face será cadastrada; depois, validaremos para liberar o fluxo.
        </p>

        <div class="face-grid">
          <div class="face-preview">
            <video ref="videoRef" autoplay playsinline muted class="face-video" v-show="cameraLigada"></video>
            <canvas ref="canvasRef" class="face-canvas"></canvas>
            <div v-if="!cameraLigada" class="face-placeholder">
              <v-icon size="36" color="grey">mdi-video</v-icon>
              <span>Ative a câmera para capturar</span>
            </div>
          </div>

          <div class="face-actions">
            <v-btn color="primary" variant="tonal" class="text-none mb-2" block
              :loading="ligandoCamera" :disabled="faceVerificando" @click="iniciarCamera(false)">
              <v-icon start>mdi-video-outline</v-icon>
              {{ cameraLigada ? "Reiniciar câmera" : "Ativar câmera" }}
            </v-btn>

            <v-btn color="primary" class="text-none" block
              :loading="faceVerificando || capturando"
              :disabled="!cameraLigada || faceVerificando"
              @click="capturarEValidar">
              <v-icon start>mdi-camera</v-icon>
              Capturar e validar rosto
            </v-btn>

            <div class="status mt-3" :class="`status-${statusColor}`">
              <v-icon :color="statusColor" size="18" class="mr-1">{{ statusIcon }}</v-icon>
              <span>{{ statusMensagem }}</span>
            </div>

            <v-btn variant="text" color="grey" class="text-none mt-2" block @click="voltarParaCpf">
              Voltar
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { useTotemStore } from "@/stores/totem";

const store = useTotemStore();

const aberta = computed({
  get: () => store.showFaceModal,
  set: (v) => (store.showFaceModal = v),
});

const faceStatus = computed(() => store.faceStatus);
const faceVerificando = computed(() => faceStatus.value === "verificando");

const videoRef = ref(null);
const canvasRef = ref(null);
const streamRef = ref(null);
const cameraLigada = ref(false);
const ligandoCamera = ref(false);
const capturando = ref(false);

const chip = computed(() => {
  switch (faceStatus.value) {
    case "aprovado":
      return { label: "Aprovado", color: "success", variant: "flat" };
    case "reprovado":
      return { label: "Não reconhecido", color: "error", variant: "tonal" };
    case "verificando":
      return { label: "Verificando...", color: "primary", variant: "tonal" };
    case "erro":
      return { label: "Erro ao validar", color: "warning", variant: "tonal" };
    default:
      return { label: "Pendente", color: "grey", variant: "tonal" };
  }
});

const statusMensagem = computed(() => {
  switch (faceStatus.value) {
    case "aprovado":
      return "Rosto validado. Continuando o fluxo.";
    case "reprovado":
      return "Rosto não reconhecido. Tente novamente.";
    case "verificando":
      return "Validando rosto...";
    case "erro":
      return "Erro na validação. Tente outra vez.";
    default:
      return "Capture seu rosto para prosseguir.";
  }
});

const statusIcon = computed(() => {
  switch (faceStatus.value) {
    case "aprovado":
      return "mdi-check-circle";
    case "reprovado":
      return "mdi-close-circle";
    case "verificando":
      return "mdi-progress-clock";
    case "erro":
      return "mdi-alert-circle";
    default:
      return "mdi-information";
  }
});

const statusColor = computed(() => {
  switch (faceStatus.value) {
    case "aprovado":
      return "success";
    case "reprovado":
      return "error";
    case "erro":
      return "warning";
    case "verificando":
      return "primary";
    default:
      return "grey";
  }
});

async function iniciarCamera(auto = false) {
  try {
    ligandoCamera.value = true;
    if (streamRef.value) stopCamera();

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
    });
    streamRef.value = stream;
    cameraLigada.value = true;

    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      await videoRef.value.play();
    }
  } catch (error) {
    console.error("Erro ao ligar câmera:", error);
    store.showSnackbar("Não foi possível acessar a câmera.", "error");
  } finally {
    ligandoCamera.value = false;
  }
}

function stopCamera() {
  if (streamRef.value) {
    streamRef.value.getTracks().forEach((track) => track.stop());
    streamRef.value = null;
  }
  cameraLigada.value = false;
}

async function capturarEValidar() {
  if (!videoRef.value || !canvasRef.value) return;
  capturando.value = true;

  try {
    const video = videoRef.value;
    const canvas = canvasRef.value;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imagemBase64 = canvas.toDataURL("image/jpeg", 0.85);

    const faceHash = gerarAhash(canvas, ctx);
    await store.validarFace({ imagemBase64, faceHash });
  } finally {
    capturando.value = false;
  }
}

function gerarAhash(canvas, ctx) {
  const size = 8;
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = size;
  tmpCanvas.height = size;
  const tmpCtx = tmpCanvas.getContext("2d");
  tmpCtx.drawImage(canvas, 0, 0, size, size);
  const data = tmpCtx.getImageData(0, 0, size, size).data;

  // calcula média de luminância
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    sum += lum;
  }
  const avg = sum / (data.length / 4);

  let bits = "";
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    bits += lum >= avg ? "1" : "0";
  }

  return bits;
}

function voltarParaCpf() {
  stopCamera();
  store.cancelarFace();
}

watch(
  aberta,
  async (isOpen) => {
    if (isOpen) {
      await iniciarCamera(false);
    } else {
      stopCamera();
    }
  },
  { immediate: false }
);

watch(faceStatus, (novo) => {
  if (novo === "aprovado") {
    stopCamera();
  }
});

onBeforeUnmount(() => {
  stopCamera();
});
</script>

<style scoped>
.face-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 16px;
}

.face-preview {
  position: relative;
  background: #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  min-height: 240px;
}

.face-video,
.face-canvas {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.face-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.01;
}

.face-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  color: #475569;
}

.face-actions .status {
  display: flex;
  align-items: center;
  font-weight: 600;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 10px;
  background: #f1f5f9;
}

.status-success {
  color: #15803d;
  background: #dcfce7;
}

.status-error,
.status-warning {
  color: #b91c1c;
  background: #fee2e2;
}

.status-primary {
  color: #1d4ed8;
  background: #e0e7ff;
}

.status-grey {
  color: #475569;
  background: #e2e8f0;
}

.gap-2 {
  gap: 8px;
}

@media (max-width: 700px) {
  .face-grid {
    grid-template-columns: 1fr;
  }
}
</style>
