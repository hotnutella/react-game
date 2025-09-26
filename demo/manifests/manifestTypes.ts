// Auto-generated from manifest files in demo/manifests
// Do not edit manually - regenerated when manifests change

import { useManifest } from '../../src/manifest';

export interface Level1ManifestAssets {
  platform: string;
  spike: string;
  coin: string;
  door: string;
  key: string;
}

export interface MyManifestAssets {
  sample_icon: string;
  hero: string;
  enemy: string;
  background: string;
  door: string;
}

export interface UiManifestAssets {
  button_primary: string;
  button_secondary: string;
  menu_background: string;
  close_icon: string;
}

export function useLevel1Manifest() {
  return useManifest<Level1ManifestAssets>('/manifests/level-1-manifest.json');
}

export function useMyManifest() {
  return useManifest<MyManifestAssets>('/manifests/my_manifest.json');
}

export function useUiManifest() {
  return useManifest<UiManifestAssets>('/manifests/ui_manifest.json');
}

// Export type map for easy access
export type ManifestTypes = {
  'level-1-manifest': Level1ManifestAssets;
  'my_manifest': MyManifestAssets;
  'ui_manifest': UiManifestAssets;
};
