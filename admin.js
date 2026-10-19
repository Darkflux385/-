const champAdresses = document.getElementById("adresses");
const compte = document.getElementById("compte");
const info = document.getElementById("info");

// Récupère les adresses valides, sans doublons
function lireAdresses() {
  const valides = champAdresses.value
    .split(/[\s,;]+/)
    .map((a) => a.trim().toLowerCase())
    .filter((a) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a));
  return [...new Set(valides)];
}

function afficherInfo(texte) {
  info.textContent = texte;
  info.hidden = false;
}

champAdresses.addEventListener("input", () => {
  compte.textContent = lireAdresses().length;
});

document.getElementById("copier").addEventListener("click", async () => {
  const adresses = lireAdresses();
  if (!adresses.length) return afficherInfo("Aucune adresse valide.");
  try {
    await navigator.clipboard.writeText(adresses.join(", "));
    afficherInfo("Adresses copiées ! Colle-les dans le champ Cci de ta messagerie.");
  } catch {
    afficherInfo("Copie impossible : sélectionne et copie les adresses à la main.");
  }
});

document.getElementById("envoyer").addEventListener("click", () => {
  const adresses = lireAdresses();
  if (!adresses.length) return afficherInfo("Aucune adresse valide.");

  const objet = encodeURIComponent(document.getElementById("objet").value);
  const corps = encodeURIComponent(document.getElementById("message").value);
  const cci = adresses.map(encodeURIComponent).join(",");
  const lien = `mailto:?bcc=${cci}&subject=${objet}&body=${corps}`;

  if (lien.length > 1900) {
    return afficherInfo("Liste trop longue pour ce bouton : utilise « Copier les adresses » et colle-les dans le champ Cci.");
  }
  window.location.href = lien;
});
