#!/usr/bin/env node
// Manda tareas al buzón cifrado de Ritmo.
// Uso: node buzon/enviar.mjs tareas.json      (o pasa el JSON por la entrada estándar)
// tareas.json: [{"text":"Llamar a …","date":"2026-11-23","time":"09:00","area":"Habi Cars","step":"…","mins":10,"important":false}]
// Solo text es obligatorio. Luego: git add buzon && git commit && git push (rama main).
// Las tareas se cifran con la clave pública del móvil (buzon/clave.json); el repo es público pero nadie más puede leerlas.
import {readFileSync,writeFileSync,existsSync} from "node:fs";
import {randomUUID} from "node:crypto";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
const dir=dirname(fileURLToPath(import.meta.url));
const {subtle}=globalThis.crypto;
const arg=process.argv[2];
const raw=arg&&arg!=="-"?readFileSync(arg,"utf8"):readFileSync(0,"utf8");
let tareas=JSON.parse(raw);if(!Array.isArray(tareas))tareas=tareas.tareas||[];
tareas=tareas.filter(t=>t&&String(t.text||"").trim());
if(!tareas.length){console.error("No hay tareas con text");process.exit(1)}
const clavePath=join(dir,"clave.json");
if(!existsSync(clavePath)){console.error("Falta buzon/clave.json: iñigo tiene que conectar el buzón desde Ritmo (Más › Tareas de Claude).");process.exit(1)}
const clave=JSON.parse(readFileSync(clavePath,"utf8"));
const pub=await subtle.importKey("spki",Buffer.from(clave.spki,"base64"),{name:"RSA-OAEP",hash:"SHA-256"},false,["encrypt"]);
const aes=await subtle.generateKey({name:"AES-GCM",length:256},true,["encrypt"]);
const iv=globalThis.crypto.getRandomValues(new Uint8Array(12));
const ct=new Uint8Array(await subtle.encrypt({name:"AES-GCM",iv},aes,new TextEncoder().encode(JSON.stringify({tareas}))));
const wk=new Uint8Array(await subtle.encrypt({name:"RSA-OAEP"},pub,await subtle.exportKey("raw",aes)));
const c=Buffer.concat([wk,iv,ct]).toString("base64");
const entPath=join(dir,"entrada.json");
const ent=existsSync(entPath)?JSON.parse(readFileSync(entPath,"utf8")):{items:[]};
const cut=Date.now()-30*864e5;
ent.items=(ent.items||[]).filter(i=>Date.parse(i.t)>cut);
ent.items.push({id:randomUUID().slice(0,12),para:clave.id,t:new Date().toISOString(),c});
writeFileSync(entPath,JSON.stringify(ent,null,1)+"\n");
console.log(`${tareas.length} tarea(s) cifradas para el móvil ${clave.id}. Ahora haz commit y push de buzon/ a main.`);
