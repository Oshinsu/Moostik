"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Shot, Character, Location } from "@/types";
import { promptToText } from "@/data/prompt-helpers";
import { useMoostik } from "@/contexts/MoostikContext";

interface ShotEditorProps {
  shot: Shot | null;
  open: boolean;
  onClose: () => void;
  onSave: (shot: Shot) => void;
}

export function ShotEditor({ shot, open, onClose, onSave }: ShotEditorProps) {
  const { characters, locations } = useMoostik();
  const [editedShot, setEditedShot] = useState<Shot | null>(null);
  const [previewText, setPreviewText] = useState("");

  useEffect(() => {
    if (shot) {
      // Ensure characterIds and locationIds exist
      const shotCopy = JSON.parse(JSON.stringify(shot));
      if (!shotCopy.characterIds) shotCopy.characterIds = [];
      if (!shotCopy.locationIds) shotCopy.locationIds = [];
      setEditedShot(shotCopy);
    }
  }, [shot]);

  useEffect(() => {
    if (editedShot?.prompt) {
      // Check if it's JsonMoostik or old format
      if ("goal" in editedShot.prompt && "deliverable" in editedShot.prompt) {
        setPreviewText(JSON.stringify(editedShot.prompt, null, 2));
      } else {
        setPreviewText(promptToText(editedShot.prompt as any));
      }
    }
  }, [editedShot?.prompt]);

  if (!editedShot) return null;

  const updatePrompt = (path: string, value: unknown) => {
    setEditedShot((prev) => {
      if (!prev) return prev;
      const newShot = { ...prev };
      const keys = path.split(".");
      let obj: Record<string, unknown> = newShot.prompt as unknown as Record<string, unknown>;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]] as Record<string, unknown>;
      }

      obj[keys[keys.length - 1]] = value;
      return newShot;
    });
  };

  const handleSave = () => {
    if (editedShot) {
      onSave(editedShot);
    }
  };

  // Toggle character selection
  const toggleCharacter = (characterId: string) => {
    setEditedShot((prev) => {
      if (!prev) return prev;
      const currentIds = prev.characterIds || [];
      const newIds = currentIds.includes(characterId)
        ? currentIds.filter((id) => id !== characterId)
        : [...currentIds, characterId];
      return { ...prev, characterIds: newIds };
    });
  };

  // Toggle location selection
  const toggleLocation = (locationId: string) => {
    setEditedShot((prev) => {
      if (!prev) return prev;
      const currentIds = prev.locationIds || [];
      const newIds = currentIds.includes(locationId)
        ? currentIds.filter((id) => id !== locationId)
        : [...currentIds, locationId];
      return { ...prev, locationIds: newIds };
    });
  };

  const selectedCharacterCount = editedShot?.characterIds?.length || 0;
  const selectedLocationCount = editedShot?.locationIds?.length || 0;
  const totalSelectedRefs = selectedCharacterCount + selectedLocationCount;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] bg-[#0b0b0e] border-blood-900/30 text-zinc-100 p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 border-b border-blood-900/30">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-blood-900/50 text-blood-400 font-mono">
              SHOT #{editedShot.number.toString().padStart(2, "0")}
            </Badge>
            <DialogTitle className="text-xl font-bold tracking-tight">
              Édition : {editedShot.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Editor Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <Tabs defaultValue="references" className="flex-1 flex flex-col">
              <div className="px-6 pt-4 bg-[#0b0b0e]/50">
                <TabsList className="bg-[#14131a] border border-blood-900/20 p-1">
                  <TabsTrigger value="references" className="data-[state=active]:bg-blood-900/40 data-[state=active]:text-blood-100">Références</TabsTrigger>
                  <TabsTrigger value="content" className="data-[state=active]:bg-blood-900/40 data-[state=active]:text-blood-100">Contenu</TabsTrigger>
                  <TabsTrigger value="technical" className="data-[state=active]:bg-blood-900/40 data-[state=active]:text-blood-100">Technique</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {/* References Tab */}
                <TabsContent value="references" className="mt-0 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Characters */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Personnages</h3>
                        <Badge className="bg-blood-900/20 text-blood-400 border-blood-900/30">{selectedCharacterCount}</Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {characters.map((char) => {
                          const isSelected = editedShot.characterIds?.includes(char.id);
                          return (
                            <div
                              key={char.id}
                              onClick={() => toggleCharacter(char.id)}
                              className={cn(
                                "flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all",
                                isSelected 
                                  ? "bg-blood-900/20 border-blood-600/50" 
                                  : "bg-[#14131a] border-blood-900/10 hover:border-blood-900/30"
                              )}
                            >
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 border border-white/5">
                                {char.referenceImages?.[0] ? (
                                  <img src={char.referenceImages[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-lg">🦟</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{char.name}</p>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">{char.role}</p>
                              </div>
                              <Checkbox checked={isSelected} className="border-blood-900/50 data-[state=checked]:bg-blood-600" />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Locations */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Territoires</h3>
                        <Badge className="bg-amber-900/20 text-amber-400 border-amber-900/30">{selectedLocationCount}</Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {locations.map((loc) => {
                          const isSelected = editedShot.locationIds?.includes(loc.id);
                          return (
                            <div
                              key={loc.id}
                              onClick={() => toggleLocation(loc.id)}
                              className={cn(
                                "flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all",
                                isSelected 
                                  ? "bg-amber-900/20 border-amber-600/50" 
                                  : "bg-[#14131a] border-blood-900/10 hover:border-blood-900/30"
                              )}
                            >
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 border border-white/5">
                                {loc.referenceImages?.[0] ? (
                                  <img src={loc.referenceImages[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-lg">🏛️</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{loc.name}</p>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">{loc.type}</p>
                              </div>
                              <Checkbox checked={isSelected} className="border-amber-900/50 data-[state=checked]:bg-amber-600" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="mt-0 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Nom du Shot</Label>
                    <Input
                      value={editedShot.name}
                      onChange={(e) => setEditedShot({ ...editedShot, name: e.target.value })}
                      className="bg-[#14131a] border-blood-900/30 focus:border-blood-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Description Narrative</Label>
                    <Textarea
                      value={editedShot.description}
                      onChange={(e) => setEditedShot({ ...editedShot, description: e.target.value })}
                      className="bg-[#14131a] border-blood-900/30 focus:border-blood-600 min-h-[120px]"
                    />
                  </div>
                </TabsContent>

                {/* Technical Tab */}
                <TabsContent value="technical" className="mt-0 space-y-6">
                  <div className="p-4 bg-amber-900/10 border border-amber-900/20 rounded-xl">
                    <p className="text-xs text-amber-400 leading-relaxed">
                      <strong>Note SOTA:</strong> Les paramètres techniques sont désormais gérés via le standard JSON MOOSTIK pour garantir une qualité cinématographique constante.
                    </p>
                  </div>
                  <div className="bg-[#14131a] border border-blood-900/20 rounded-xl p-6">
                    <pre className="text-xs text-zinc-500 font-mono whitespace-pre-wrap">
                      {JSON.stringify(editedShot.prompt, null, 2)}
                    </pre>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Right Sidebar - Preview */}
          <div className="w-96 border-l border-blood-900/30 bg-[#0b0b0e]/50 flex flex-col">
            <div className="p-6 border-b border-blood-900/30">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Aperçu du Prompt</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-[#14131a] border border-blood-900/10 rounded-xl p-4">
                <p className="text-[11px] text-zinc-400 font-mono leading-relaxed whitespace-pre-wrap">
                  {previewText}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 border-t border-blood-900/30 bg-[#0b0b0e]/95">
          <Button variant="ghost" onClick={onClose} className="text-zinc-500 hover:text-white">
            Annuler
          </Button>
          <Button onClick={handleSave} className="moostik-btn-blood text-white px-8 font-bold">
            Sauvegarder les modifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
