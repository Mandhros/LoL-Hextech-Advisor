#!/usr/bin/env python3
"""
LoL Hextech Advisor - Passerelle locale LCU (League Client Update)
Ce script léger permet de connecter automatiquement votre client League of Legends
en cours d'exécution à l'application web LoL Hextech Advisor.

Aucun paquet externe n'est requis (utilise uniquement la bibliothèque standard Python 3).

Lancement :
    python lol_bridge.py
"""

import os
import glob
import json
import base64
import ssl
import http.server
import socketserver
import urllib.request

PORT = 35199

# Contexte SSL sans vérification d'autorité (le client LoL utilise un certificat local auto-signé par Riot)
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

def find_lockfile():
    candidates = [
        r"C:\Riot Games\League of Legends\lockfile",
        r"D:\Riot Games\League of Legends\lockfile",
        os.path.expanduser("~/Library/Application Support/Riot Games/League of Legends/lockfile"),
        os.path.expanduser("~/.wine/drive_c/Riot Games/League of Legends/lockfile"),
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    # Recherche par glob dans les répertoires standards
    found = glob.glob(r"C:\*\League of Legends\lockfile") + glob.glob(r"D:\*\League of Legends\lockfile")
    return found[0] if found else None

def get_lcu_session():
    lock_path = find_lockfile()
    if not lock_path:
        return {"error": "Client League of Legends non détecté. Assurez-vous que le jeu est lancé."}

    try:
        with open(lock_path, "r", encoding="utf-8") as f:
            content = f.read().strip()
            parts = content.split(":")
            if len(parts) < 5:
                return {"error": "Fichier lockfile corrompu ou incomplet."}
            port = parts[2]
            password = parts[3]

        auth_header = "Basic " + base64.b64encode(f"riot:{password}".encode("ascii")).decode("ascii")
        url = f"https://127.0.0.1:{port}/lol-champ-select/v1/session"

        req = urllib.request.Request(url, headers={"Authorization": auth_header, "Accept": "application/json"})
        with urllib.request.urlopen(req, context=CTX, timeout=3) as resp:
            data = resp.read()
            return json.loads(data.decode("utf-8"))
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return {"status": "NOT_IN_CHAMP_SELECT", "message": "Client ouvert, mais pas en phase de sélection de champions."}
        return {"error": f"Erreur HTTP LCU : {e.code}"}
    except Exception as e:
        return {"error": f"Impossible d'interroger le client LoL : {str(e)}"}

class BridgeRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        # Autoriser la web app (GitHub Pages ou localhost) à interroger ce pont local
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()

        session = get_lcu_session()
        self.wfile.write(json.dumps(session, ensure_ascii=False).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        # Désactiver les logs excessifs dans la console
        pass

if __name__ == "__main__":
    print("=" * 60)
    print("  LoL Hextech Advisor - Passerelle Locale LCU")
    print(f"  En attente sur http://127.0.0.1:{PORT}/session")
    print("  Laissez cette fenêtre ouverte pendant vos parties de LoL.")
    print("=" * 60)
    try:
        with socketserver.TCPServer(("127.0.0.1", PORT), BridgeRequestHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nPasserelle arrêtée.")
