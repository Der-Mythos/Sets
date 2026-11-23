# Sets-App

Statische Web-App (eine `index.html` mit allem drin) für Set-Listen und Depth Charts im Flag-Football-Training.

## Bei jeder Änderung beide Versionen aktualisieren

1. **GitHub Pages:** Änderung committen und auf `main` pushen. Die Seite https://der-mythos.github.io/Sets/ baut sich danach von selbst neu (1–2 Minuten). Anschließend prüfen, ob die neue Version online ist.
2. **Claude-Artifact:** Dieselbe `index.html` im Artifact https://claude.ai/artifact/CDh23YnVUvur1pRKdRaNiE veröffentlichen (Artifact-Tool mit `url` = dieser Link; vorher einmal mit `action: "read"` lesen).

## Hinweise

- Positionen intern: X, Y, C, QB, Z (Offense), SC, SS, B, FS, WC (Defense), dazu die Joker OFF (`O`) und DEF (`D`).
- Alte Speicherstände mit Q, T, $, F werden beim Laden/Import automatisch umbenannt (`migrate`).
- Spielerdaten liegen nur im Browser (localStorage), nicht im Repository. `SEED` in `index.html` sind nur die Startdaten.
