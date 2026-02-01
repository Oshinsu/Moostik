#!/bin/bash
# MOOSTIK - Génération Complète des Variations
# Lance les générations de lieux et personnages

BASE_URL="http://localhost:3000"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     MOOSTIK - Génération Complète des Références               ║"
echo "║     5 variations par lieu + 5 situations par personnage        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Fonction pour générer une variation de lieu
generate_location_variation() {
  local location_id=$1
  local variation_type=$2
  
  echo "  📍 Generating $location_id - $variation_type..."
  
  result=$(curl -s -X POST "$BASE_URL/api/references/generate-location-variations" \
    -H "Content-Type: application/json" \
    -d "{\"locationId\": \"$location_id\", \"variationType\": \"$variation_type\"}")
  
  success=$(echo $result | jq -r '.success // false')
  if [ "$success" = "true" ]; then
    echo "    ✅ Success"
  else
    error=$(echo $result | jq -r '.error // "Unknown error"')
    echo "    ❌ Failed: $error"
  fi
}

# Fonction pour générer une situation de personnage
generate_character_situation() {
  local character_id=$1
  local situation_type=$2
  
  echo "  👤 Generating $character_id - $situation_type..."
  
  result=$(curl -s -X POST "$BASE_URL/api/references/generate-character-situations" \
    -H "Content-Type: application/json" \
    -d "{\"characterId\": \"$character_id\", \"situationType\": \"$situation_type\"}")
  
  success=$(echo $result | jq -r '.success // false')
  if [ "$success" = "true" ]; then
    echo "    ✅ Success"
  else
    error=$(echo $result | jq -r '.error // "Unknown error"')
    echo "    ❌ Failed: $error"
  fi
}

# Liste des lieux
LOCATIONS=(
  "tire-city"
  "fort-sang-noir"
  "bar-ti-sang"
  "academy-of-blood"
  "cathedral-of-blood"
  "genocide-memorial"
  "nursery-pods"
  "creole-house-enemy"
  "cooltik-village"
  "martinique-house-interior"
  "jalousies-gateway"
  "martinique-exterior-storm"
)

# Liste des variations de lieux
LOCATION_VARIATIONS=(
  "establishing"
  "detail"
  "atmosphere"
  "aerial"
  "entrance"
)

# Liste des personnages Moostik (pas les humains)
CHARACTERS=(
  "papy-tik"
  "young-dorval"
  "baby-dorval"
  "mama-dorval"
  "general-aedes"
  "scholar-culex"
  "bartender-anopheles"
  "singer-stegomyia"
  "femme-fatale-tigresse"
  "evil-pik"
  "petit-t1"
  "doc-hemoglobin"
  "mama-zika"
  "captain-dengue"
  "infiltrator-aedes-albopictus"
  "koko-survivor"
  "mila-survivor"
  "trez-survivor"
)

# Liste des situations de personnages
CHARACTER_SITUATIONS=(
  "portrait"
  "action"
  "social"
  "emotional"
  "environment"
)

echo "═══════════════════════════════════════════════════════════════"
echo "📊 À générer:"
echo "   ${#LOCATIONS[@]} lieux × ${#LOCATION_VARIATIONS[@]} variations = $((${#LOCATIONS[@]} * ${#LOCATION_VARIATIONS[@]})) images"
echo "   ${#CHARACTERS[@]} personnages × ${#CHARACTER_SITUATIONS[@]} situations = $((${#CHARACTERS[@]} * ${#CHARACTER_SITUATIONS[@]})) images"
echo "   TOTAL: $((${#LOCATIONS[@]} * ${#LOCATION_VARIATIONS[@]} + ${#CHARACTERS[@]} * ${#CHARACTER_SITUATIONS[@]})) images"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Choix du mode
echo "Choisir le mode:"
echo "  1) Générer les lieux seulement"
echo "  2) Générer les personnages seulement"
echo "  3) Générer tout"
echo "  4) Générer un lieu spécifique"
echo "  5) Générer un personnage spécifique"
read -p "Choix (1-5): " choice

case $choice in
  1)
    echo ""
    echo "🏛️  GÉNÉRATION DES LIEUX"
    echo ""
    for loc in "${LOCATIONS[@]}"; do
      echo "📍 $loc"
      for var in "${LOCATION_VARIATIONS[@]}"; do
        generate_location_variation "$loc" "$var"
        sleep 2
      done
      echo ""
    done
    ;;
  2)
    echo ""
    echo "👥 GÉNÉRATION DES PERSONNAGES"
    echo ""
    for char in "${CHARACTERS[@]}"; do
      echo "👤 $char"
      for sit in "${CHARACTER_SITUATIONS[@]}"; do
        generate_character_situation "$char" "$sit"
        sleep 2
      done
      echo ""
    done
    ;;
  3)
    echo ""
    echo "🏛️  GÉNÉRATION DES LIEUX"
    for loc in "${LOCATIONS[@]}"; do
      echo "📍 $loc"
      for var in "${LOCATION_VARIATIONS[@]}"; do
        generate_location_variation "$loc" "$var"
        sleep 2
      done
    done
    echo ""
    echo "👥 GÉNÉRATION DES PERSONNAGES"
    for char in "${CHARACTERS[@]}"; do
      echo "👤 $char"
      for sit in "${CHARACTER_SITUATIONS[@]}"; do
        generate_character_situation "$char" "$sit"
        sleep 2
      done
    done
    ;;
  4)
    echo "Lieux disponibles: ${LOCATIONS[*]}"
    read -p "Entrer l'ID du lieu: " loc_id
    for var in "${LOCATION_VARIATIONS[@]}"; do
      generate_location_variation "$loc_id" "$var"
      sleep 2
    done
    ;;
  5)
    echo "Personnages disponibles: ${CHARACTERS[*]}"
    read -p "Entrer l'ID du personnage: " char_id
    for sit in "${CHARACTER_SITUATIONS[@]}"; do
      generate_character_situation "$char_id" "$sit"
      sleep 2
    done
    ;;
  *)
    echo "Choix invalide"
    exit 1
    ;;
esac

echo ""
echo "✅ Génération terminée!"
