import { contextBridge, ipcRenderer } from "electron";

interface OpenDialogOptions {
  properties: string[];
  title: string;
}

export function exposeElectronAPIContext() {
  contextBridge.exposeInMainWorld("electronAPI", {
    showOpenDialog: async (options: OpenDialogOptions) => {
      return await ipcRenderer.invoke("show-open-dialog", options);
    },
  });
}
