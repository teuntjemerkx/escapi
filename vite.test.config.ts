// Testserver zonder herladen (andere agenten wijzigen bestanden terwijl ik test).
import { defineConfig, mergeConfig } from 'vite';
import basis from './vite.config';

export default mergeConfig(basis, defineConfig({ server: { hmr: false, watch: { ignored: ['**/*'] } } }));
