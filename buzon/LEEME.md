# Buzón de Ritmo

Sirve para que Claude añada tareas a Ritmo (la app de iñigo) sin copiar y pegar.

- Ritmo genera en el móvil una pareja de claves. La privada nunca sale del móvil.
- La pública llega aquí como issue «Buzón de Ritmo <id>» y la Action `buzon` la guarda en `buzon/clave.json`.
- Claude cifra las tareas con esa clave y las deja en `buzon/entrada.json`. El repo es público, pero solo el móvil puede leerlas.
- Ritmo mira el buzón al abrirse, al volver a la app y cada 5 minutos, y añade lo nuevo una sola vez.

## Mandar tareas (para Claude)

```
cat > /tmp/tareas.json <<'J'
[{"text":"Llamar a …","date":"2026-11-23","time":"09:00","area":"Habi Cars","step":"Abrir su ficha","mins":10}]
J
node buzon/enviar.mjs /tmp/tareas.json
git add buzon/entrada.json && git commit -m "Buzón: tareas nuevas" && git push origin main
```

Campos: `text` (obligatorio), `date` AAAA-MM-DD (sin fecha va a la Bandeja), `time` HH:MM, `area` (Habi Scan, Habi Cars, PAÍS x PAÍS, Juego del peregrino, Agencia, Ritmo, Personal), `step`, `mins`, `important`, `energy` (baja, media, alta).

No pongas datos personales en claro en commits ni issues: solo dentro del JSON cifrado.
