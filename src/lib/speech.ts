export function speak(text: string) {
  if ('speechSynthesis' in window) {
    // Cancelar cualquier discurso en curso para evitar retrasos acumulativos
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Intentar configurar a español de Perú, con caída a español general
    utterance.lang = 'es-PE'
    utterance.rate = 1.05 // Un ritmo ligeramente rápido pero legible para conducción
    utterance.pitch = 1.0

    window.speechSynthesis.speak(utterance)
  }
}
