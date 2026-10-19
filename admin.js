const info = document.getElementById("info");
const cleChamp = document.getElementById("cle");

function afficherInfo(texte) {
  info.textContent = texte;
  info.hidden = false;
}

// Envoie une demande au script Google, avec ta clé admin
async function appeler(params) {
  if (APPS_SCRIPT_URL.startsWith("COLLE_ICI")) {
    throw new Error("Colle d’abord l’adresse du script dans js/config.js");
  }
  if (!cleChamp.value) throw new Error("Entre ta clé admin.");
  const rep = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    body: new URLSearchParams({ ...params, key: cleChamp.value })
  });
  const data = await rep.json();
  if (!data.ok) throw new Error(data.erreur || "Erreur");
  return data;
}

document.getElementById("compter").addEventListener("click", async () => {
  try {
    const d = await appeler({ action: "count" });
    afficherInfo(`${d.total} inscrit(s), dont ${d.aEnvoyer} pas encore prévenu(s).`);
  } catch (e) {
    afficherInfo("❌ " + e.message);
  }
});

document.getElementById("envoyer").addEventListener("click", async () => {
  try {
    const d = await appeler({ action: "count" });
    if (d.aEnvoyer === 0) return afficherInfo("Personne à prévenir pour le moment.");
    if (!confirm(`Envoyer ce mail à ${d.aEnvoyer} personne(s) ?`)) return;

    const r = await appeler({
      action: "send",
      subject: document.getElementById("objet").value,
      message: document.getElementById("message").value
    });
    let texte = `✅ ${r.envoyes} mail(s) envoyé(s).`;
    if (r.restants > 0) {
      texte += ` ${r.restants} restant(s) : limite quotidienne de Google atteinte, reclique demain sur le bouton, seuls les non-prévenus recevront le mail.`;
    }
    afficherInfo(texte);
  } catch (e) {
    afficherInfo("❌ " + e.message);
  }
});
