#!/usr/bin/env node
// Activa el buzón con la clave pública que Ritmo manda como issue «Buzón de Ritmo <id>».
// Uso: node buzon/activar.mjs issue.json   (JSON del issue de la API de GitHub; lo usa la Action y también vale a mano)
import {readFileSync,writeFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
const dir=dirname(fileURLToPath(import.meta.url));
const issue=JSON.parse(readFileSync(process.argv[2],"utf8"));
const OWNER="Habiscan";
if((issue.user&&issue.user.login)!==OWNER){console.error("Solo vale un issue abierto por "+OWNER);process.exit(1)}
const body=String(issue.body||"");
const id=(body.match(/id:\s*([0-9a-f]{8})/)||[])[1];
const spki=(body.match(/```\s*([A-Za-z0-9+/=\s]{300,})```/)||[])[1];
if(!id||!spki){console.error("El issue no trae id y clave");process.exit(1)}
const clean=spki.replace(/\s+/g,"");
const sum=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",Buffer.from(clean,"base64")))).slice(0,4).map(x=>x.toString(16).padStart(2,"0")).join("");
if(sum!==id){console.error("La clave no coincide con el id");process.exit(1)}
await crypto.subtle.importKey("spki",Buffer.from(clean,"base64"),{name:"RSA-OAEP",hash:"SHA-256"},false,["encrypt"]);
writeFileSync(join(dir,"clave.json"),JSON.stringify({id,spki:clean,desde:new Date().toISOString()},null,1)+"\n");
console.log("Buzón activado para el móvil "+id);
