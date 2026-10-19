// À coller dans Google Apps Script (Extensions > Apps Script depuis ta feuille Google)
const NOM_FEUILLE = "Inscrits";
const NOM_EXPEDITEUR = "L’équipe";

function feuille_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let f = ss.getSheetByName(NOM_FEUILLE);
  if (!f) {
    f = ss.insertSheet(NOM_FEUILLE);
    f.appendRow(["Email", "Inscrit le", "Mail envoyé le"]);
  }
  return f;
}

function reponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// À lancer UNE fois à la main pour accepter les autorisations Google
function autoriser() {
  feuille_();
  Logger.log("Mails restants aujourd’hui : " + MailApp.getRemainingDailyQuota());
}

function doPost(e) {
  const p = e.parameter || {};
  try {
    if (p.action === "count" || p.action === "send") {
      const cle = PropertiesService.getScriptProperties().getProperty("ADMIN_KEY");
      if (!cle || p.key !== cle) return reponse_({ ok: false, erreur: "Clé incorrecte" });
      return p.action === "count" ? compter_() : envoyer_(p);
    }
    return inscrire_(p);
  } catch (err) {
    return reponse_({ ok: false, erreur: "Erreur serveur" });
  }
}

function inscrire_(p) {
  if (p.site) return reponse_({ ok: true }); // champ piège rempli : c'est un robot
  const email = String(p.email || "").trim().toLowerCase();
  if (email.length > 200 || !/^[^\s@=+\-][^\s@]*@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reponse_({ ok: false, erreur: "Adresse invalide" });
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const f = feuille_();
    const n = f.getLastRow() - 1;
    const deja = n > 0 && f.getRange(2, 1, n, 1).getValues().some((r) => r[0] === email);
    if (!deja) f.appendRow([email, new Date()]);
  } finally {
    lock.releaseLock();
  }
  return reponse_({ ok: true });
}

function compter_() {
  const f = feuille_();
  const n = f.getLastRow() - 1;
  if (n < 1) return reponse_({ ok: true, total: 0, aEnvoyer: 0 });
  const lignes = f.getRange(2, 1, n, 3).getValues().filter((r) => r[0]);
  return reponse_({
    ok: true,
    total: lignes.length,
    aEnvoyer: lignes.filter((r) => !r[2]).length
  });
}

function envoyer_(p) {
  const objet = String(p.subject || "").trim();
  const message = String(p.message || "").trim();
  if (!objet || !message) return reponse_({ ok: false, erreur: "Objet ou message vide" });

  const f = feuille_();
  const n = f.getLastRow() - 1;
  if (n < 1) return reponse_({ ok: true, envoyes: 0, restants: 0 });

  const lignes = f.getRange(2, 1, n, 3).getValues();
  let quota = MailApp.getRemainingDailyQuota();
  let envoyes = 0, restants = 0;

  lignes.forEach((l, i) => {
    if (!l[0] || l[2]) return; // vide ou déjà prévenu
    if (quota <= 0) { restants++; return; }
    try {
      MailApp.sendEmail({ to: l[0], subject: objet, body: message, name: NOM_EXPEDITEUR });
      f.getRange(i + 2, 3).setValue(new Date());
      quota--; envoyes++;
    } catch (err) {
      restants++;
    }
  });
  return reponse_({ ok: true, envoyes: envoyes, restants: restants });
}
