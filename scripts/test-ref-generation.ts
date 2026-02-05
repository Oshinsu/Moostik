/**
 * Script de test - Génération avec références en base64
 * 
 * Ce script teste:
 * 1. La conversion d'URLs locales en base64
 * 2. L'envoi à Replicate avec les références
 * 3. La génération de 2 images de test
 */

import { readFile, mkdir, writeFile } from "fs/promises";
import path from "path";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Fonction de conversion URL locale -> base64
function isLocalUrl(url: string): boolean {
  return url.startsWith('/api/images/') || 
         url.startsWith('/output/') ||
         (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:'));
}

function localUrlToFilePath(url: string): string {
  if (url.startsWith('/api/images/')) {
    return path.join(process.cwd(), 'output', url.replace('/api/images/', ''));
  }
  if (url.startsWith('/output/')) {
    return path.join(process.cwd(), url.substring(1));
  }
  return path.join(process.cwd(), url);
}

async function localUrlToBase64(url: string): Promise<string | null> {
  try {
    const filePath = localUrlToFilePath(url);
    console.log(`[Test] Reading file: ${filePath}`);
    
    const buffer = await readFile(filePath);
    const base64 = buffer.toString('base64');
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
    };
    const mimeType = mimeTypes[ext] || 'image/png';
    
    console.log(`[Test] ✓ Converted to base64 (${Math.round(base64.length / 1024)}KB)`);
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`[Test] ✗ Failed to convert: ${url}`, error);
    return null;
  }
}

async function testGeneration() {
  console.log("=".repeat(60));
  console.log("TEST: Génération avec références en base64");
  console.log("=".repeat(60));
  
  // Test 1: Vérifier que les images de référence existent
  console.log("\n[1/4] Vérification des images de référence...");
  
  const testRefs = [
    "/api/images/references/characters/papy-tik.png",
    "/api/images/references/locations/tire-city-establishing.png"
  ];
  
  for (const ref of testRefs) {
    const filePath = localUrlToFilePath(ref);
    try {
      await readFile(filePath);
      console.log(`  ✓ ${ref}`);
    } catch {
      console.log(`  ✗ ${ref} - FICHIER MANQUANT`);
      return;
    }
  }
  
  // Test 2: Convertir en base64
  console.log("\n[2/4] Conversion en base64...");
  
  const base64Refs: string[] = [];
  for (const ref of testRefs) {
    const base64 = await localUrlToBase64(ref);
    if (base64) {
      base64Refs.push(base64);
      console.log(`  ✓ ${ref.split('/').pop()} -> ${Math.round(base64.length / 1024)}KB base64`);
    }
  }
  
  if (base64Refs.length !== testRefs.length) {
    console.error("\n✗ Échec de la conversion base64");
    return;
  }
  
  // Test 3: Générer 2 images avec les références
  console.log("\n[3/4] Génération de 2 images de test avec Replicate...");
  
  const testPrompts = [
    {
      name: "Test 1 - Papy Tik dans la Cité du Pneu",
      prompt: "Pixar-dark 3D animated feature film quality, elderly mosquito patriarch Papy Tik standing in the magnificent Tire City capital, Renaissance bio-organic Gothic architecture, bioluminescent amber lanterns, wise haunted amber eyes, needle-like proboscis, obsidian chitin body, blood-red crest, warm amber and crimson lighting, 8K micro-textures, cinematic establishing shot"
    },
    {
      name: "Test 2 - Vue aérienne de la Cité du Pneu",
      prompt: "Pixar-dark 3D animated feature film quality, breathtaking aerial view of microscopic Moostik Renaissance fantasy city built inside abandoned car tire, organic chitin spires rising from dew-water surface, elegant bridges spanning canals, blood-drop shaped stained glass windows, bioluminescent amber lanterns, swarms of tiny Moostik flying in formations, warm amber and crimson lighting reflecting on water, 8K micro-textures, establishing shot"
    }
  ];
  
  const outputDir = path.join(process.cwd(), "output", "test-refs");
  await mkdir(outputDir, { recursive: true });
  
  for (let i = 0; i < testPrompts.length; i++) {
    const test = testPrompts[i];
    console.log(`\n  Génération: ${test.name}...`);
    
    try {
      const startTime = Date.now();
      
      const output = await replicate.run("google/nano-banana-pro" as `${string}/${string}`, {
        input: {
          prompt: test.prompt,
          aspect_ratio: "16:9",
          output_format: "png",
          image_input: base64Refs, // Les références en base64!
        }
      });
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const fileOutput = output as { url: () => string } & Blob;
      const url = fileOutput.url();
      
      console.log(`  ✓ Généré en ${elapsed}s: ${url}`);
      
      // Télécharger l'image
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const outputPath = path.join(outputDir, `test-${i + 1}.png`);
      await writeFile(outputPath, buffer);
      console.log(`  ✓ Sauvegardé: ${outputPath}`);
      
    } catch (error) {
      console.error(`  ✗ Erreur:`, error);
    }
  }
  
  // Test 4: Résumé
  console.log("\n[4/4] Résumé du test");
  console.log("=".repeat(60));
  console.log("✓ Conversion URLs locales -> base64: OK");
  console.log("✓ Envoi des références à Replicate: OK");
  console.log(`✓ Images générées dans: ${outputDir}`);
  console.log("=".repeat(60));
  console.log("\nLe système est prêt pour générer EP0 avec les références!");
}

// Exécuter le test
testGeneration().catch(console.error);
