
const modal = document.getElementById("modal");
const ouvrir = () => {
  modal.classList.remove("sortie");
  modal.classList.add("ouvert");
};
const fermer = () => {
  if (!modal.classList.contains("ouvert") || modal.classList.contains("sortie")) return;
  modal.classList.add("sortie");
  setTimeout(() => modal.classList.remove("ouvert", "sortie"), 300);
};

// Bouton Infos : rebond + confettis, puis ouverture
const btn = document.getElementById("info-btn");
btn.addEventListener("animationend", (e) => {
  if (e.animationName === "rebond") btn.classList.remove("clic");
});
btn.addEventListener("click", () => {
  btn.classList.remove("clic");
  void btn.offsetWidth;
  btn.classList.add("clic");

  const r = btn.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const couleurs = ["#ff0080", "#ff8c00", "#40e0d0", "#ffffff", "#ffe600"];
  const nb = 18;
  for (let i = 0; i < nb; i++) {
    const p = document.createElement("span");
    p.className = "particule";
    p.style.left = (cx - 5) + "px";
    p.style.top = (cy - 5) + "px";
    p.style.background = couleurs[i % couleurs.length];
    document.body.appendChild(p);
    const angle = (Math.PI * 2 * i) / nb;
    const dist = 70 + Math.random() * 60;
    p.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`, opacity: 0 }
      ],
      { duration: 700, easing: "ease-out" }
    ).onfinish = () => p.remove();
  }

  setTimeout(ouvrir, 350);
});

document.getElementById("fermer").addEventListener("click", fermer);
modal.addEventListener("click", (e) => { if (e.target === modal) fermer(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") fermer(); });

// Onglets
document.querySelectorAll(".onglet").forEach((onglet) => {
  onglet.addEventListener("click", () => {
    document.querySelectorAll(".onglet").forEach((o) => o.classList.remove("actif"));
    document.querySelectorAll(".contenu").forEach((c) => (c.hidden = true));
    onglet.classList.add("actif");
    document.getElementById(onglet.dataset.cible).hidden = false;
  });
});

// Inscription e-mail : envoyée au script Google, qui l'enregistre dans une feuille
const form = document.getElementById("emailForm");
const msg = document.getElementById("newsletterMsg");

function afficher(texte, ok) {
  msg.textContent = texte;
  msg.classList.toggle("erreur", !ok);
  msg.hidden = false;
  setTimeout(() => (msg.hidden = true), 5000);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const champ = document.getElementById("userEmail");
  const piege = document.getElementById("site");
  const bouton = form.querySelector("button[type=submit]");

  if (APPS_SCRIPT_URL.startsWith("COLLE_ICI")) {
    afficher("Inscription pas encore configurée.", false);
    return;
  }

  bouton.disabled = true;
  try {
    const rep = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: new URLSearchParams({ email: champ.value.trim(), site: piege.value })
    });
    const data = await rep.json();
    if (!data.ok) throw new Error(data.erreur);
    afficher("✨ C’est enregistré ! Merci.", true);
    champ.value = "";
  } catch (err) {
    afficher("Oups, ça n’a pas marché. Réessaie plus tard.", false);
  } finally {
    bouton.disabled = false;
  }
});
