# Configuration Cursor - Multi-Modèles via OpenRouter

> Guide pour configurer Cursor avec les meilleurs modèles AI de février 2026

## 🔑 Ta clé OpenRouter

```
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
```

---

## ⚙️ Configuration Cursor (Une seule fois)

### Étape 1 : Ouvrir les Settings
```
Mac: Cmd + ,
Windows: Ctrl + ,
```

### Étape 2 : Configurer OpenRouter comme provider

1. **Onglet "Models"** (ou chercher "OpenAI" dans la barre de recherche)

2. **OpenAI API Key** → Coller :
   ```
   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
   ```

3. **Activer "Override OpenAI Base URL"** → Entrer :
   ```
   https://openrouter.ai/api/v1
   ```

### Étape 3 : Ajouter les modèles

Dans **"Model Names"** ou **"Add custom model"**, ajouter ces IDs :

```
anthropic/claude-4.5-opus
openai/gpt-5.2
google/gemini-3-pro
moonshotai/kimi-k2.5
deepseek/deepseek-v3.2
google/gemini-3-flash
mistralai/devstral-2
```

---

## 🎯 Quel modèle utiliser ?

### Pour le projet Moostik

| Situation | Modèle | Pourquoi |
|-----------|--------|----------|
| **Debugging complexe** | Claude Opus 4.5 | 80.9% SWE-Bench, meilleur en code |
| **Architecture / Design** | GPT-5.2 | Meilleur raisonnement global |
| **Bulk generation** | DeepSeek V3.2 | 50x moins cher, 90% qualité |
| **Prompts Moostik (x62)** | Kimi K2.5 | Excellent code, 5x moins cher |
| **Analyse images/videos** | Gemini 3 Pro | Context 1M + vision native |
| **Tests rapides** | Devstral 2 | **GRATUIT** |
| **Chat quotidien** | Gemini 3 Flash | Ultra rapide, pas cher |

---

## 💰 Estimation coûts pour Moostik

### Génération des 62 assets (prompts)

| Modèle | Coût estimé | Temps |
|--------|-------------|-------|
| Claude Opus 4.5 | ~$15-20 | Lent |
| GPT-5.2 | ~$25-30 | Moyen |
| Kimi K2.5 | ~$3-5 | Rapide |
| DeepSeek V3.2 | ~$0.50-1 | Rapide |
| Devstral 2 | **$0** | Rapide |

### Recommandation optimale

```
1. Devstral 2 (gratuit) pour prototyper les prompts
2. Kimi K2.5 pour la génération finale
3. Claude Opus 4.5 pour debug si problèmes
```

---

## 🔄 Switcher de modèle dans Cursor

### Méthode 1 : Via le sélecteur
1. Ouvre le chat Cursor (`Cmd+L` ou `Ctrl+L`)
2. Clique sur le nom du modèle en bas
3. Sélectionne le modèle souhaité

### Méthode 2 : Via le clavier
- `Cmd+Shift+P` → "Change Model"

### Méthode 3 : Raccourci custom
Settings → Keyboard Shortcuts → Chercher "model"

---

## 📊 Benchmarks Février 2026

### SWE-Bench Verified (Coding)
```
Claude Opus 4.5  ████████████████████ 80.9%
Kimi K2.5        ███████████████████  76.8%
Gemini 3 Pro     ███████████████████  76.2%
GPT-5.2          ███████████████████  75.8%
DeepSeek V3.2    ██████████████████   ~72%
Devstral 2       █████████████████    70%
Gemini 3 Flash   ██████████████       57.6%
```

### AIME 2025 (Math)
```
GPT-5.2          ████████████████████ 100%
Gemini 3 Pro     ████████████████████ 100%
Claude Opus 4.5  ███████████████████  95%
```

### GPQA Diamond (Reasoning)
```
Gemini 3 Pro     ██████████████████   90.4%
GPT-5.2          █████████████████    89%
Claude Opus 4.5  ████████████████     88%
```

---

## 🚨 Limitations connues

### Avec OpenRouter dans Cursor
- ❌ **Mode Agent** : Ne fonctionne pas avec les modèles custom
- ❌ **Codebase indexing** : Limité avec certains modèles
- ✅ **Chat** : Fonctionne parfaitement
- ✅ **Inline edit** : Fonctionne (Cmd+K)
- ✅ **Composer** : Fonctionne

### Workaround pour le mode Agent
Utiliser Claude natif (si tu as une clé Anthropic directe) pour les tâches Agent-only.

---

## 🔗 Liens utiles

- [OpenRouter Dashboard](https://openrouter.ai/dashboard)
- [OpenRouter Models](https://openrouter.ai/models)
- [Cursor Forum - Custom Models](https://forum.cursor.com/t/custom-api-model/123131)
- [LLM Stats](https://llm-stats.com)

---

*Dernière mise à jour : 1er février 2026*
